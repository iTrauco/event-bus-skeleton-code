// main/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { setupFileOperations } = require('./file-operations');
const { setupIpcHandlers } = require('./ipc-handler');
const { WindowManager } = require('./window-manager');

// Enable live reload in development
if (process.env.HOT_RELOAD === 'true') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

// Create window manager
const windowManager = new WindowManager();

// Application initialization
app.whenReady().then(() => {
  // Create main window
  windowManager.createMainWindow();
  
  // Set up IPC handlers
  setupIpcHandlers(windowManager);
  
  // Set up file operation handlers
  setupFileOperations(windowManager);
  
  // macOS-specific behavior
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow();
    }
  });
});

// Quit application when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
