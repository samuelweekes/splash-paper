// Modules to control application life and create native browser window
const { app, Menu, Tray, BrowserWindow, ipcMain, ClientRequest } = require('electron');
const url = require('url');
const request = require('request');
const fs = require('fs');
const Config = require('./config.js');
const wallpaper = require('wallpaper');
const ipc = require('electron').ipcMain;

ipc.on('search', function(event, data){
    searchTerm = data;
});

let tray = null;
let searchTerm = 'bear';
app.on('ready', () => {
  tray = new Tray('./icons/icon.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'New Wallpaper', click: function () { getToken(); } },
    { label: 'New Search', click: function() { setSearch(); } }
  ])
  tray.setToolTip('Bear-paper!');
  tray.setContextMenu(contextMenu);
});

function setSearch() {
 let searchWin;
 searchWin = new BrowserWindow({ width: 180, height: 70, 'node-integration': true });
 searchWin.loadFile('index.html');
}

function search(token) {
        console.log('here ' + token);
      searchUrl = new URL('/search/photos', 'https://api.unsplash.com/')
      searchUrl.searchParams.append('query', searchTerm);
      searchUrl.searchParams.append('per_page', '100');
      request.get({
        headers: { 'Authorization': 'Bearer ' + token },
        url: searchUrl
      }, function (error, response, body) {
        console.log('Grabbing wallpaper...');
        image = JSON.parse(body);
        rand = Math.floor((Math.random() * (image.total/image.total_pages) + 1)); 
        download(image.results[rand].links.download, './downloads/' + image.results[rand].id, () => {
           setWallpaper('./downloads/' + image.results[rand].id);
        });
      });
    };

function setWallpaper(image) {
    wallpaper.set(image);
}

function getToken() {
    let path = './config/token.txt';

    if(!fs.existsSync(path)) { 
        login(); 
        return;
    }
    
    fs.readFile('./config/token.txt', (err, token) => {
        if(err) throw err;
        search(token);
    });    
}

function login() {
  const authUrl = new URL('/oauth/authorize', 'https://unsplash.com');
  authUrl.searchParams.append('client_id', Config.CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', Config.REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'public');
  win = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
  win.loadURL(authUrl.href);
  win.show();
  win.webContents.on('will-redirect', function (event, newUrl) {
    let redirectUrl = new URL(newUrl);
    let code = redirectUrl.searchParams.get('code');
    const postUrl = new URL('/oauth/token', 'https://unsplash.com');
    postUrl.searchParams.append('client_id', Config.CLIENT_ID);
    postUrl.searchParams.append('client_secret', Config.SECRET_KEY);
    postUrl.searchParams.append('redirect_uri', Config.REDIRECT_URI);
    postUrl.searchParams.append('code', code);
    postUrl.searchParams.append('grant_type', "authorization_code");
    
    request.post({
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      url: postUrl,
    }, function (error, response, body) {
      json = JSON.parse(body);
      token = json.access_token;
        fs.writeFile('./config/token.txt', token, (err) => {
            if(err) throw err;
            console.log('Token saved');
            search(token);
        });
      });
    });
 return false; 
}

function download(uri, filename, callback){
   request.head(uri, function(err, res, body){
     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
   });
 }
