var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('got home page request');
    res.render('layout');
});

module.exports = router;
