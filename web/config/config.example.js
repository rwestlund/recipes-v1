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

// Copy this file to config.js and set parameters for node
var config = {
    // Google OAuth 2.0 settings from console.developers.google.com.  You must
    // create a project, generate a client id and secret, and authorize your callback URL.
    google_client_id: '',
    google_client_secret: '',

    // Change the URL to match your domain.  Google will send OAuth here.
    callback_url: 'https://example.com/oauth2callback',

    // A reverse proxy (like nginx) should send all http and https traffic
    // here over http.  Let nginx handle the TLS.
    http_port: 80,

    // Location of MongoDB -- assumes trust auth from localhost.
    mongo_connection_string: 'mongodb://localhost/recipes',

    // When recipes starts, a default admin account will be set up if no users
    // exist (use your google account).
    default_admin: 'example@gmail.com',
};

module.exports = config;
