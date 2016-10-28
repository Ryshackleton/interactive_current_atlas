var express = require('express');
var engine = require('ejs-locals');
var path = require('path');

var routes = require('./routes/index');

var app = express();

// view engine
app.set('views', path.join(__dirname, 'views' ));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use(function(req,res,next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// dev error handler
if( app.get('env') === 'development' ) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500 );
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

//app.get('/', function(request,response) {
//    response.sendFile(__dirname + "/public/index.html");
//    response.end();
//});


// make our app an exportable,
// app.listen(8000) will be called from bin/www
module.exports = app;
