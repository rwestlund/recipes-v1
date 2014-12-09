var express = require('express');
var router = express.Router();
var async = require('async');
var User = require('../models/user');

// GET users listing
router.get('/', function(req, res, next) {
    // open to anyone, be careful about what to send
    console.log('got request for users listing');
    User.find(function(err, users) {
        if (err) return next(err);
        console.log('total users found: ' + users.length);
        res.send(users);
     });
});

// GET a user
router.get('/:user_id', function(req, res, next) {
    // open to anyone, be careful about what to send
    console.log('got request for user', req.params.user_id);
    User.findById(req.params.user_id, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(404).end();
        res.send(user);
     });
});


// POST a new user
router.post('/', function(req, res, next) {
    // access restrictions
    if (!req.user) return res.status(401).end();
    if (req.user.role !== 'ADMIN') {
        console.log(req.user.name, 'may not create users');
        return res.status(403).end();
    }

    console.log('got request for new user');
    console.dir(req.body);

    var user = new User();
    user.email = req.body.email;
    user.role = req.body.role;

    console.dir(user);
    user.save(function(err) {
        if (err) return next(err);
        console.dir(user);
        res.send(user);
    });
});

// PUT user list
router.put('/', function(req, res, next) {
    // access restrictions
    if (!req.user) return res.status(401).end();
    if (req.user.role !== 'ADMIN') {
        console.log(req.user.name, 'may not modify users');
        return res.send(403);
    }

    console.log('got updated user list');
    console.dir(req.body);

    // holds updated users
    var new_users = [];

    async.each(req.body, function(user, callback) {
        // remove _id field or else mongo will throw an exception
        delete user._id;
        User.findByIdAndUpdate(user.id, user,
            function(err, new_user) {
                if (err) return callback(err);
                console.log('updated', new_user.email);
                new_users.push(new_user);
                callback();
            }
        );
    },
    // async err handler
    function(err) {
        if (err) return next(err);
        console.log('all updates completed');
        console.dir(new_users);
        res.send(new_users);
    });
});


// DELETE USER
router.delete('/:user_id', function(req, res, next) {
    // access restrictions
    if (!req.user) return res.status(401).end();
    if (req.user.role !== 'ADMIN') {
        console.log(req.user.name, 'may not delete users');
        return res.status(403).end()
    }

    console.log('got request to delete user', req.params.user_id);

    User.findByIdAndRemove(req.params.user_id, function(err, num) {
        if (err) return next(err);
        if (!num)  return res.send(404, 'user not found');
        res.status(200).end();
    });
});

module.exports = router;
