const fs = require('fs');

exports.config = (function() {
    
    const configFile = '../config/config.js'; 
    
    async function readConfig(key = false) {
        let config = await (() => {
            return new Promise((resolve, reject) => {
                fs.readFile(configFile, (err, config) => {
                    if (err){
                        reject(err);
                    } else {
                        resolve(JSON.parse(config));
                    }
                });     
            });
        })();       
        return key ? config[key] : config;
    }

    async function writeConfig(config) {

        if(config['PATH'].slice(-1) !== '/') {
            config['PATH'] += '/';
        }

        let writeConfig = fs.writeFile(configFile, JSON.stringify(config), (err, response) => {
            if(err) throw err;
            return true;
        });        
        return false;
    }
    
    async function setConfig (configObject) {
        let config = await readConfig(); 
        let key = configObject.key;
        config[key] = configObject.value;
 
        return await writeConfig(config); 
    }

    init : return {
        setConfig : setConfig,
        readConfig : readConfig
    }
})();
