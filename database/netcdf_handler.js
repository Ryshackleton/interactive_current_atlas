/**
 * Created by ryshackleton on 1/9/17.
 */

var netcdf4 = require("netcdf4");

/**
 * Gets an array of node level data (usually, the u,v,w vector components of current data)
 *          which are structured by {variableName} -> time[0..n=24] -> siglay[0..n=10] -> node[0..n=9013]
 * @param params:  daynum: which day of January 2006 (1-31), which delineates which file to parse
 *                  varname: top level variable name such as u,v,w, salinity, temperature
 *                  time: index of time (hour) in the day to return
 *                  siglay: index of the sigma layer to grab data from (0=top layer, 9=bottom layer)
 *
 * @return Returns the an array of size n=9013 with the node level data associated with a given
 *          hourly time interval at a given sigma layer (siglay)
 */
netcdf4.getNodeLevelVariable = function(params)
{
  // error checking
  if( typeof params.daynum === "undefined" ) { throw new Error("params.daynum undefined"); }
  if( isNaN(+params.daynum) ) { throw new Error("Day number must be an integer between 1-31, input was: "+params.daynum); }
  if( +params.daynum < 1 || +params.daynum > 31 ) { throw new Error("Day index out of range(1-31)"); }
  if( typeof params.varname === "undefined" ) { throw new Error("params.varname undefined"); }
  if( typeof params.time === "undefined" ) { throw new Error("params.time undefined"); }
  if( isNaN(+params.time) ) { throw new Error("Time value must be an integer between 0-23, input was: "+params.time); }
  if( +params.time < 0 || +params.time > 23 ) { throw new Error("Time index out of range (0-23)"); }
  if( typeof params.siglay === "undefined" ) { throw new Error("params.siglay undefined"); }
  if( isNaN(+params.siglay) ) { throw new Error("Sigma layer (siglay) must be an integer between (0-9), input was: "+params.siglay); }
  if( +params.siglay < 0 || +params.siglay > 9 ) { throw new Error("Sigma layer index out of range (0-9)"); }
      
  try
  {
    // pick the appropriate file by date
    var filename = './public/assets/data/3DCurrents_psm_' + (+params.daynum < 10 ? '000' : '00') + (+params.daynum) + '.nc';

    var subfile = new netcdf4.File(filename, "r");
    if( typeof subfile.root === 'undefined' )
    {
      throw new Error("File: " + filename + " does not exist");
    }

    // get the appropriate variable, which will be structured variable(time,siglay,node)
    var myVar = subfile.root.variables[params.varname];
    
    if( typeof myVar === 'undefined' )
    {
      throw new Error("Variable: " + params.varname + " does not exist");
    }
    else
    {
      // This is the somewhat confusing "hyperslab" method of returning values in netcdf files
      // https://www.unidata.ucar.edu/software/netcdf/docs/programming_notes.html#specify_hyperslab
      // https://github.com/swillner/netcdf4-js
      // each pair of parameters in sequence refers to (start index of the dimension, how many dimensions to include)
      //  so here we're saying: start index of a given time increment (0-23), and include only 1 time slice,
      //  ...then within that time slice, start at a given sigma layer (0-9) and include only 1 sigma layer,
      //  ...then within that sigma layer, return all node values from 0..n nodes where n=9013.
      return myVar.readSlice(+params.time, 1, +params.siglay, 1, 0, myVar.dimensions[2].length);
    }
  }
  catch (e)
  {
    // catch the generic error thrown by readSlice when data is invalid and display some more useful text
    if( e.message === 'Operation not permitted' )
    {
      throw new Error('Invalid input. Check input parameters for non-numeric characters or invalid variable names');
    }
    else
    {
      throw new Error(e.message);
    }
  }
};

/**
 * Gets an array of top level data (usually, the X,Y node position components of current data)
 *          which are structured by {variableName} -> node[0..n=9013]
 * @param params:  daynum: which day of January 2006, which delineates which file to parse
 *                  varname: top level variable name such as X,Y,siglay,h,time
 *
 * @return Returns the an array variable level data (size of array depends on variable)
 */
netcdf4.getTopLevelArrayVariable = function(daynum,varname)
{
  if( typeof daynum === "undefined" ) { throw new Error("daynum undefined"); }
  if( isNaN(+daynum) ) { throw new Error("Day number must be an integer between 1-31, input was: "+daynum); }
  if( +daynum < 1 || +daynum > 31 ) { throw new Error("Day index out of range(1-31)"); }
  if( typeof varname === "undefined" ) { throw new Error("varname undefined"); }
  
  try
  {
    var filename = './public/assets/data/3DCurrents_psm_' + (parseInt(daynum) < 10 ? '000' : '00') + daynum + '.nc';
    var subfile = new netcdf4.File(filename, "r");
    
    var myVar = subfile.root.variables[varname];
    if( typeof myVar === 'undefined' )
    {
      throw new Error('Variable does not exist in the nefcdf file'); // just throw to self
    }

    // This is the somewhat confusing "hyperslab" method of returning values in netcdf files
    // https://www.unidata.ucar.edu/software/netcdf/docs/programming_notes.html#specify_hyperslab
    // https://github.com/swillner/netcdf4-js
    // each pair of parameters in sequence refers to (start index of the dimension, how many dimensions to include)
    //  so here there is only 1 dimension of the data we're querying,
    // so we start at index=0 and return all values up to the size (length) of the 0th dimension
    return  myVar.readSlice(0, myVar.dimensions[0].length);
  }
  catch (e)
  {
    // catch the generic error thrown by readSlice when data is invalid and display some more useful text
    if( e.message === 'Operation not permitted' )
    {
      throw new Error('Invalid input. Check input parameters for non-numeric characters or invalid variable names');
    }
    else
    {
      throw e;
    }
  }
};

module.exports = netcdf4;



