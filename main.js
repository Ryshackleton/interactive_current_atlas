var express = require('express')
    , ECT = require('ect')
    , path = require('path')

    , routes = require('./routes/all')

    , bodyParser = require('body-parser')

    , app = express();

//parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));

var ectRenderer = ECT({watch: true, root:__dirname+'/views', ext: '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use(function(req,res)
{
  res.status(404)
    .render('error',
    {
      message: 'Not found',
      error: 'Error'
    });
});

// make our app exportable,
// app.listen(8000) called from bin/www
module.exports = app

