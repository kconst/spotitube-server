var express = require('express');
var router = express.Router();
var querystring = require('querystring');

var stateKey = 'spotify_auth_state';

var client_id = 'ba5b2615ce414440948c106752da0185'; // Your client id
var client_secret = 'f51c3f284bd34125bbcab83ade3e1ccb'; // Your client secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

router.get('/', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = router;
