var mongoose = require('mongoose');

var my_string = { type: String, default: '', trim: true };

var comment_schema = new mongoose.Schema({
    authorId: mongoose.Schema.Types.ObjectId,
    recipeId: mongoose.Schema.Types.ObjectId,
    text: my_string,
});

// include virtual fields when sending the object places
comment_schema.set('toObject', { virtuals: true });
comment_schema.set('toJSON', { virtuals: true });

// creation date
comment_schema.virtual('timestamp').get(function() {
    return this._id.getTimestamp();
});


module.exports = mongoose.model('Comment', comment_schema);
