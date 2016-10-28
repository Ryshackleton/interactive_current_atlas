var express = require('express');
var router = express.Router();

router.get('/', function(req,res) {
  res.render('index', {
    title: 'Interactive Current Atlas',
    indexactive: true
  });
});

module.exports = router;
