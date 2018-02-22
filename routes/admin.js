var express = require("express")
var router = express.Router()
var templateData = require("../helpers/template-data")();
var passport = require('passport');

function redirectToProfile(req, res) {
  res.redirect(req.baseUrl + '/profile');
}

function redirectToLogin(req, res) {
  res.redirect(req.baseUrl + '/login');
}

/*
/admin -- No content here, should redirect to
either /admin/login if they are not logged in or
//admin/profile if they are logged in.
*/
router.get('/', function(req, res) {
  if (req.user) {
    redirectToProfile(req, res);
  } else {
    redirectToLogin(req, res);
  }
});

/*
/admin/login -- If they are logged in redirect to profile
if they are not logged in should show the login form.
*/
router.get('/login',
  function(req, res){
    if (req.user){
      redirectToProfile(req, res);
    } else {
      res.render('admin/login', templateData);
    }
  }
);

/*
POST for /admin/login -- This is where the admin form goes,
if the login is invalid redirect to /admin/login/invalid, otherwise
redirect to /admin/profile
*/
router.post('/login', 
  passport.authenticate('local', { failureRedirect: 'login/invalid' }),
  function(req, res) {
    redirectToProfile(req, res)
  }
);

/*
Middle route between failed login and /admin/login, adds a message
to the templateData and then redirects to /admin/login
*/
router.get('/login/invalid', function(req, res){
  templateData.message = "Invalid Login";
  redirectToLogin(req, res);
});
  
/*
/admin/logout -- logs out and then redirects to /admin/login
*/
router.get('/logout', function(req, res){
  req.logout();
  redirectToLogin(req, res);
});

/*
/admin/profile -- checks that they are logged in and then renders
profile, otherwise redirects to /admin/login
*/
router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn('login'),
  function(req, res){
    templateData.user = req.user;
    res.render('admin/profile', templateData);
  }
);


module.exports = router