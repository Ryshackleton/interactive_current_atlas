var express = require('express')
  , path = require('path')
  , router = express.Router()
  , netcdfhdl = require('../database/netcdf_handler');


// default map using leaflet (also home or index)
var renderLeaflet = function(request,response){
  response.render('leaflet_map', { paneltitle: 'Interactive Current Atlas (Leaflet)', leafletactive: 'class=active', mapsactive: ''
    });
};

router.route('/')
  .get(renderLeaflet);
router.route('/maps_leaflet')
  .get(renderLeaflet);

// google map
router.route('/maps_google')
  .get(function(request,response){
    response.render('gmaps', { paneltitle: 'Interactive Current Atlas: (Google Map)', leafletactive: '', mapsactive: 'class=active' });
  });

router.route('/netcdf/:daynum/:varname/:time/:siglay')
.get(function(request,response)
{
  try {
    return response.json(netcdfhdl.getNodeLevelVariable(request.params));
  }
  catch (e)
  {
    response.status(400).send('Bad Request: '+e.message);
  }
});

// sample call to parse x,y,attribute data
router.route('/netcdf/:daynum/:varname')
.get(
     function(request,response)
 {
   try
   {
     return response.json(netcdfhdl.getTopLevelArrayVariable(request.params.daynum,request.params.varname));
   }
   catch(e)
   {
     response.status(400).send('Bad Request: '+e.message);
   }
});

module.exports = router;

