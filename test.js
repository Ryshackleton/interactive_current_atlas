var request = require('supertest')
  , app = require('./main')
  , chai = require('chai')
  , should = chai.should()
  , chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Requests to the root path', function ()
{
  it('returns a 200 status code', function(done)
  {
    request(app)
      .get('/')
      .expect(200)
      .end(function(error) {
          if(error){ throw error; }
          done();
      });
  });
  it('returns HTML format', function(done)
  {
    request(app)
      .get('/')
      .expect('Content-Type', /html/, done)
      .end(function(error) {
        if(error){ throw error; }
        done();
      });
  });

});

describe('Requests to /maps_leaflet', function ()
{
  it('returns a 200 status code', function(done)
  {
    request(app)
      .get('/maps_leaflet')
      .expect(200)
      .end(function(error)
      {
          if(error){ throw error; }
          done();
      });
  });

  it('returns HTML format', function(done)
  {
    request(app)
      .get('/maps_leaflet')
      .expect('Content-Type', /html/, done);
  });
});

describe('Generic erroneous call to server', function()
{
  it('returns the error page', function(done)
  {
    request(app)
      .get('/badcall')
      .expect(404, done);
  });
  
  it('returns the error page in HTML format', function(done)
  {
    request(app)
      .get('/badcall')
      .expect('Content-Type', /html/, done);
  });
});

describe('Calls to retrieve netcdf data: top level data', function()
{
  it('Return error if invalid variable is passed', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/InvalidVariable')
      .end(function(err,res)
      {
        // there should be no errors
        should.exist(err);
        // there should be a 400 status code (bad request)
        res.status.should.equal(400);
        // the response should be text
        res.type.should.equal('text/html');
        done();
      });
  });
  it('Bad call to server: /netcdf/1/ no variable parameter passed should return generic 404 error', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/')
      .end(function(err,res)
      {
        // there should be no errors
        should.exist(err);
        // there should be a 404 status code (bad request)
        res.status.should.equal(404);
        // the response should be text
        res.type.should.equal('text/html');
        done();
      });
  });
  it('Correct call for X variable data from server should retrieve an array of size 9013: /netcdf/1/X', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/X')
      .end(function(err,res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k) { return res.body[k]; });
        parsed.length.should.equal(9013);
        done();
      });
  });
  it('Correct call for Y variable data from server should retrieve an array of size 9013: /netcdf/1/Y', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/Y')
      .end(function(err,res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k) { return res.body[k]; });
        parsed.length.should.equal(9013);
        done();
      });
  });
  it('Correct call for h variable data from server should retrieve an array of size 9013: /netcdf/1/h', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/h')
      .end(function(err,res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k) { return res.body[k]; });
        parsed.length.should.equal(9013);
        done();
      });
  });
  it('Correct call for time variable data from server should retrieve an array of size 10: /netcdf/1/time', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/time')
      .end(function(err,res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k) { return res.body[k]; });
        parsed.length.should.equal(24);
        done();
      });
  });
  it('Correct call for siglay variable data from server should retrieve an array of size 10: /netcdf/1/siglay', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/siglay')
      .end(function(err,res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k) { return res.body[k]; });
        parsed.length.should.equal(10);
        done();
      });
  });
});


describe('Calls to retrieve netcdf data: Input date variable must be between 1-31 for named files to be correctly parsed', function()
{
  it('Return error if date value is non numeric: /netcdf/InvalidDateValue/X', function(done)
  {
    chai.request(app)
      .get('/netcdf/InvalidDateValue/X')
      .end(function(err, res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code (bad request)
        res.status.should.equal(400);
        // the response should be text
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Day number must be an integer between 1-31, input was: InvalidDateValue');
        done();
      });
    
  });
  it('Return error if date value is out of range: 0 : /netcdf/0/X', function(done)
  {
    chai.request(app)
      .get('/netcdf/0/X')
      .end(function(err, res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code (bad request)
        res.status.should.equal(400);
        // the response should be text
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Day index out of range(1-31)');
        done();
      });
    
  });
  it('Return error if date value is out of range: > 31 : /netcdf/32/X', function(done)
  {
    chai.request(app)
      .get('/netcdf/32/X')
      .end(function(err, res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code (bad request)
        res.status.should.equal(400);
        // the response should be text
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Day index out of range(1-31)');
        done();
      });
  });
  
  for(var i = 1; i < 32; i++)
  {
    (function(i)
    {
      it('Return valid array of 9013 numbers when date value is in range: /netcdf/' + i + '/X', function(done)
      {
        chai.request(app)
          .get('/netcdf/' + i + '/X')
          .end(function(err, res)
          {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            should.exist(res.body);
            var parsed = Object.keys(res.body).map(function(k)
            {
              return res.body[k];
            });
            parsed.length.should.equal(9013);
            done();
          });
      });
    })(i);
  }
});

describe('Calls to retrieve netcdf data: get subgroup data - variable name', function()
{
  it('Call to invalid variable returns error: /netcdf/1/NonExistentVariable/1/1/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/NonExistentVariable/1/1/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Variable: NonExistentVariable does not exist');
        done();
      });
  });
  it('Call to valid variable name u return a valid array of 9013 numbers: /netcdf/1/u/1/1', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/1/1')
      .end(function(err, res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k)
        {
          return res.body[k];
        });
        parsed.length.should.equal(9013);
        done();
      });
  });
  it('Call to valid variable name v return a valid array of 9013 numbers: /netcdf/1/v/1/1', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/v/1/1')
      .end(function(err, res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k)
        {
          return res.body[k];
        });
        parsed.length.should.equal(9013);
        done();
      });
  });
  it('Call to valid variable name w return a valid array of 9013 numbers: /netcdf/1/w/1/1', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/w/1/1')
      .end(function(err, res)
      {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        should.exist(res.body);
        var parsed = Object.keys(res.body).map(function(k)
        {
          return res.body[k];
        });
        parsed.length.should.equal(9013);
        done();
      });
  });
});

describe('Calls to retrieve netcdf data: get subgroup data - time variable valid and in range', function()
{
  it('Call to non-numeric time variable returns error: /netcdf/1/u/InvalidTime/1/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/InvalidTime/1/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Time value must be an integer between 0-23, input was: InvalidTime');
        done();
      });
  });
  it('Call to time value < 0 returns error: /netcdf/1/u/-1/1/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/-1/1/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Time index out of range (0-23)');
        done();
      });
  });
  it('Call to time value > 23 returns error: /netcdf/1/u/24/1/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/24/1/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Time index out of range (0-23)');
        done();
      });
  });
  for(var i = 0; i < 24; i++)
  {
    (function(i)
    {
      it('Return valid array of 9013 numbers when time value is in range: /netcdf/1/u/' + i + '/1', function(done)
      {
        chai.request(app)
          .get('/netcdf/1/u/' + i + '/1')
          .end(function(err, res)
          {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            should.exist(res.body);
            var parsed = Object.keys(res.body).map(function(k)
            {
              return res.body[k];
            });
            parsed.length.should.equal(9013);
            done();
          });
      });
    })(i)
  }
});

describe('Calls to retrieve netcdf data: get subgroup data - siglay variable valid and in range', function()
{
  it('Call to non-numeric siglay variable returns error: /netcdf/1/u/1/InvalidSiglay/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/1/InvalidSiglay/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Sigma layer (siglay) must be an integer between (0-9), input was: InvalidSiglay');
        done();
      });
  });
  it('Call to siglay value < 0 returns error: /netcdf/1/u/1/-1/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/1/-1/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Sigma layer index out of range (0-9)');
        done();
      });
  });
  it('Call to siglay value > 9 returns error: /netcdf/1/u/1/10/', function(done)
  {
    chai.request(app)
      .get('/netcdf/1/u/1/10/')
      .end(function(err,res)
      {
        // there should be errors
        should.exist(err);
        // there should be a 400 status code
        res.status.should.equal(400);
        // the response should be html
        res.type.should.equal('text/html');
        res.text.should.equal('Bad Request: Sigma layer index out of range (0-9)');
        done();
      });
  });
  for(var i = 0; i < 10; i++)
  {
    (function(i)
    {
      it('Return valid array of 9013 numbers when time value is in range: /netcdf/1/u/1/' + i , function(done)
      {
        chai.request(app)
          .get('/netcdf/1/u/1/' + i )
          .end(function(err, res)
          {
            // there should be no errors
            should.not.exist(err);
            // there should be a 200 status code
            res.status.should.equal(200);
            // the response should be JSON
            res.type.should.equal('application/json');
            should.exist(res.body);
            var parsed = Object.keys(res.body).map(function(k)
            {
              return res.body[k];
            });
            parsed.length.should.equal(9013);
            done();
          });
      });
    })(i)
  }
});
