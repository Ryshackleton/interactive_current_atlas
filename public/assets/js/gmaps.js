/**
 * Created by ryshackleton on 8/30/16.
 * initGoogleMaps modified from Creative Tim's
 *  "light bootstrap dashboard template"
 *
 *  Requires: notifications.js for notification handling
 */

gmaps = {

    initGoogleMaps: function () {

        let mapOptions = gmaps.getMapOptions(); // map with no center option
        let notification = notifications.topCenter('info',4000,'Finding your location...')
        let spinner = progress_spinner.startSpinnerOnDiv('map');

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {

                spinner.stop();

                mapOptions.center = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                let map = new google.maps.Map(document.getElementById("map"), mapOptions);

                let infoWindow = new google.maps.InfoWindow({map: map});
                infoWindow.setPosition(map.getCenter());
                infoWindow.setContent('You are here.');

                // close old notification
                notification.close();

                // confirm success
                notifications.topCenter('success',2000,"Location found!");

            }, function() {
                // close old notification
                notification.close();
                spinner.stop();

                // confirm success
                notifications.topCenter('warning',2000,"The geolocation service failed");
                // handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // close old notification
            notification.close();
            spinner.stop();

            // Browser doesn't support Geolocation
            mapOptions.center = new google.maps.LatLng(0.0,0.0);
            mapOptions.zoom = 3;
            let map = new google.maps.Map(document.getElementById("map"), mapOptions);


            // confirm failure
            notifications.topCenter('warning',2000,'Browser does not allow geolocation.')
        }

    },

    // just getting this out of the way
    getMapOptions: function () {
        return {
            zoom: 13,
            // center: myLatLng,
            scrollwheel: true, //we enable de scroll over the map
            styles: [{
                "featureType": "water",
                "stylers": [{"saturation": 43}, {"lightness": -11}, {"hue": "#0088ff"}]
            }, {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{"hue": "#ff0000"}, {"saturation": -100}, {"lightness": 99}]
            }, {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#808080"}, {"lightness": 54}]
            }, {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ece2d9"}]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ccdca1"}]
            }, {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#767676"}]
            }, {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
            }, {"featureType": "poi", "stylers": [{"visibility": "off"}]}, {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [{"visibility": "on"}, {"color": "#b8cb93"}]
            }, {"featureType": "poi.park", "stylers": [{"visibility": "on"}]}, {
                "featureType": "poi.sports_complex",
                "stylers": [{"visibility": "on"}]
            }, {"featureType": "poi.medical", "stylers": [{"visibility": "on"}]}, {
                "featureType": "poi.business",
                "stylers": [{"visibility": "simplified"}]
            }]
        };

    }
}

