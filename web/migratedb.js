#!/usr/local/bin/node
'use strict';

var mongoose = require('mongoose');
var pg = require('pg')
var async = require('async');

var config = require('./config/config');
var User = require('./models/user');
var Recipe = require('./models/recipe');


mongoose.connect(config.mongo_connection_string);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

pg.connect({ user: 'pgsql', database: 'recipes' }, function(err, client, done) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    // map old ids to new ones
    var author_map = {};
    var recipe_map = {};

	async.series([
        function(next) {
            client.query('BEGIN', next);
        // insert old users
	    }, function(next) {
            User.find(function(err, users) {
                if (err) return next(err);
                console.log('users found: ' + users.length);
                async.eachSeries(users, function(user, next2) {
                    client.query("INSERT INTO users "
                            + "(email, name, role, creation_date, lastlog) "
                            + "VALUES ($1, $2, $3, $4, $5) "
                            + "RETURNING id",
                            [ user.email,
                            user.name || null,
                            user.role.charAt(0) + user.role.slice(1).toLowerCase(),
                            user._id.getTimestamp(),
                            user.lastlog ],
                        // fill author map
                        function(err, result) {
                            if (err) return next2(err);
                            author_map[user.id] = result.rows[0].id;
                            next2();
                        }
                    );

                }, next);
             });
        }, function(next) {
            Recipe.find(function(err, recipes) {
                console.log('recipes found', recipes.length);

                // iterate once to insert recipes and tags
                async.eachSeries(recipes, function(recipe, next2) {
                    client.query("INSERT INTO recipes "
                            + "(revision, amount, author_id, directions, "
                            + "ingredients, notes, oven, source, summary, "
                            + "time, title) "
                            + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, "
                                + "$10, $11)"
                            + "RETURNING id",
                            [ recipe.__v, recipe.amount,
                            author_map[recipe.authorId],
                            JSON.stringify(recipe.directions),
                            JSON.stringify(recipe.ingredients), recipe.notes,
                            recipe.oven, recipe.source, recipe.summary,
                            recipe.time, recipe.title ],
                        function(err, result) {
                            if (err) return next2(err);
                            var recipe_id = result.rows[0].id;
                            recipe_map[recipe.id] = recipe_id;

                            // insert all tags for this recipe
                            async.eachSeries(recipe.tags, function(tag, next3) {
                                client.query("INSERT INTO tags (recipe_id, tag) "
                                        + "VALUES ($1, $2)",
                                        [ recipe_id, tag ],
                                        next3);
                            }, next2);
                        }
                    );
                }, next);
            });
        // iterate once more for linked recipes
        }, function(next) {
            Recipe.find(function(err, recipes) {
                console.log('recipes found', recipes.length);

                async.eachSeries(recipes, function(recipe, next2) {
                    async.eachSeries(recipe.linked, function(linked, next3) {
                        client.query("INSERT INTO linked_recipes (src, dest) "
                                + "VALUES ($1, $2)",
                                [ recipe_map[recipe.id], recipe_map[linked] ],
                                next3);
                    }, next2);
                }, next);
            });
        }, function(next) {
            client.query('COMMIT', next);
        }], function(err) {
            done();
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log('success');
            process.exit(0);
        }
    );
});
