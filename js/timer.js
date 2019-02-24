const {config} = require('./config.js');

exports.timer = (function() {
    let delay = null;
    let interval = null; 

    async function setDelay() {
       delay = await config.readConfig('DELAY'); 
    }

    async function removeInterval() {
        await setDelay();
        if(interval !== null) {
            clearInterval(interval);
            interval = null;
            return true;
        }
        return false;
    }
    
    async function startInterval(action) {
        await removeInterval();
        await setDelay();
        if(delay !== false) {
            interval = setInterval(action, delay);
        }
    }

    return {
        start: startInterval,
        stop: removeInterval
    }

})();
