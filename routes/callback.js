var keys = require('../keys.json');
var network = require('../network.json');
var express = require('express');
var router = express.Router();

var querystring = require('querystring');
var request = require('request'); // "Request" library

var stateKey = 'spotify_auth_state';

var client_id = keys.spotify.client_id; // Your client id
var client_secret = keys.spotify.secret; // Your client secret
var youtube_client_id = keys.youtube.client_id; // Your client id
var youtube_secret = keys.youtube.secret;

var redirect_uri_youtube = network.server + '/cb_youtube';

router.get('/', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null,
        state = req.query.state || null,
        storedState = req.cookies ? req.cookies[stateKey] : null,
        authOptions;

    if (state === null || (state !== storedState && req.baseUrl !== '/cb_youtube')) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);

        switch(req.baseUrl) {
            case '/cb_spotify':
                authOptions = {
                    url: 'https://accounts.spotify.com/api/token',
                    form: {
                        code: code,
                        redirect_uri: network.server + '/cb_spotify',
                        grant_type: 'authorization_code'
                    },
                    headers: {
                        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                    },
                    json: true
                };
                break;

            case '/cb_youtube':
                authOptions = {
                    form : {
                        client_id : youtube_client_id,
                        client_secret : youtube_secret,
                        redirect_uri : redirect_uri_youtube,
                        grant_type : 'authorization_code',
                        code : req.query.code
                    },
                    url : 'https://accounts.google.com/o/oauth2/token',
                    json: true
                };

                break;

            default:
                // do nothing!
                break;
        }

        request.post(authOptions, function(error, response, body) {
            var access_token,
                refresh_token,
                options;

            if (!error && response.statusCode === 200) {
                access_token = body.access_token;
                refresh_token = body.refresh_token;

                switch(req.baseUrl) {
                    case '/cb_spotify':
                        options = {
                            url: 'https://api.spotify.com/v1/me',
                            headers: { 'Authorization': 'Bearer ' + access_token },
                            json: true
                        };

                        // we can also pass the token to the browser to make requests from there
                        res.redirect(network.client + '/?spotify_cb=true&' +
                            querystring.stringify({
                                access_token: access_token,
                                refresh_token: refresh_token
                            })
                        );
                        break;

                    case '/cb_youtube':
                        // we can also pass the token to the browser to make requests from there
                        res.redirect(network.client + '/?youtube_cb=true&' +
                            querystring.stringify({
                                access_token: access_token/*,
                                refresh_token: refresh_token*/
                            })
                        );
                        break;

                    default:
                        // do nothing!
                        break;
                }
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

module.exports = router;
