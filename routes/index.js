var express = require('express');
var path = require('path');
var router = express.Router();

/* GET index route */
// '..' går et niveau op fra routes til app roden og derfra ind i public mappen
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = router;