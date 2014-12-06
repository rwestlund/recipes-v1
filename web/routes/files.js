var express = require('express');
var router = express.Router();
var async = require('async');


// stream file from DB to client
router.get('/:file_id', function(req, res, next) {
    console.log('got request for file', req.params.file_id);

    // send file if it exists
    req.gfs.exist({ _id: req.params.file_id }, function(err, exists) {
        if (err) return next(err);
        if (!exists) return res.status(404).end();
        req.gfs.createReadStream({ _id: req.params.file_id }).pipe(res);
    });
});

router.delete('/:type/:file_id', function(req, res, next) {
    // access restrictions
    if (!(req.user.role === 'ADMIN' || req.user.role === 'SALESMAN')) {
        console.log(req.user.name, 'may not delete files');
        return res.status(403).end();
    }
    console.log('got request to delete file', req.params.file_id);
    // validate type arg
    if (req.params.type !== 'job' && req.params.type !== 'appointment')
        return res.send(400);

    // find corresponding job
    if (req.params.type === 'job') {
        Job.findOne({ jobFiles: req.params.file_id }, function(err, job) {
            if (err) return next(err);
            if (!job) return res.status(404).end();

            // delete file id form job
            console.log('deleting file from', job.jobNumber);
            job.jobFiles = job.jobFiles.filter(function(file) {
                return file != req.params.file_id;
            });
            // save modified job
            job.save(function(err, data) {
                if (err) return next(err);

                // finally, remove file from DB
                req.gfs.remove({ _id: req.params.file_id }, function(err) {
                    if (err) return next(err);
                    res.status(200).end();
                });
            });
        });
    }
    // find corresponding appt
    else {
        Appointment.findOne({ jobFiles: req.params.file_id },
        function(err, appt) {
            if (err) return next(err);
            if (!appt) return res.status(404).end();

            // delete file id form appt
            console.log('deleting file from appointment', appt.id);
            appt.jobFiles = appt.jobFiles.filter(function(file) {
                return file != req.params.file_id;
            });
            // save modified appt
            appt.save(function(err, data) {
                if (err) return next(err);

                // finally, remove file from DB
                req.gfs.remove({ _id: req.params.file_id }, function(err) {
                    if (err) return next(err);
                    res.status(200).end();
                });
            });
        });
    }
});


router.post('/:type/:id', function(req, res, next) {
    // access restrictions
    if (!(req.user.role === 'ADMIN' || req.user.role === 'SALESMAN')) {
        console.log(req.user.name, 'may not upload files');
        return res.status(403).end();
    }
    // validate type arg
    if (req.params.type !== 'job' && req.params.type !== 'appointment')
        return res.send(400);
    console.log('file upload received');
    console.log(req.params);

    // one of these will be populated
    var job;
    var appointment;
    async.series([
        // if job, make sure job exists
        function(callback) {
            if (req.params.type !== 'job') return callback();
            Job.findById(req.params.id, function(err, found_job) {
                job = found_job;
                if (err) return callback(err);
                if (!job) {
                    res.status(400);
                    return callback(new Error('Job does not exist'));
                }
                // found it successfully
                callback();
            });
        }, function(callback) {
            if (req.params.type !== 'appointment') return callback();
            Appointment.findById(req.params.id,
                function(err, appt) {
                    appointment = appt;
                    if (err) return callback(err);
                    if (!appointment) {
                        res.status(400);
                        return callback(new Error('Appointment does not exist'));
                    }
                    console.log('found appointment');
                    // found it successfully
                    callback();
                }
            );
        // now, handle file uploads
        }, function(callback) {
            req.busboy.on('file',
                function(fieldname, file_stream, filename, encoding, mimetype) {
                    console.log('saving', filename);

                    // create stream to DB
                    var write_stream = req.gfs.createWriteStream({
                        filename: filename,
                        mode: 'w',
                        content_type: mimetype,
                        metadata: { description: '' },
                    })
                    // get file object
                    .on('close', function(file) {
                        console.log('saved file:');
                        console.dir(file);

                        // define function to catch data for either type
                        var catch_data = function(err, data) {
                            // if err saving to job, try to delete to avoid orpnan
                            if (err) {
                                req.gfs.remove({ _id: file._id});
                                return callback(err);
                            }
                            console.log(data.jobItems);
                            // create id field, to match model for UI
                            file.id = String(file._id);
                            // reply once everything is good
                            res.send(file);
                            callback();
                        };

                        // save either the job or appointment
                        if (req.params.type === 'job') {
                            job.jobFiles.push(file._id);
                            job.save(catch_data);
                        }
                        else {
                            appointment.jobFiles.push(file._id);
                            appointment.save(catch_data);
                        }

                    });
                    // connect streams and send to DB
                    file_stream.pipe(write_stream);
                }
            );

            req.busboy.on('error', function(err) {
                console.log('error uploading');
                return callback(err);
            });
            
            // send data through busboy
            return req.pipe(req.busboy);
                    
            //TODO do I need an on('finish') function?
        }
    // async err handler
    ], function(err) {
        if (err) return next(err);
    });
});



module.exports = router;
