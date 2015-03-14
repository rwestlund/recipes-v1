/*
Copyright (c) 2015, Randy Westlund.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Recipe = require('../models/recipe');
var Comment = require('../models/comment');

// GET comments by recipe id
router.get('/:recipe_id', function(req, res, next) {
    console.log('got request for comments on ', req.params.recipe_id);
    Comment.find({ recipeId: req.params.recipe_id }).sort('_id').exec(
        function(err, comments) {
            if (err) return next(err);
            console.log('found comments:', comments.length);
            res.send(comments);
        }
     );
});

// PUT changes to a comment
router.put('/:recipe_id/:comment_id', function(req, res, next) {
    // user must be logged in
    if (!req.user) return res.status(401).end();
    console.log('got request to PUT comment', req.params.comment_id);

    Comment.findById(req.params.comment_id, function(err, comment) {
        if (err) return next(err);
        // only fancy people or owner
        if (!(req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
            || req.user._id.equals(comment.authorId)))
            return res.status(403).end();
        console.log('updating comment');

        // delete id field or mongo will throw an exception
        delete req.body._id;
        // bump version, save old one for query
        // TODO use markModified()
        var version = req.body.__v;
        req.body.__v = req.body.__v === undefined ? 1 : req.body.__v + 1;
        // update record
        Comment.findOneAndUpdate({ _id: req.params.comment_id, __v: version },
            req.body, function(err, comment) {
                if(err) return next(err);
                // if version didn't match, send 409 conflict
                if (!comment) return res.status(409).end();

                console.log('updated comment');
                res.send(comment);
            }
        );
    });
});

// POST a new comment
router.post('/:recipe_id', function(req, res, next) {
    // user must be logged in
    if (!req.user) return res.status(401).end();

    // exclude GUESTS
    if (!(req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
        || req.user.role === 'USER'))
        return res.send(403);

    // make sure there's data
    if (!req.body.text) return res.status(400).end();

    console.log('got post for new comment');
    console.dir(req.body);

    // make sure recipe exists
    Recipe.findById(req.params.recipe_id).count(function(err, count) {
        if (err) return next(err);
        if (!count) return res.status(404).end();

        var comment = new Comment();
        comment.authorId = req.user._id;
        comment.recipeId = req.params.recipe_id;
        comment.text = req.body.text;
        console.dir(comment);
        comment.save(function(err) {
            if (err) return next(err);
            console.dir(comment);
            res.send(comment);
        });
    });
});

// DELETE a comment
router.delete('/:recipe_id/:comment_id', function(req, res, next) {
    // user must be logged in
    if (!req.user) return res.status(401).end();
    console.log('got request to delete comment', req.params.comment_id);

    Comment.findById(req.params.comment_id, function(err, comment) {
        if (err) return next(err);
        // only fancy people or owner
        if (!(req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
            || req.user._id.equals(comment.authorId)))
            return res.send(403);
        console.log('removing comment');

        Comment.findByIdAndRemove(req.params.comment_id, function(err, num) {
            if (err) return next(err);
            res.status(200).end();
        });
    });
});

module.exports = router;
