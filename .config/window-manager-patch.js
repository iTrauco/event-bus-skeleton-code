const fs = require('fs');
const path = require('path');
// Path to the window-manager.js file
const windowManagerPath = path.join(__dirname, '../main/window-manager.js');
// Only apply patch if it hasn't been applied already
if (fs.existsSync(windowManagerPath)) {
  const content = fs.readFileSync(windowManagerPath, 'utf8');
  
  // Check if the patch is already applied
  if (!content.includes('// DEVTOOLS POSITION PATCH')) {
    // Make a backup
    fs.writeFileSync(`${windowManagerPath}.bak`, content);
    
    // Find the right spot to insert our code - after the mainWindow creation
    const lines = content.split('\n');
    let patchedContent = '';
    let windowCreationFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      patchedContent += lines[i] + '\n';
      
      // Look for a line that indicates window creation and DevTools opening
      if (!windowCreationFound && 
          lines[i].includes('this.mainWindow') && 
          lines[i].trim().endsWith('{')) {
        windowCreationFound = true;
      }
      
      // After we find the window creation, look for DevTools opening
      if (windowCreationFound && lines[i].includes('openDevTools')) {
        // Comment out the original DevTools line
        patchedContent = patchedContent.replace(
          lines[i], 
          `    // Commented out by start.sh: ${lines[i].trim()}`
        );
        
        // Add our custom DevTools positioning
        patchedContent += '    // DEVTOOLS POSITION PATCH\n';
        patchedContent += '    try {\n';
        patchedContent += '      const positionDevTools = require("../.config/devtools-position.js");\n';
        patchedContent += '      positionDevTools(this.mainWindow);\n';
        patchedContent += '    } catch (err) {\n';
        patchedContent += '      console.error("Failed to position DevTools:", err);\n';
        patchedContent += '      this.mainWindow.webContents.openDevTools({mode: "detach"});\n';
        patchedContent += '    }\n';
        
        windowCreationFound = false; // Reset flag
      }
    }
    
    // Write the patched file
    fs.writeFileSync(windowManagerPath, patchedContent);
    console.log('Applied DevTools position patch to window-manager.js');
  } else {
    console.log('DevTools position patch already applied');
  }
}
