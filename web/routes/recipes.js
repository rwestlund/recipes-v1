var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Recipe = require('../models/recipe');

/* GET recipe listing. */
router.get('/', function(req, res, next) {
    console.log('got request for recipe listing');
    Recipe.find().sort('title').exec(function(err, recipes) {
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
            if (!recipe) return res.status(404).end();
            console.log(recipe.title);
            res.send(recipe);
        }
     );
});

// PUT changes to a recipe record
router.put('/:recipe_id', function(req, res, next) {
    // user must be logged in
    if (!req.user) return res.status(401).end();

    console.log('got PUT request for ' + req.body.title);

    if (req.body.id != req.params.recipe_id) {
        console.log('param ' + req.params.recipe_id
            + ' does not match body id ' + req.body.id);
        return res.send(400);
    }
    
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
        if (err) return next(err);
        // only fancy people or owner
        if (!(req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
            || req.user._id.equals(recipe.authorId)))
            return res.send(403);

        // tags and ingredients lowercase
        if (req.body.tags) {
            req.body.tags = req.body.tags.map(function(tag) {
                return tag.toLowerCase();
            });
        }
        if (req.body.ingredients) {
            req.body.ingredients = req.body.ingredients.map(function(item) {
                return item.toLowerCase();
            });
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
});

// POST a new recipe
// generally, client will make empty POST request, fill out object, then PUT
router.post('/', function(req, res, next) {
    // user must be logged in
    if (!req.user) return res.status(401).end();
    if (!(req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
        || req.user.role === 'USER'))
        return res.send(403);

    console.log('got post for new recipe');
    console.dir(req.body);

    var recipe = new Recipe();
    recipe.authorId = req.user._id;
    recipe.ingredients.push('');
    recipe.directions.push('');
    recipe.save(function(err) {
        if (err) return next(err);
        console.dir(recipe);
        res.send(recipe);
    });
});

// DELETE a recipe
router.delete('/:recipe_id', function(req, res, next) {
    // user must be logged in
    if (!req.user) return res.status(401).end();
    console.log('got request to delete recipe', req.params.recipe_id);

    Recipe.findById(req.params.recipe_id, function(err, recipe) {
        if (err) return next(err);
        // only fancy people or owner
        if (!(req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
            || req.user._id.equals(recipe.authorId)))
            return res.send(403);

        Recipe.findByIdAndRemove(req.params.recipe_id, function(err, num) {
            if (err) return next(err);
            if (!num)  return res.send(404, 'recipe not found');
            res.status(200).end();
        });
    });
});


module.exports = router;
