var express = require("express");
var app = express();
var path = require("path");

const pug = require("pug");
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');

var auth = require("./helpers/auth")();

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.AUTH_SECRET, resave: false, saveUninitialized: false }));

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static("public"));


// - - - -
// Routes:
// - - - -
var templateData = require("./helpers/template-data")();

app.get("/", function(req, res) { 
  res.render("index", templateData); 
});

// Admin
var adminRouter = require("./routes/admin")
app.use("/admin", adminRouter);
app.get("/login", function(req, res) {
  res.redirect("/admin/login");
});
app.get("/logout", function(req, res) {
  res.redirect("/admin/logout");
});

// Uploads
var uploadRouter = require("./routes/upload");
app.use("/upload", uploadRouter);



var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
