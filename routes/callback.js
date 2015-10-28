var express = require('express');
var router = express.Router();

var querystring = require('querystring');
var request = require('request'); // "Request" library

var stateKey = 'spotify_auth_state';
var client_id = 'ba5b2615ce414440948c106752da0185'; // Your client id
var client_secret = 'f51c3f284bd34125bbcab83ade3e1ccb'; // Your client secret
var youtube_client_id = '698516020401-j4q118gppsa4cqoiac1aiiql57hlagdp.apps.googleusercontent.com';
var youtube_client_secret = 'pCsEz5Ey-zkQ0fYCA25rx8KK';

var redirect_uri_youtube = 'http://localhost:3000/cb_youtube';

router.get('/', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null,
        state = req.query.state || null,
        storedState = req.cookies ? req.cookies[stateKey] : null,
        authOptions;

    if ((state === null || state !== storedState) && req.baseUrl !== '/cb_youtube') {
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
                        redirect_uri: 'http://localhost:3000/cb_spotify',
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
                    url: 'https://accounts.google.com/o/oauth2/auth',
                    form: {
                        //code: code,
                        response_type: 'code',
                        redirect_uri: 'http://localhost:3000/cb_youtube',
                        //grant_type: 'authorization_code',
                        client_id : youtube_client_id,
                        /*
                        client_secret : youtube_client_secret,*/
                        scope: 'https://www.googleapis.com/auth/youtube.readonly'
                },
                    /*headers: {
                        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                    },*/
                    json: true
                };
                break;

            default:
                // do nothing!
                break;
        }

       /* if (req.baseUrl === '/cb_spotify') {
            options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };
        } else {
            options = {
                url: 'https://www.googleapis.com/youtube/v3/search',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };
        }*/

        request.post(authOptions, function(error, response, body) {
            var access_token,
                refresh_token,
                options;

            if (!error && response.statusCode === 200) {
                access_token = body.access_token;
                refresh_token = body.refresh_token;

                switch(req.baseUrl) {
                    case '/cb_spotify':
                        // we can also pass the token to the browser to make requests from there
                        res.redirect('http://localhost:9000/#/loginSpotify/' +
                            querystring.stringify({
                                access_token: access_token,
                                refresh_token: refresh_token
                            })
                        );
                        break;

                    case '/cb_youtube':
                        res.redirect('http://localhost:9000/#/loginYoutube/' +
                            querystring.stringify({
                                access_token: access_token,
                                refresh_token: refresh_token
                            })
                        );
                        break;

                    default:
                        // do nothing!
                        break;
                }

                /*res.json({
                    access_token : access_token,
                    refresh_token : refresh_token
                });*/
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
