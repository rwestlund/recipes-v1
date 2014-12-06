var mongoose = require('mongoose');

var my_string = { type: String, default: '', trim: true };

var file_schema = new mongoose.Schema({
    filename: my_string,
    length: { type: Number },
    chunkSize: { type: Number },
    uploadDate: { type: Date },
    md5: my_string,
    contentType: my_string,
    metadata: {
        description: my_string,
    },
}, { collection: 'fs.files' });

file_schema.set('toObject', { virtuals: true });
file_schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('FileInfo', file_schema);
