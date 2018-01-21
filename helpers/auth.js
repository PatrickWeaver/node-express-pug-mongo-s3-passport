var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;


module.exports = function() {

  var records = [
    {
      id: 1, username: "admin",
      password: process.env.ADMIN_PASSWORD,
      displayName: 'Admin',
      emails: [
        {
          value: process.env.ADMIN_EMAIL
        }
      ]
    }
  ];

  var findById = function(id, cb) {
    process.nextTick(function() {
      var idx = id - 1;
      if (records[idx]) {
        cb(null, records[idx]);
      } else {
        cb(new Error('User ' + id + ' does not exist'));
      }
    });
  }


  var findByUsername = function(username, cb) {
    process.nextTick(function() {
      for (var i = 0, len = records.length; i < len; i++) {
        var record = records[i];
        if (record.username === username) {
          return cb(null, record);
        }
      }
      return cb(null, null);
    });
  }


  passport.use(new Strategy(
    function(username, password, cb) {
      findByUsername(username, function(err, user) {
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (user.password != password) { return cb(null, false); }
        return cb(null, user);
      });
    }
  ));

  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });
  
}