var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Upload = new Schema({
  bucketName     : String,
  key            : String,
  filetype       : String,
  uploadDate     : Date
});

module.exports = mongoose.model("Upload", Upload);