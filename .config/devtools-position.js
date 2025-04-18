// DevTools positioning helper
module.exports = function applyDevToolsPosition(win) {
  const { screen } = require('electron');
  
  // Open DevTools in a detached window
  win.webContents.openDevTools({ mode: 'detach' });
  
  // Get the displays
  const displays = screen.getAllDisplays();
  // If you have multiple displays and want to position DevTools on a specific one
  const targetDisplay = displays.length > 1 ? displays[1] : displays[0];
  
  // Position in the top right corner of the target display
  setTimeout(() => {
    const allWindows = require('electron').BrowserWindow.getAllWindows();
    const devToolsWindow = allWindows.find(w => w.getTitle().includes('Developer Tools'));
    
    if (devToolsWindow) {
      // Calculate position (you can adjust these values)
      const displayBounds = targetDisplay.bounds;
      const x = displayBounds.x + displayBounds.width - 800; // 800px from right edge
      const y = displayBounds.y + 50; // 50px from top
      
      devToolsWindow.setSize(800, 600); // Set DevTools size
      devToolsWindow.setPosition(x, y);
      console.log(`DevTools positioned at ${x},${y} on display ${targetDisplay.id}`);
    }
  }, 1000);
};
