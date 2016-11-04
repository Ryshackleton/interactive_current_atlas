var express = require('express')
  , ECT = require('ect')
  , path = require('path')

  , routes = require('./routes/all')

  , app = express();

var ectRenderer = ECT({watch: true, root:__dirname+'/views', ext: '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

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

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
                message: err.message,
                error: {}
            });
});

// make our app exportable,
// app.listen(8000) called from bin/www
module.exports = app

