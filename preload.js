const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  saveBuffer: (buffer) => {
    ipcRenderer.send('save_buffer', buffer);
  },
  destinationPath: (callback) => {
    window.addEventListener('DOMContentLoaded', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      ipcRenderer.invoke('dest-path-update').then(destination => {
        callback(destination);
      })
    })
  },
  chooseDestination: (callback) => {
    ipcRenderer.invoke('show-dialog').then(destination => {
      callback(destination);
  })
  }
});
