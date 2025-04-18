// main/ipc-handler.js
const { ipcMain } = require('electron');

function setupIpcHandlers(windowManager) {
  // Handle renderer process messages
  ipcMain.on('app-ready', () => {
    console.log('Renderer process is ready');
  });
  
  // Handle window controls
  ipcMain.on('window-minimize', () => {
    const win = windowManager.getMainWindow();
    if (win) win.minimize();
  });
  
  ipcMain.on('window-maximize', () => {
    const win = windowManager.getMainWindow();
    if (!win) return;
    
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  
  ipcMain.on('window-close', () => {
    const win = windowManager.getMainWindow();
    if (win) win.close();
  });
  
  // Toggle dev tools in development mode
  if (process.env.NODE_ENV === 'development') {
    ipcMain.on('toggle-dev-tools', () => {
      const win = windowManager.getMainWindow();
      if (win) {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools();
        } else {
          win.webContents.openDevTools();
        }
      }
    });
  }
}

module.exports = { setupIpcHandlers };
