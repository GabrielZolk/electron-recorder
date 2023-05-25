const { app, BrowserWindow, ipcMain, Menu, globalShortcut, shell, ipcRenderer, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Store = require('./Store');

const preferences = new Store({
    configName: 'user-preferences',
    defaults: {
        destination: path.join(os.homedir(), 'audios')
    }
})

let destination = preferences.get('destination');

function createPreferenceWindow() {
    const preferenceWin = new BrowserWindow({
        width: 600,
        height: 250,
        resizable: false,
        backgroundColor: '#234',
        icon: path.join(__dirname, "assets/icons/icon.png"),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    preferenceWin.loadFile('./src/preferences/index.html');
    preferenceWin.once('ready-to-show', () => {
        preferenceWin.show();
    });
};

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 300,
        resizable: false,
        backgroundColor: '#234',
        icon: path.join(__dirname, "assets/icons/icon.png"),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('./src/mainWindow/index.html');
    // win.webContents.openDevTools();

    win.once('ready-to-show', () => {
        win.show()
        

        menuTemplate = [
            { label: app.name,
              submenu: [
                {label: 'Preferences', click: () => { createPreferenceWindow() }},
                {label: 'Open destination folder', click: () => {shell.openPath(destination)}}
              ]
            },

            {
                label: 'File',
                submenu: [
                    {  role: 'quit'}
                ]
            }
        ];
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    })

}

app.whenReady().then(() => {
    createWindow();
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
})

ipcMain.on('save_buffer', (e, buffer) => {
    const filePath = path.join(destination, `${Date.now()}`);
    fs.writeFileSync(`${filePath}.webm`, buffer);
})

ipcMain.handle('dest-path-update', () => {
    return destination
   });

ipcMain.handle('show-dialog', async (event) => {
    const result = await dialog.showOpenDialog({properties: ['openDirectory']})

    const dirPath = result.filePaths[0];
    preferences.set('destination', dirPath);
    destination = preferences.get('destination');

    return destination;
})



