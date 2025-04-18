// main/window-manager.js
const { BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

class WindowManager {
  constructor() {
    this.mainWindow = null;
  }
  
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      }
    });
    
    // Load the index.html file
    this.mainWindow.loadFile('index.html');
    
    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
    
    // Handle window closed event
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }
  
  getMainWindow() {
    return this.mainWindow;
  }
}

module.exports = { WindowManager };
