const { ipcRenderer } = require('electron');

if(document.getElementsByTagName('code') !== null) {
    const code = document.getElementsByTagName('code')[0];
}

ipcRenderer.on('code', (event, args) => {
    event.sender.send(code, args); 
    code.innerHTML; 
});    

if(document.querySelector('#search') !== null) {
    document.querySelector('#search').focus();
    document.querySelector('#search').addEventListener('keydown', function(e) {
        if(e.keyCode == 13) {
            ipcRenderer.send('search', this.value);
        }
    });
}

if(document.querySelector('#path') !== null) {
    document.querySelector('#path').focus();
    document.querySelector('#path').addEventListener('keydown', function(e) {
        if(e.keyCode == 13) {
            ipcRenderer.send('path', this.value);
        }
    });
}
