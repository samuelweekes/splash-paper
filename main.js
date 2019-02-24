const {app, dialog, Menu, Tray, BrowserWindow, globalShortcut, ipcMain} = require('electron');
const {config} = require('./js/config.js');
const {timer} = require('./js/timer.js');
const {CONSTANTS} = require('./js/constants.js');
const {api} = require('./js/api.js');
let pathWin = null;
let searchWin = null;
let contextMenu = null;

app.on('ready', () => {
    globalShortcut.register('Option+Cmd+p', () => {
        api.getImage();
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
    api.setConfig();
    timer.start(api.getImage);
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
                click: () => {api.getImage()},
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
                        label: 'None',
                        checked: (await config.readConfig('DELAY') === false) ? true : false, 
                        click: () => {
                            config.setConfig({key: 'DELAY', value: false})
                            timer.stop();
                        },
                        type: 'radio'
                    },
                    {
                        label: 'Two Minutes',
                        checked: (await config.readConfig('DELAY') === CONSTANTS.TWOMIN) ? true : false, 
                        click: () => {
                            config.setConfig({key: 'DELAY', value: CONSTANTS.TWOMIN})
                            timer.start(api.getImage);
                      },
                        type: 'radio'
                    },
                    {
                        label: 'Hourly',
                        checked: (await config.readConfig('DELAY') === CONSTANTS.HOUR) ? true : false, 
                        click: () => {
                            config.setConfig({key: 'DELAY', value: CONSTANTS.HOUR})
                            timer.start(api.getImage);
                      },
                        type: 'radio'
                    },
                    {
                        label: '12 Hours',
                        checked: (await config.readConfig('DELAY') === CONSTANTS.HALFDAY) ? true : false, 
                        click: () => {
                            config.setConfig({key: 'DELAY', value: CONSTANTS.HALFDAY})
                            timer.start(api.getImage);
                      },
                        type: 'radio'
                    },
                    {
                        label: 'Daily',
                        checked: (await config.readConfig('DELAY') === CONSTANTS.FULLDAY) ? true : false, 
                        click: () => {
                            config.setConfig({key: 'DELAY', value: CONSTANTS.FULLDAY})
                            timer.start(api.getImage);
                      },
                        type: 'radio'
                    },
                    {
                        label: 'Weekly',
                        checked: (await config.readConfig('DELAY') === CONSTANTS.WEEK) ? true : false, 
                        click: () => {
                            config.setConfig({key: 'DELAY', value: CONSTANTS.WEEK})
                            timer.start(api.getImage);
                      },
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
                            config.setConfig({key: 'OVERWRITE', value: toggle})},
                        type: 'checkbox'
                    },
                ]
            },
        ];
    contextMenu = Menu.buildFromTemplate(menuTemplate);
    tray.setContextMenu(contextMenu);
}
