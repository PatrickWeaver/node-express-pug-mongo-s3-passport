var express = require("express")
var router = express.Router()
var mongoose = require('mongoose');
var templateData = require("../helpers/template-data")();

// S3 Variables and Config:
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  signatureVersion: 'v4'
});
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var bucketName = process.env.S3BUCKET;
var multer = require("multer");
var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
	storage: memoryStorage,
	limits: {
		filesize: 20*1024*1024,
		files: 1
	}
}).single("file");

const uuidv1 = require('uuid/v1');

// Mongo config:
var db = mongoose.connect(process.env.MONGODB_URI);

// Models
var Upload = require("../models/upload");

function getSignedUrlS3(bucketName, key) {
  return s3.getSignedUrl("getObject", {Bucket: bucketName, Key: key});
}

// Routes
router.get("/", function(req, res) {
  if (req.query.k && req.query.b) {

    // Using Pre Signed URL:
    templateData.url = getSignedUrlS3(req.query.b, req.query.k);
    res.render("upload/index", templateData);
  } else {
    res.render("upload/new", templateData);
  }
});

router.get("/all", function(req, res) {
  
  var perPage = 5;
  var page = (req.query.page - 1) || 0;
  
  Upload.count({}, getPage);
  
  
  function getPage(err, count) {
    if (!err){
      templateData.pages = (count / perPage) + 1;
      var callback = function(err, data) {
        if (!err) {
          templateData.uploads = [];
          for (var i in data) {
            templateData.uploads.push(getSignedUrlS3(data[i].bucketName, data[i].key));
          }
          res.render("upload/all", templateData);
        } else {
          resError(req, res, "Can't get uploads");
        }
      }

      Upload.
      find().
      limit(perPage).
      skip(page * perPage).
      sort('-uploadDate').
      exec(callback)
    } else {
      resError(req, res, "Can't get uploads"); 
    }
  };
});


router.post("/", memoryUpload, function(req, res) {
  var error = false;
  var errorMessage = "";
  if (req.body.password == process.env.PASSWORD) {
    var file = req.file;
    var filetype = file.mimetype;
    var fileExtArr = filetype.split("/");
    var fileExt = fileExtArr[fileExtArr.length - 1];
    //var filename = file.originalname;
    var date = new Date;
    var id = uuidv1();
    
    var params = {
      Bucket: bucketName,
      Key: id + "." + fileExt,
      Body: file.buffer,
      ContentType: filetype
    };

    s3.putObject(params, function(err, templateData) {
      if (err) {
        resError(req, res, err);
        return;
      } else {
        
        var newFile = {
          bucketName: bucketName,
          key: params.Key,
          filetype: filetype,
          uploadDate: date
        }
        
        var dbUpload = new Upload(newFile);
        
        
        dbUpload.save(function(err, data) {
          if (!err && data.key) {
            res.status(200);
            res.redirect(req.baseUrl + "?b=" + data.bucketName + "&k=" + data.key);
          } else {
            res.status(400);
            resError("Error saving to Database");
          }
        });
        
      }
    });    
  } else {
    resError(req, res, "Wrong password");
    return;
  }
});


function resError(req, res, message) {
  res.status(400);
  res.send("Error: " + message);
}

module.exports = router