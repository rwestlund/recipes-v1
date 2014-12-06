var express = require('express');
var router = express.Router();
var Recipe = require('../models/recipe');
var User = require('../models/user');

router.get('/recipe', function(req, res, next) {
    res.send( new Recipe() );
});
router.get('/user', function(req, res, next) {
    res.send( new User() );
});

module.exports = router;
