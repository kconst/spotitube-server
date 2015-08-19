var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('auth', { display_name: 'Kyle' });
});

module.exports = router;
