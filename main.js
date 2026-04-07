const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Importar as lógicas de backend
const { getProjects } = require('./src/backend/projects');
const { processProjects } = require('./src/backend/editor');
const { getLogs } = require('./src/backend/logger');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Security measures
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'frontend', 'index.html'));
  
  // Abre o devtools opcionalmente (pode ser comentado)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Listeners
ipcMain.handle('get-projects', async () => {
  try {
    const projects = await getProjects();
    return projects;
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return [];
  }
});

ipcMain.handle('get-logs', () => {
  return getLogs();
});

// Receiver for trigger magic edition batch
ipcMain.on('process-projects', async (event, projectPaths, mode) => {
  try {
    await processProjects(projectPaths, event, mode); // Pass event to send progress back
    event.sender.send('process-finished', { success: true });
  } catch (error) {
    console.error('Erro geral no processo:', error);
    event.sender.send('process-finished', { success: false, error: error.message });
  }
});
