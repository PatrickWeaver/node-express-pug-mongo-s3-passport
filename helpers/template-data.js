module.exports = function() {
  var siteName = process.env.NAME || "node-express-pug-mongo-s3-passport"
  
 return {
    title: process.env.NAME,
    siteName: siteName,
    message: ""
  }
}