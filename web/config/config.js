var config = {
    // oauth 2 stuff
    google_client_id: '670361988141-7alk7durrhl5s9camd6ak55ptcu1fivk.apps.googleusercontent.com',
    google_client_secret: 'JdG7CD18GOyEV7VbgkEIH8Jg',
    CALLBACK_URL: 'https://legion.textplain.net:4333/oauth2callback',

    // ports
    //HTTP_PORT: 80,
    //HTTPS_PORT: 443,
    HTTP_PORT: 8087,
    HTTPS_PORT:4333,
    server_url: 'https://legion.textplain.net:4333',

    // DB location
    //mongo_connection_string: 'mongodb://192.168.10.254/cta-general',
    mongo_connection_string: 'mongodb://localhost/recipes',
    DEFAULT_ADMIN: 'rwestlun@gmail.com',
};

module.exports = config;
