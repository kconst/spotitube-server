var express = require('express');
var router = express.Router();
var querystring = require('querystring');



router.get('/', function(req, res) {
    var state = generateRandomString(16);
    var stateKey = 'spotify_auth_state';

    var spotify_client_id = 'ba5b2615ce414440948c106752da0185'; // Your client id
    var spotify_secret = 'f51c3f284bd34125bbcab83ade3e1ccb'; // Your client secret

    var youtube_client_id = '698516020401-j4q118gppsa4cqoiac1aiiql57hlagdp.apps.googleusercontent.com'; // Your client id

    var youtube_secret = 'pCsEz5Ey-zkQ0fYCA25rx8KK';

    var redirect_uri_youtube = 'https://spotitube-kconst.c9users.io:8080/cb_youtube';
    res.cookie(stateKey, state);

    // your application requests authorization
    switch(req.baseUrl) {
        case '/login_spotify':
            res.redirect('https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: spotify_client_id,
                    scope: 'user-read-private user-read-email',
                    redirect_uri: 'https://spotitube-kconst.c9users.io:8080/cb_spotify',
                    state: state
                }));
            break;

        case '/login_youtube':
            res.redirect('https://accounts.google.com/o/oauth2/auth?' +
                querystring.stringify({
                    client_id : youtube_client_id,
                    redirect_uri : redirect_uri_youtube,
                    state : 'good',
                    response_type : 'code',
                    scope : 'https://www.googleapis.com/auth/youtube.readonly'
                }));
            break;

        default:
            // do nothing!
            break;
    }


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
