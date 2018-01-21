var express = require("express")
var router = express.Router()
var templateData = require("../helpers/template-data")();
var passport = require('passport');

router.get('/', function(req, res) {
  if (req.user) {
    res.redirect(req.baseUrl + '/profile');
  } else {
    res.redirect(req.baseUrl + '/login');
  }
});

router.get('/login',
  function(req, res){
    if (!req.user){
      res.render('admin/login', templateData);
    } else {
      res.redirect(req.baseUrl + '/profile');
    }
  }
);
  
router.post('/login', 
  passport.authenticate('local', { failureRedirect: 'login/invalid' }),
  function(req, res) {
    res.redirect(req.baseUrl + '/profile');
  }
);


router.get('/login/invalid', function(req, res){
  res.send('<h1>Invalid Login</h1><a href="./">Login</a>');
});
  

router.get('/logout', function(req, res){
  req.logout();
  res.redirect(req.baseUrl + '/login');
});


router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn('login'),
  function(req, res){
    templateData.user = req.user;
    res.render('admin/profile', templateData);
  }
);


module.exports = router