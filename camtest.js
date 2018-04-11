var NodeWebcam = require( "node-webcam" );
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  "334046095403-gc2jdgsim4f5ci9i98simf4h6q1saoqk.apps.googleusercontent.com",
  "yxADmVmBEoW33Mf9Rx6PTxZD",
  "http://localhost"
);
const fs = require('fs');
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

var opts = {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false
};

var NodeWebcam = require( "node-webcam" );
var Webcam = NodeWebcam.create({});

NodeWebcam.capture( "cp_temp", {}, function( err, data ) {
    if ( !err ) console.log( "Image created!" );
});


drive.files.create({
  resource: {
    name: 'cp_temp.jpg',
    mimeType: 'image/jpeg'
  },
  media: {
    mimeType: 'image/jpeg',
    body: fs.createReadStream('cp_temp.jpg') // read streams are awesome!
  }
}, false);
