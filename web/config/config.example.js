// Copy this file to config.js and set parameters for node
var config = {
    // Google OAuth 2.0 settings from console.developers.google.com.  You must
    // create a project, generate a client id and secret, and authorize your callback URL.
    google_client_id: '670361988141-7alk7durrhl5s9camd6ak55ptcu1fivk.apps.googleusercontent.com',
    google_client_secret: 'JdG7CD18GOyEV7VbgkEIH8Jg',

    // Change the URL to match your domain.  Google will send OAuth here.
    callback_url: 'https://recipes.textplain.net/oauth2callback',

    // A reverse proxy (like nginx) should send all http and https traffic
    // here over http.  Let nginx handle the TLS.
    http_port: 80,

    // Location of MongoDB -- assumes trust auth from localhost.
    mongo_connection_string: 'mongodb://localhost/recipes',

    // When recipes starts, a default admin account will be set up if no users
    // exist (use your google account).
    default_admin: 'rwestlun@gmail.com',
};

module.exports = config;
