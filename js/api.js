const request = require('request');
const wallpaper = require('wallpaper');
const {config} = require('./config.js');
const {BrowserWindow} = require('electron');
const fs = require('fs');

exports.api = (function() {

    let apiConfig = null;
    const maxImages = 100;

    async function setConfig() {
        apiConfig = await config.readConfig();
        console.table(apiConfig);
        if(apiConfig.TOKEN === null || apiConfig.TOKEN === undefined) {
            auth();      
            return true;
        }
    } 

    function makeAuthUrl() {
        const url = new URL('/oauth/authorize', 'https://unsplash.com');
        
        url.searchParams.append('client_id', apiConfig.CLIENT_ID);
        url.searchParams.append('redirect_uri', apiConfig.REDIRECT_URI);
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('scope', 'public');
        return url;
    }

    function makeTokenUrl(redirect) {
        let redirectUrl = new URL(redirect);
        let code = redirectUrl.searchParams.get('code');

        const url = new URL('/oauth/token', 'https://unsplash.com');

        url.searchParams.append('client_id', apiConfig.CLIENT_ID);
        url.searchParams.append('client_secret', apiConfig.SECRET_KEY);
        url.searchParams.append('redirect_uri', apiConfig.REDIRECT_URI);
        url.searchParams.append('code', code);
        url.searchParams.append('grant_type', "authorization_code");
        return url;
    }

    async function makeSearchUrl() {
        url = new URL('/search/photos', 'https://api.unsplash.com/');
        search = await config.readConfig('SEARCH');
        url.searchParams.append('query', search);
        url.searchParams.append('per_page', maxImages);
        return url;
    }

    function download(uri, filename, callback){
        request.head(uri, function(err, res, body){
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    }

    function auth() {
        authUrl = makeAuthUrl();
        authWin = new BrowserWindow({ 
            width: 800,
            height: 600,
            show: false, 
            'node-integration': false 
        });
        authWin.loadURL(authUrl.href);
        authWin.show();

        authWin.webContents.on('will-redirect', function (event, redirect) {
            tokenUrl = makeTokenUrl(redirect);
            request.post({
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                url: tokenUrl 
            }, function (error, response, body) {
                json = JSON.parse(body);
                apiConfig.TOKEN = json.access_token;
                config.setConfig({key : 'TOKEN', value : json.access_token});
            });
        });
    }

    async function setWallpaper(imagePath) {
        let overwrite = await config.readConfig('OVERWRITE');
        if(overwrite === true) {
            currentWallpaper = await wallpaper.get();
            if(fs.existsSync(currentWallpaper)) {
              fs.unlinkSync(currentWallpaper);
              console.log('Removed previous wallpaper: ' + currentWallpaper);
            }
        }
        wallpaper.set(imagePath);
    }

    async function getImage() {
        let search = await makeSearchUrl();
        let path = await config.readConfig('PATH');
        request.get({
            headers: { 'Authorization': 'Bearer ' + apiConfig.TOKEN},
            url: search 
            }, function (error, response, body) {
                images = JSON.parse(body);
                rand = Math.floor((Math.random() * (images.total/images.total_pages) + 1)); 
                downloadPath = path + images.results[rand].id;
                download(
                    images.results[rand].links.download,
                    downloadPath,
                    () => {setWallpaper(downloadPath)}
                );
         });
    };

    return {
        getImage : getImage, 
        setConfig : setConfig,
    }
})();
