var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/index', function(req, res, next) {
    res.render('index');
});
router.get('/recipes', function(req, res) {
    res.render('recipes');
});
router.get('/recipe', function(req, res, next) {
    res.render('recipe');
});
router.get('/users', function(req, res, next) {
    res.render('users');
});
router.get('/modal', function(req, res, next) {
    res.render('modal');
});
router.get('/unauthorized', function(req, res, next) {
    res.render('unauthorized');
});
router.get('/404', function(req, res, next) {
    res.render('404');
});

module.exports = router;
