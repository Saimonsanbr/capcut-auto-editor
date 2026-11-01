const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  getEffects: () => ipcRenderer.invoke('get-effects'),
  getTransitions: () => ipcRenderer.invoke('get-transitions'),
  processProjects: (projectPaths, mode, options) => ipcRenderer.send('process-projects', projectPaths, mode, options || {}),
  onProgress: (callback) => ipcRenderer.on('process-progress', (_event, data) => callback(data)),
  onFinished: (callback) => ipcRenderer.on('process-finished', (_event, data) => callback(data)),
});
