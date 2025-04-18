// main/file-operations.js
const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function setupFileOperations(windowManager) {
  // Load SVG files
  ipcMain.handle('load-svg-files', async (event) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'SVG Files', extensions: ['svg'] }]
      });
      
      if (result.canceled) {
        return { success: false, files: [] };
      }
      
      const files = await Promise.all(result.filePaths.map(async (filePath) => {
        const content = await fs.promises.readFile(filePath, 'utf8');
        return {
          id: `svg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          path: filePath,
          name: path.basename(filePath),
          content
        };
      }));
      
      return { success: true, files };
    } catch (error) {
      console.error('Error loading SVG files:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Save SVG file
  ipcMain.handle('save-svg-file', async (event, { content, filePath }) => {
    try {
      if (!filePath) {
        const result = await dialog.showSaveDialog({
          filters: [{ name: 'SVG Files', extensions: ['svg'] }]
        });
        
        if (result.canceled) {
          return { success: false };
        }
        
        filePath = result.filePath;
      }
      
      await fs.promises.writeFile(filePath, content, 'utf8');
      return { success: true, filePath };
    } catch (error) {
      console.error('Error saving SVG file:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupFileOperations };
