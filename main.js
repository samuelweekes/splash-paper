const {app, dialog, Menu, Tray, BrowserWindow, globalShortcut, ipcMain} = require('electron');
const {config} = require('./config.js');
const {CONSTANTS} = require('./constants.js');
let tray = null;
let pathWin = null;
let searchWin = null;
let contextMenu = null;

app.on('ready', () => {
    globalShortcut.register('Option+Cmd+p', () => {
        console.log('Changing wallpaper...');
    });
    searchWin = new BrowserWindow({
        width: 170,
        height: 50, 
        show: false, 
        frame: false, 
        nodeIntegration: true
    });
    searchWin.on('close', () => {searchWin.hide(); searchWin = null;});
    pathWin = new BrowserWindow({
        width: 170, 
        height: 50, 
        show: false, 
        frame: false, 
        nodeIntegration: true
    });
    pathWin.on('close', () => {pathWin.hide(); pathWin = null;});
    initMenu();
});

ipcMain.on('search', (event, data) => {
    searchWin.hide();
    config.setConfig({key: 'SEARCH', value: data});
    dialog.showErrorBox('Information', 'Setting Saved!')
});

ipcMain.on('path', (event, data) => {
    pathWin.hide();
    config.setConfig({key: 'PATH', value: data});
    dialog.showErrorBox('Information', 'Setting Saved!')
});

async function setToggle(key) {
    let configItem = await config.readConfig();
    return configItem[key] === false ? true : false;
}

async function initMenu() {
        const tray = new Tray('./icons/icon.png');
        tray.setToolTip('Splash-Paper!');
        let menuTemplate = [
            {
                label: 'Get Wallpaper',
                click: () => {console.log('Getting wallpaper...');},
            },
            {
                label: 'Set Search',
                click: () => {
                    if(!searchWin) {
                        searchWin = new BrowserWindow({
                            width: 170,
                            height: 50,
                            show: false, 
                            frame: false,
                            nodeIntegration: true
                        });
                    }
                    searchWin.loadFile('search.html'); 
                    searchWin.show();
                }
            },
            {
                label: 'Set Timer',
                submenu: [
                    {
                        label: 'Hourly',
                        click: () => {config.setConfig({key: 'DELAY', value: CONSTANTS.HOUR})},
                        type: 'radio'
                    },
                    {
                        label: '12 Hours',
                        click: () => {config.setConfig({key: 'DELAY', value: CONSTANTS.HALFDAY})},
                        type: 'radio'
                    },
                    {
                        label: 'Daily',
                        click: () => {config.setConfig({key: 'DELAY', value: CONSTANTS.FULLDAY})},
                        type: 'radio'
                    },
                    {
                        label: 'Weekly',
                        click: () => {config.setConfig({key: 'DELAY', value: CONSTANTS.WEEK})},
                        type: 'radio'
                    }
                ]
            },
            {
                label: 'Set Download',
                submenu: [
                    {
                        label: 'Path',
                        click: () => {
                            if(!pathWin) {
                                pathWin = new BrowserWindow({
                                    width: 170,
                                    height: 50,
                                    show: false,
                                    frame: false,
                                    nodeIntegration: true
                                });
                            }
                            pathWin.loadFile('path.html'); 
                            pathWin.show();
                        }
                    },
                    {
                        label: 'Overwrite',
                        checked: await config.readConfig('OVERWRITE'), 
                        click: async () => {
                            let toggle = await setToggle('OVERWRITE');
                            console.log(toggle);
                            config.setConfig({key: 'OVERWRITE', value: toggle})},
                        type: 'checkbox'
                    },
                ]
            },
        ];
    contextMenu = Menu.buildFromTemplate(menuTemplate);
    tray.setContextMenu(contextMenu);
}
