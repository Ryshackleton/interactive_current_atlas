/**
 * Created by ryshackleton on 9/14/16.
 */


leaflet_local = (function () {

    <!-- some constants -->
    const DEFAULT_LOCATION = [47.538178, -122.493966]; // default location, centered over Blake Island in Puget Sound at the moment

    return {

        /**
         * main method to build the map
         *
         * @param mapDivTag: name of the div tag in html to add the map to
         * @param doNotify: true/false flag to indicate whether to send popup notifications to the user
         * @return none
         */
        initMap: function (mapDivTag, doNotify) {

            let myspin = progress_spinner.startSpinnerOnDiv(mapDivTag); // geolocation takes a sec, start progress spin

            let notification = undefined;
            if (doNotify) {
                notification = notifications.topCenter('info', 4000, '<strong>Finding your location...</strong>');
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {

                    // handle notifications
                    if (doNotify) {
                        handleLocationNotification(notification, 'success', 1000, "<strong>Location found!</strong><p>Use the location control button to the left show your location on the map.</p>");
                    }

                    // kill running spinner
                    myspin.stop();

                    buildMap([position.coords.latitude, position.coords.longitude], 11);
                }, function () {
                    if (doNotify) {
                        handleLocationNotification(notification, 'warning', 1000, "The geolocation service failed.");
                    }

                    // kill running spinner
                    myspin.stop();

                    buildMap(DEFAULT_LOCATION, 11);
                });
            } else {
                // handle notifications
                if (doNotify) {
                    handleLocationNotification(notification, 'warning', 1000, 'Browser does not allow geolocation.');
                }

                // kill running spinner
                myspin.stop();

                buildMap(DEFAULT_LOCATION, 11);
            }


            /**
             * just kills the existing notification and initiates a new one
             * @param notification: existing notification to close
             * @param tagLevel: flag to indicate warning, success, etc
             * @param timeout: time in ms to maintain the notification
             * @param message: message to send to the user
             * @return none
             */
            function handleLocationNotification(notification, tagLevel, timeout, message) {
                if (notification != undefined) {
                    notification.close();
                }

                notifications.topCenter(tagLevel, timeout, message);
            }

            /**
             * does the actual leaflet map building
             * @param ll: [lat,long] array with the lat/longs
             * @param zoomLevel: zoom level to initiate map
             * @return a reference to the map once building is complete
             */
            function buildMap(ll, zoomlevel) {

                // MAP OVERLAYS
                //mapbox version of satellite layer
                let satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/ryshackleton/cite1mkkb004t2jp2dt3ymh7m/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnlzaGFja2xldG9uIiwiYSI6ImNpdGR6cmZ6ZTAzN2MyeG85YmV3Z2w2dzcifQ.4t8LHLkY-jt8VUDIyoV4TQ');

                // BATHYMETRY AND NAVIGATION
                // basic esri ocean, collating all labels to one layergroup
                let oceanLayer = L.layerGroup([L.esri.basemapLayer('Oceans'), L.esri.basemapLayer('OceansLabels')]);

                // topo layer, which has contour lines showing bathymetry at some zoom levels
                let usaTopo = L.esri.basemapLayer('USATopo');

                // navigational charts, will be transparent and always as an optional overlay
                let navCharts = L.esri.imageMapLayer({
                    url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer',
                    opacity: 0.35,
                    transparent: true,
                    zindex: 2
                });

                let OpenSeaMap = L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
                    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
                });

                // BUILD BASEMAP GROUP
                let baseMaps = {
                    // "OSM Street Map" : streetMap,
                    "Satellite": satelliteLayer,
                    "Topographic (Bathymetry)": usaTopo,
                    "Shaded Relief (Bathymetry)": oceanLayer,
                };

                // BUILD OVERLAY GROUP
                let overlayMaps = {
                    // "Currents: Lower Low Slack Tide" : lower_low_slack,
                    // "Currents: Mid Tide Large Flood" : mid_large_flood,
                    "OpenSeaMap": OpenSeaMap,
                    "Detailed Navigation Charts": navCharts,
                };
                // Tide Prints from Puget Sound
                let tidePrints = imagetile_handler.defaultPugetTidalCurrentStages();
                for (let stage of tidePrints) {
                    overlayMaps[stage.longName] = stage.leafletTileLayer();
                }

                // CREATE MAP
                // layers added to the map in the layers: array will be toggled on upon loading
                let map = L.map(mapDivTag, {center: ll, zoom: zoomlevel, layers: [oceanLayer]});

                // add a layer control, which lets the user toggle between baseMaps and toggle on/off overlayMaps
                L.control.layers(baseMaps, overlayMaps).addTo(map);

                // add a location controller to the map (adds a little blue dot with your current location)
                // from https://github.com/domoritz/leaflet-locatecontrol
                L.control.locate().addTo(map);

                return map;
            }

            /**
             * method to test arrow icon rotation
             * @param theMap: map instance to add the arrows to
             */
            function setUpRotatingArrowExample(theMap) {
                if (theMap == undefined)
                    return;

                // set up a clickable
                let LeafIcon = L.Icon.extend({
                    options: {
                        message: '',
                        iconSize: [32, 32],
                        iconAnchor: [16, 5]
                    }
                });
                let iconUrls = 'https://cdn1.iconfinder.com/data/icons/prettyoffice/32/',
                    up = new LeafIcon({iconUrl: iconUrls + 'up.png'});

                let degree = 0;

                function onMapClick(e) {
                    // popup
                    //     .setLatLng(e.latlng)
                    //     .setContent("You clicked the map at " + e.latlng.toString())
                    //     .openOn(mymap);

                    degree = degree + 10;
                    let m = L.marker(e.latlng, {icon: up, draggable: false, rotationAngle: degree}).addTo(theMap);
                }

                theMap.on('click', onMapClick);
            }
        }
    }
})();
