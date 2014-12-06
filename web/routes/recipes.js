var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Recipe = require('../models/recipe');

/* GET recipe listing. */
router.get('/', function(req, res, next) {
    console.log('got request for recipe listing');
    Recipe.find(function(err, recipes) {
        if (err) return next(err);
        console.log('total recipes found: ' + recipes.length);
        res.send(recipes);
     });
});

/* GET recipe by id */
router.get('/:recipe_id', function(req, res, next) {
    console.log('got request for recipe ' + req.params.recipe_id);
    Recipe.findById(req.params.recipe_id,
        function(err, recipe) {
            if (err) return next(err);
            if (!customer) return res.status(404).end();
            console.log(recipe.title);
            res.send(recipe);
        }
     );
});

// PUT changes to a recipe record
router.put('/:recipe_id', function(req, res, next) {
    // access restrictions
    if (!(req.user.role === 'ADMIN' || req.user.role === 'SALESMAN')) {
        console.log(req.user.name, 'may not modify recipes');
        return res.send(403);
    }

    console.log('got PUT request for ' + req.body.title);
    if (req.body.id != req.params.recipe_id) {
        console.log('param ' + req.params.recipe_id
            + ' does not match body id ' + req.body.id);
        return res.send(400);
    }
    // delete id field or mongo will throw an exception
    delete req.body._id;
    // bump version, save old one for query
    // TODO use markModified()
    var version = req.body.__v;
    req.body.__v = req.body.__v === undefined ? 1 : req.body.__v + 1;
    // update record
    Recipe.findOneAndUpdate({ _id: req.params.recipe_id, __v: version },
        req.body, function(err, recipe) {
            if(err) return next(err);
            // if version didn't match, send 409 conflict
            if (!recipe) return res.status(409).end();

            console.log('updated', recipe.title);
            res.send(recipe);
        }
    );
});

// POST a new recipe
// generally, client will make empty POST request, fill out object, then PUT
router.post('/', function(req, res, next) {
    // access restrictions
    if (!(req.user.role === 'ADMIN' || req.user.role === 'SALESMAN')) {
        console.log(req.user.name, 'may not create recipes');
        return res.send(403);
    }
    console.log('got post for new recipe');
    console.dir(req.body);

    var recipe = new Recipe();
    recipe.save(function(err) {
        if (err) return next(err);
        console.dir(recipe);
        res.send(recipe);
    });
});

// DELETE a recipe
router.delete('/:recipe_id', function(req, res, next) {
    // access restrictions
    if (!(req.user.role === 'ADMIN' || req.user.role === 'SALESMAN')) {
        console.log(req.user.name, 'may not delete recipes');
        return res.send(403);
    }
    console.log('got request to delete recipe', req.params.recipe_id);

    Recipe.findByIdAndRemove(req.params.recipe_id, function(err, num) {
        if (err) return next(err);
        if (!num)  return res.send(404, 'recipe not found');
        res.status(200).end();
    });
});


module.exports = router;
