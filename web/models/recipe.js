var mongoose = require('mongoose');

var my_string = { type: String, default: '', trim: true };

var recipe_schema = new mongoose.Schema({
    ingredients: [ my_string ],
    directions: [ my_string ],
    tags: [ {type: String, default: '', trim: true, lowercase: true} ],
    title: my_string,
    summary: my_string,
    amount: my_string,
    time: my_string,
    oven: my_string,
    source: my_string,
    notes: my_string,
    authorId: mongoose.Schema.Types.ObjectId,
    linked: [ mongoose.Schema.Types.ObjectId ],
});

// include virtual fields when sending the object places
recipe_schema.set('toObject', { virtuals: true });
recipe_schema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('Recipe', recipe_schema);
