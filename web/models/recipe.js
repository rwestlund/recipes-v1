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

// Definition of a recipe object.

var mongoose = require('mongoose');

var my_string = { type: String, default: '', trim: true };

// all the fields a good recipe needs
var recipe_schema = new mongoose.Schema({
    ingredients: [ my_string ],
    directions: [ my_string ],
    tags: [ {type: String, default: '', trim: true, lowercase: true} ],
    title: my_string,
    summary: my_string,
    amount: my_string,
    time: my_string,
    // bake temp
    oven: my_string,
    // link to original site
    source: my_string,
    notes: my_string,
    // user who submitted it
    authorId: mongoose.Schema.Types.ObjectId,
    // list of linked recipes
    linked: [ mongoose.Schema.Types.ObjectId ],
});

// include virtual fields when sending the object places
recipe_schema.set('toObject', { virtuals: true });
recipe_schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Recipe', recipe_schema);
