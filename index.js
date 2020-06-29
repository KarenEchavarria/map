"use strict";
// require is used because using import implies a longer process
require("dotenv").config();

// Create the script tag, set the appropriate attributes
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.MAPS_API_KEY}&callback=initMap&libraries=places&languaje=es`;
script.defer = true;
script.async = true;

let map;
let bounds;
let infowindow;
const infowindowContent = document.getElementById("infowindow-content");

const SUGGESTED_CATEGORIES_PLACES = [
  {
    icon:
      "https://maps.gstatic.com/mapfiles/place_api/icons/bank_dollar-71.png",
    name: "bank",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
    name: "cafe",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/doctor-71.png",
    name: "hospital",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/library-71.png",
    name: "library",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
    name: "meal_delivery",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/movies-71.png",
    name: "movie_theater",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
    name: "museum",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
    name: "park",
  },
  {
    icon:
      "https://maps.gstatic.com/mapfiles/place_api/icons/pharmacy_cross-71.png",
    name: "pharmacy",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/police-71.png",
    name: "police",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
    name: "restaurant",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
    name: "school",
  },

  {
    icon:
      "https://maps.gstatic.com/mapfiles/place_api/icons/worship_general-71.png",
    name: "tourist_attraction",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
    name: "university",
  },
  {
    icon:
      "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
    name: "veterinary_care",
  },
  {
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
    name: "supermarket",
  },
];

window.initMap = () => {
  let markersArray = [];

  navigator.geolocation.getCurrentPosition(
    handleGeolocationSuccess,
    handleGeolocationError,
    { enableHighAccuracy: true }
  );

  function displaySuggestedCategoriesPlaces(map, center) {
    SUGGESTED_CATEGORIES_PLACES.forEach((category) => {
      const container = document.createElement("div");
      const iconButton = document.createElement("button");
      const nameButton = document.createElement("button");

      container.classList.add("suggested-item-request");
      iconButton.classList.add("suggested-item-icon-request");
      nameButton.classList.add("suggested-item-name-request");

      nameButton.type = "button";
      iconButton.type = "button";

      nameButton.innerText = category.name;

      iconButton.style.backgroundImage = `url(${category.icon})`;

      iconButton.addEventListener("click", (e) => {
        e.preventDefault();
        removeMarkers();
        displaySuggestedPlaces(category.name, map, center);
      });
      nameButton.addEventListener("click", (e) => {
        e.preventDefault();
        removeMarkers();
        displaySuggestedPlaces(category.name, map, center);
      });

      container.appendChild(iconButton);
      container.appendChild(nameButton);
      document.getElementById("suggested-places").appendChild(container);
    });
  }

  function displaySuggestedPlaces(category, map, center) {
    const suggestedPlaces = new google.maps.places.PlacesService(map);

    const request = {
      location: center,
      radius: "1500",
      type: category,
    };
    map.setCenter(center);
    suggestedPlaces.nearbySearch(request, suggestedPlacesResponseHandler);

    removeChildNodes("suggested-places");

    document.getElementsByClassName("left-arrow")[0].classList.remove("hidden");
    document
      .getElementsByClassName("left-arrow")[0]
      .addEventListener("click", () => {
        document
          .getElementsByClassName("left-arrow")[0]
          .classList.add("hidden");
        removeChildNodes("suggested-places");
        displaySuggestedCategoriesPlaces(map, center);
      });
  }

  function makeMarker(result, map) {
    const marker = new google.maps.Marker({
      position: result.geometry.location,
      map: map,
      title: result.name,
      icon: { url: result.icon, scaledSize: new google.maps.Size(30, 30) },
    });
    markersArray = [...markersArray, [result.place_id, marker]];
    infowindowContent.children["place-name"].textContent = result.name;
    infowindowContent.children["place-address"].textContent = result.vicinity;
    marker.addListener("click", () => infowindow.open(map, marker));

    bounds.extend(result.geometry.location);

    map.fitBounds(bounds);
  }

  function animateMarker(markerID) {
    const [selectedMarker] = markersArray.filter(
      (marker) => marker[0] === markerID
    );

    selectedMarker[1].setAnimation(google.maps.Animation.BOUNCE);
    selectedMarker[1].addListener("click", () =>
      selectedMarker[1].setAnimation(null)
    );
  }

  function suggestedPlacesResponseHandler(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      removeChildNodes("suggested-places");
      bounds = new google.maps.LatLngBounds();
      results.forEach((result) => {
        const container = document.createElement("div");
        const itemContainer = document.createElement("div");
        const title = document.createElement("h2");
        const address = document.createElement("p");
        const rating = document.createElement("p");
        const opening = document.createElement("p");
        const img = document.createElement("img");

        result.hasOwnProperty("photos")
          ? (img.src = result.photos[0].getUrl())
          : (img.src = "");

        container.classList.add("suggested-item-response");
        itemContainer.classList.add("suggested-item-cont-response");
        address.classList.add("suggested-item-address-response");
        rating.classList.add("suggested-item-address-response");
        opening.classList.add("suggested-item-address-response");
        img.classList.add("suggested-item-img-response");

        title.id = "suggested-item-title-response";

        title.innerText = result.name;
        address.innerText = result.vicinity;
        rating.innerText = `Puntuación de los usuarios: ${result.rating}`;

        container.addEventListener("click", () =>
          animateMarker(result.place_id)
        );

        container.appendChild(itemContainer);
        itemContainer.appendChild(title);
        itemContainer.appendChild(address);
        itemContainer.appendChild(rating);
        if (result.hasOwnProperty("photos")) container.appendChild(img);
        document.getElementById("suggested-places").appendChild(container);
        makeMarker(result, map);
      });
    } else {
      alert("no hay lugares registrados en esa ubicación");
    }
  }

  function removeChildNodes(parentNodeID) {
    const element = document.getElementById(parentNodeID);

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function removeMarkers() {
    markersArray.forEach((marker) => marker.setMap(null));
  }

  function handleGeolocationSuccess({ coords }) {
    const center = {
      lat: coords.latitude,
      lng: coords.longitude,
    };
    renderMap(center);
  }

  function handleGeolocationError() {
    const center = { lat: -34.60376, lng: -58.38162 };
    renderMap(center);
  }

  function renderMap(center) {
    map = new google.maps.Map(document.getElementById("map"), {
      center,
      zoom: 18,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.RIGHT_TOP,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      fullscreenControl: false,
    });
    bounds = new google.maps.LatLngBounds();
    bounds.extend(center);

    displaySuggestedCategoriesPlaces(map, center);
    const marker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      visible: false,
    });
    const defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(center),
      new google.maps.LatLng(center)
    );
    const options = {
      bounds: defaultBounds,
    };
    const searchBox = new google.maps.places.SearchBox(
      document.getElementById("search-input"),
      options
    );

    infowindow = new google.maps.InfoWindow();
    infowindow.setContent(infowindowContent);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", function () {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener("places_changed", changePlaceInMap);
    function changePlaceInMap() {
      // document.getElementById("left-box").style.zIndex = -1;
      // document.getElementById("map").style.width = "100vw";
      removeChildNodes("suggested-places");
      // map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      //   document.getElementById("search-input")
      // );

      removeMarkers();

      const [place] = searchBox.getPlaces();

      infowindow.close();

      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(18);
      }

      displaySuggestedCategoriesPlaces(map, place.geometry.location);
      console.log(place.geometry.location);

      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      let address;
      if (place.address_components) {
        address = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
            "",
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
            "",
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
            "",
        ].join(" ");
      }

      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent = address;
      infowindow.open(map, marker);
    }
  }
};

// Append the 'script' element to 'head'
document.head.appendChild(script);
