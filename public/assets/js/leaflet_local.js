/**
 * Created by ryshackleton on 9/14/16.
 */

leaflet_local = (function () {

    // some constants 
    const DEFAULT_LOCATION = [47.538178, -122.493966]; // default location, centered over Blake Island in Puget Sound at the moment

    return {

        /**
         * main method to build the map
         *
         * @param mapDivTag: name of the div tag in html to add the map to
         * @param doNotify: true/false flag to indicate whether to send popup notifications to the user
         * @param callback: callback function to call on the newly inititated map object - callback(map)
         * @return none
         */
        initMap: function (mapDivTag, doNotify, callback) {

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

                    let map = buildMap([position.coords.latitude, position.coords.longitude], 11);
                    callback(map);
                }, function () {
                    if (doNotify) {
                        handleLocationNotification(notification, 'warning', 1000, "The geolocation service failed.");
                    }

                    // kill running spinner
                    myspin.stop();

                    let map = buildMap(DEFAULT_LOCATION, 11);
                    callback(map);
                });
            } else {
                // handle notifications
                if (doNotify) {
                    handleLocationNotification(notification, 'warning', 1000, 'Browser does not allow geolocation.');
                }

                // kill running spinner
                myspin.stop();

                let map = buildMap(DEFAULT_LOCATION, 11);
                callback(map);
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
                let oceanLayer = L.esri.basemapLayer('Oceans');

                // topo layer, which has contour lines showing bathymetry at some zoom levels
                let usaTopo = L.esri.basemapLayer('USATopo');

                // navigational charts, will be transparent and always as an optional overlay
                let navCharts = L.esri.imageMapLayer({
                  url: 'https://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer',
                    opacity: 0.35,
                    transparent: true,
                    zindex: 2
                });

                let OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
                    attribution: 'Map data: &copy; <a href="https://www.openseamap.org">OpenSeaMap</a> contributors'
                });

                // BUILD BASEMAP GROUP
                let baseMaps = {
                    // "OSM Street Map" : streetMap,
                    "Shaded Relief (Bathymetry)": oceanLayer,
                    "Topographic (Bathymetry)": usaTopo,
                    "Satellite": satelliteLayer,
                };

                // BUILD OVERLAY GROUP
                let overlayMaps = {
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
                let map = new L.map(mapDivTag, {center: ll, zoom: zoomlevel, layers: [oceanLayer]});

                // add a layer control, which lets the user toggle between baseMaps and toggle on/off overlayMaps
                L.control.layers(baseMaps, overlayMaps).addTo(map);

                // add a location controller to the map (adds a little blue dot with your current location)
                // from https://github.com/domoritz/leaflet-locatecontrol
                L.control.locate({ keepCurrentZoomLevel: true, flyTo: true }).addTo(map);
                
                return map;
            }
        },
  
        /**
         * uses D3.js to overlay an SVG on the map object
         * @param map: map instance to add the arrows to
         * @return a reference to the map once building is complete
         */
        initD3Overlay: function(map)
        {
          if( map === undefined )
            throw new TypeError("The leaflet map must be defined before calling leaflet_local.initD3Overlay");
      
          var svg = d3.select(map.getPanes().overlayPane).append("svg"),
          g = svg.append("g").attr("class", "leaflet-zoom-hide");

          d3.json("/xyjson/", function(error, collection)
          {
              if( error ) throw error;
              
              d3.json("/netcdf/3/u/15/0", function(error, udata){
                  d3.json("/netcdf/3/v/15/0", function(error,vdata)
                  {
                      if(error) throw error;
                      
                      var u = Object.keys(udata).map(function(k) { return +udata[k] });
                      var v = Object.keys(vdata).map(function(k) { return +vdata[k] });
                      
                      var ptArray = JSON.parse(collection);
                      /** Add a LatLng object to each item in the dataset */
                      ptArray.features.forEach(function(d,i)
                      {
                          d.LatLng = new L.LatLng(d.geometry.coordinates[0], d.geometry.coordinates[1]);
                          d.arrowRotation = 90.0 - (Math.atan2(v[i],u[i]) * 180.0 / Math.PI) ;
                          d.arrowScale = Math.sqrt(u[i]*u[i] + v[i]*v[i]);
                      });
    
                      var transform = d3.geo.transform({point: projectPoint})
                          , path = d3.geo.path().projection(transform);
    
                      var feature = g.selectAll("arrow")
                          .data(ptArray.features)
                          .enter().append('text')
                          .attr('font-family', 'FontAwesome')
                          .attr('font-size', function(d)
                          {
                              return d.arrowScale * 1.5 + 'em'
                          })
                          .text(function(d)
                          {
                              return '\uf176'
                          });
    
                      map.on("moveend", update);
                      update();
                      
                      function  projectPoint (x,y)
                      {
                          var point = map.latLngToLayerPoint(new L.LatLng(x,y));
                          this.stream.point(point.x, point.y);
                      }
                      function update()
                      {
                          var bounds = path.bounds(ptArray),
                              topLeft = bounds[0],
                              bottomRight = bounds[1];
        
                          svg .attr("width", bottomRight[0] - topLeft[0])
                              .attr("height", bottomRight[1] - topLeft[1])
                              .style("left", topLeft[0] + "px")
                              .style("top", topLeft[1] + "px");
        
                          g .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        
                          feature.attr("d", path);
        
                          feature.attr("transform",
                              function(d)
                              {
                                  return "translate(" +
                                      map.latLngToLayerPoint(d.LatLng).x + "," +
                                      map.latLngToLayerPoint(d.LatLng).y + ")" +
                                      " rotate(" + d.arrowRotation + ")";
                              }
                          )
                      }
                  });
              });
    
          });
        }
    }
})();
