var express = require('express')
  , router = express.Router();


// default map using leaflet (also home or index)
var renderLeaflet = function(request,response){
    response.render('leaflet_map'
      , { paneltitle: 'Interactive Current Atlas (Leaflet)',
      leafletactive: 'class=active',
      mapsactive: '' });
  };
router.route('/')
  .get(renderLeaflet);
router.route('/maps_leaflet')
  .get(renderLeaflet);

// google map
router.route('/maps_google')
  .get(function(request,response){
    response.render('gmaps', { paneltitle: 'Interactive Current Atlas: (Google Map)',
      leafletactive: '',
      mapsactive: 'class=active'
    });
  });

module.exports = router;
