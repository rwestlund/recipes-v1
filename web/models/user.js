var mongoose = require('mongoose');

var my_string = { type: String, default: '', trim: true };

var user_schema = new mongoose.Schema({
    name: my_string,
    email: { type: String, default: '', trim: true, required: true },
    // GUEST, USER, MODERATOR, ADMIN
    role: { type: String, default: 'GUEST', trim: true, required: true },
    lastlog: { type: Date },
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
