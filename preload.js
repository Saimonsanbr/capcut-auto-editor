const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  processProjects: (projectPaths) => ipcRenderer.send('process-projects', projectPaths),
  onProgress: (callback) => ipcRenderer.on('process-progress', (_event, data) => callback(data)),
  onFinished: (callback) => ipcRenderer.on('process-finished', (_event, data) => callback(data)),
});
