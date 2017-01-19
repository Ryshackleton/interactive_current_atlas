/**
 * Created by ryshackleton on 1/9/17.
 */

var readstream = require("netcdf/fs/readstream");
var readrandom = require("netcdf/fs/readrandom");
var netcdf = require("netcdf");

var file = "/public/assets/data/3DCurrents_psm_0001.nc";
var headerbuffer = readstream(file);

// Read the header of a NetCDF file
netcdf.readheader(headerbuffer, function (header) {
    console.log(JSON.stringify(header, null, 2));
    
    var randombuffer = readrandom(file);
    
    // Read a variable
    netcdf.readvariable(header, randombuffer, 'X', function (err, data) {
      if(err != null) {
        return console.error(err);
      }
      console.log(data);
    });
    
    // Read records
    netcdf.readrecords(header, randombuffer, function (err, data) {
      if(err != null) {
        return console.error(err);
      }
      console.log(data);
    });
});

