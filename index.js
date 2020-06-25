"use strict";
// require is used because using import implies a longer process
require("dotenv").config();

// Create the script tag, set the appropriate attributes
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.MAPS_API_KEY}&callback=initMap&libraries=places&languaje=es`;
script.defer = true;
script.async = true;

window.initMap = () => {
  navigator.geolocation.getCurrentPosition(
    handleGeolocationSuccess,
    handleGeolocationError,
    { enableHighAccuracy: true }
  );

  function handleGeolocationSuccess({ coords }) {
    renderMap({
      lat: coords.latitude,
      lng: coords.longitude,
    });
  }

  function handleGeolocationError() {
    renderMap({ lat: -34.60376, lng: -58.38162 });
  }

  function renderMap(center) {
    const map = new google.maps.Map(document.getElementById("map"), {
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
    const marker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
    });
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    const defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-34.60376, -58.38162),
      new google.maps.LatLng(-34.60376, -58.38162)
    );
    const options = {
      bounds: defaultBounds,
    };
    const searchBox = new google.maps.places.SearchBox(
      document.getElementById("search-input"),
      options
    );

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      document.getElementById("search-input")
    );
    marker.setMap(map);
    infowindow.setContent(infowindowContent);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", function () {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.setFields(["address_components", "geometry", "icon", "name"]);

    searchBox.addListener('places_changed', changePlaceInMap);
    function changePlaceInMap() {
      const [place] = searchBox.getPlaces();
      infowindow.close();
      marker.setVisible(false);

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
  
      infowindowContent.children["place-icon"].src = place.icon;
      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent = address;
      infowindow.open(map, marker);
    }
    
  }
};

// Append the 'script' element to 'head'
document.head.appendChild(script);
