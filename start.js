const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'credentials.json';
var NodeWebcam = require( "node-webcam" );
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
var Webcam = NodeWebcam.create({});

// Load client secrets from a local file.
fs.readFile('client_secret.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {

  const drive = google.drive({version: 'v3', auth});



  setInterval(function() {

    NodeWebcam.capture( "cp_temp", {}, function( err, data ) {
        if ( !err ) {
          drive.files.update({
            fileId: '1T360CGHHyaY1Ei5RbPekDkPUiHP4FMit',
            media: {
              mimeType: 'image/jpeg',
              body: fs.createReadStream('cp_temp.jpg') // read streams are awesome!
            }
          }, false);

          drive.revisions.list({
            fileId: '1T360CGHHyaY1Ei5RbPekDkPUiHP4FMit',
          }, (err, {data}) => {
            if (err) return console.log('The API returned an error: ' + err);
            const revs = data.revisions;
            if (revs.length>1) {
            //   console.log('Files:');

                for (var i = 0; i < revs.length-1; i++) {
                  console.log(revs[i].id);
                  drive.revisions.delete({
                    fileId: '1T360CGHHyaY1Ei5RbPekDkPUiHP4FMit',
                    revisionId: revs[i].id
                  }, false);
                }
            } else {
              console.log('No odd revs');
            }
          });
        }
    });

  }, 5000);
  setInterval(function() {

    NodeWebcam.capture( "cp_lapse", {}, function( err, data ) {
        if ( !err ){
          drive.files.create({
            resource: {
              name: Date.now()+'.jpg',
              mimeType: 'image/jpeg',
              parents: ["15DPIov5BRzExm-oqs52JMXecVtDt1nSy"]
            },
            media: {
              mimeType: 'image/jpeg',
              body: fs.createReadStream('cp_lapse.jpg') // read streams are awesome!
            }
          }, false);
        }
    });

  }, 6000);
}
