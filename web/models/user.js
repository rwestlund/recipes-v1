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

// Definition of a user object.
var mongoose = require('mongoose');

var my_string = { type: String, default: '', trim: true };

var user_schema = new mongoose.Schema({
    // provided by google
    name: my_string,
    email: { type: String, default: '', trim: true, required: true },
    // GUEST, USER, MODERATOR, or ADMIN
    role: { type: String, default: 'GUEST', trim: true, required: true },
    // time of last API access
    lastlog: { type: Date },
    // token provided by google, used for login
    token: {
        token: my_string,
        timestamp: { type: Date, default: Date.now },
    },
}, { collection: 'users' });

user_schema.virtual('timestamp').get(function() {
    return this._id.getTimestamp();
});

// include virtual fields when sending the object places
user_schema.set('toObject', { virtuals: true });
// don't send tokens to user
user_schema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options) {
        delete ret.token;
        return ret;
    }
});

module.exports = mongoose.model('User', user_schema);
