#!/bin/bash

# Window position tracking config
WINDOW_CONFIG="${HOME}/.config/rage_window_state.json"
mkdir -p "$(dirname "$WINDOW_CONFIG")"

# Window position tracking functions
function list_windows() {
  mapfile -t windows < <(wmctrl -lG)
  echo ""
  for i in "${!windows[@]}"; do
    line="${windows[$i]}"
    title=$(echo "$line" | cut -d ' ' -f8-)
    echo "$((i + 1)). $title"
  done
}

function select_multiple_windows_and_save() {
  list_windows
  echo ""
  echo "Enter window numbers to track (space-separated):"
  read -a indices
  jq -n '{windows: []}' > "$WINDOW_CONFIG" # start fresh
  for index in "${indices[@]}"; do
    if [[ "$index" =~ ^[0-9]+$ ]] && ((index >= 1 && index <= ${#windows[@]})); then
      selected="${windows[$((index - 1))]}"
      win_id=$(echo "$selected" | awk '{print $1}')
      x=$(echo "$selected" | awk '{print $3}')
      y=$(echo "$selected" | awk '{print $4}')
      w=$(echo "$selected" | awk '{print $5}')
      h=$(echo "$selected" | awk '{print $6}')
      title=$(echo "$selected" | cut -d ' ' -f8-)
      tmp=$(mktemp)
      jq --arg title "$title" --arg id "$win_id" \
         --argjson x "$x" --argjson y "$y" \
         --argjson w "$w" --argjson h "$h" \
         '.windows += [{title: $title, id: $id, x: $x, y: $y, w: $w, h: $h}]' "$WINDOW_CONFIG" > "$tmp" && mv "$tmp" "$WINDOW_CONFIG"
      echo "✅ Tracked \"$title\" at ($x,$y) ${w}x${h}"
    else
      echo "❌ Skipping invalid index: $index"
    fi
  done
}

function list_saved_windows() {
  [[ ! -f "$WINDOW_CONFIG" ]] && echo "⚠️ No saved state." && return 1
  count=$(jq '.windows | length' "$WINDOW_CONFIG")
  for ((i=0; i<count; i++)); do
    title=$(jq -r ".windows[$i].title" "$WINDOW_CONFIG")
    echo "$((i + 1)). $title"
  done
}

function restore_single_saved_window() {
  list_saved_windows || return
  echo ""
  read -p "Enter saved window number to restore: " n
  ((n--))
  title=$(jq -r ".windows[$n].title" "$WINDOW_CONFIG")
  x=$(jq -r ".windows[$n].x" "$WINDOW_CONFIG")
  y=$(jq -r ".windows[$n].y" "$WINDOW_CONFIG")
  w=$(jq -r ".windows[$n].w" "$WINDOW_CONFIG")
  h=$(jq -r ".windows[$n].h" "$WINDOW_CONFIG")
  wmctrl -lG | grep "$title" | while read -r line; do
    win_id=$(echo "$line" | awk '{print $1}')
    wmctrl -i -r "$win_id" -e "0,$x,$y,$w,$h"
    echo "✅ Restored \"$title\""
  done
}

function restore_all_saved_windows() {
  [[ ! -f "$WINDOW_CONFIG" ]] && echo "⚠️ No saved state." && return 1
  count=$(jq '.windows | length' "$WINDOW_CONFIG")
  for ((i=0; i<count; i++)); do
    title=$(jq -r ".windows[$i].title" "$WINDOW_CONFIG")
    x=$(jq -r ".windows[$i].x" "$WINDOW_CONFIG")
    y=$(jq -r ".windows[$i].y" "$WINDOW_CONFIG")
    w=$(jq -r ".windows[$i].w" "$WINDOW_CONFIG")
    h=$(jq -r ".windows[$i].h" "$WINDOW_CONFIG")
    wmctrl -lG | grep "$title" | while read -r line; do
      win_id=$(echo "$line" | awk '{print $1}')
      wmctrl -i -r "$win_id" -e "0,$x,$y,$w,$h"
      echo "✅ Restored \"$title\""
    done
  done
}

function loop_restore_all() {
  echo "🔁 Watching for any saved windows to appear..."
  # Create a separate background script file
  cat > /tmp/window_tracker_tmp.sh << 'EOL'
#!/bin/bash
WINDOW_CONFIG="$1"
while true; do
  count=$(jq '.windows | length' "$WINDOW_CONFIG")
  for ((i=0; i<count; i++)); do
    title=$(jq -r ".windows[$i].title" "$WINDOW_CONFIG")
    x=$(jq -r ".windows[$i].x" "$WINDOW_CONFIG")
    y=$(jq -r ".windows[$i].y" "$WINDOW_CONFIG")
    w=$(jq -r ".windows[$i].w" "$WINDOW_CONFIG")
    h=$(jq -r ".windows[$i].h" "$WINDOW_CONFIG")
    wmctrl -lG | grep "$title" | while read -r line; do
      win_id=$(echo "$line" | awk '{print $1}')
      wmctrl -i -r "$win_id" -e "0,$x,$y,$w,$h"
      echo "🔧 Moved \"$title\""
    done
  done
  sleep 2
done
EOL
  chmod +x /tmp/window_tracker_tmp.sh
  /tmp/window_tracker_tmp.sh "$WINDOW_CONFIG" > /dev/null 2>&1 &
  WINDOW_TRACKER_PID=$!
}

function window_manager_menu() {
  echo ""
  echo "🔥 Window Position Tracker"
  echo "1. Select and track multiple open windows"
  echo "2. Restore one saved window by choice"
  echo "3. Restore all saved windows once"
  echo "4. Start background loop to restore all windows"
  echo "5. Start the application"
  echo "6. Exit"
  echo ""
  read -p "Choose an option: " choice
  case "$choice" in
    1) select_multiple_windows_and_save; window_manager_menu ;;
    2) restore_single_saved_window; window_manager_menu ;;
    3) restore_all_saved_windows; window_manager_menu ;;
    4) loop_restore_all; start_application ;;
    5) start_application ;;
    6) exit 0 ;;
    *) echo "❌ Invalid choice"; window_manager_menu ;;
  esac
}

# =============================================================
# Electron Application Functions Below
# =============================================================

function start_application() {
  # Print colorful header
  echo -e "\e[1;36m====================================\e[0m"
  echo -e "\e[1;36m  OBS Transparent UI - Auto-reload  \e[0m"
  echo -e "\e[1;36m====================================\e[0m"
  
  # 📌 Get current active window information before killing processes
  ACTIVE_WINDOW_INFO=""
  if command -v xdotool &> /dev/null; then
    # Save window position if xdotool is available
    CURRENT_WINDOW=$(xdotool getactivewindow 2>/dev/null || echo "")
    if [ ! -z "$CURRENT_WINDOW" ]; then
      WINDOW_NAME=$(xdotool getwindowname $CURRENT_WINDOW 2>/dev/null || echo "")
      # Only save if it's our app window
      if [[ "$WINDOW_NAME" == *"OBS Transparent UI"* ]] || [[ "$WINDOW_NAME" == *"Electron"* ]]; then
        WINDOW_GEOMETRY=$(xdotool getwindowgeometry $CURRENT_WINDOW 2>/dev/null || echo "")
        ACTIVE_WINDOW_INFO="$WINDOW_GEOMETRY"
        echo -e "\e[1;33m📌 Saved window position: $WINDOW_GEOMETRY\e[0m"
      fi
    fi
  else
    echo -e "\e[1;33m⚠️ xdotool not found. Window position cannot be preserved.\e[0m"
    echo -e "\e[1;33m⚠️ Install with: sudo apt-get install xdotool\e[0m"
  fi
  
  # 🔍 Always check and kill any existing electron processes
  echo -e "\e[1;33mStopping any existing instances...\e[0m"
  # 💀 More thorough process killing for different platforms
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # 🍎 macOS specific process killing
    pkill -f "electron main.js" || true
    pkill -f "Electron" || true
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # 🐧 Linux specific process killing
    pkill -f "electron main.js" || true
    pkill -f "electron" || true
  elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "win32" ]]; then
    # 🪟 Windows specific process killing (with Git Bash or similar)
    taskkill //F //IM electron.exe //T 2>/dev/null || true
  else
    # 🌐 Generic fallback for other operating systems
    pkill -f "electron main.js" || true
    pkill -f "electron" || true
  fi
  
  # ⏱️ Give processes time to fully terminate
  echo -e "\e[1;33mWaiting for processes to terminate...\e[0m"
  sleep 2
  
  # 🔍 Check if electron-reload is installed
  if ! grep -q "electron-reload" package.json; then
      echo -e "\e[1;33m📦 electron-reload not found. Running npm install first...\e[0m"
      npm install electron-reload
  fi
  
  # Create a custom file to place DevTools in a specific location
  echo -e "\e[1;33m🔧 Creating DevTools position configuration...\e[0m"
  mkdir -p .config
  
  # Create a temporary devtools helper
  cat > .config/devtools-position.js << 'EOL'
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
EOL
  
  # Create a patch for window-manager.js to use our devtools positioning
  cat > .config/window-manager-patch.js << 'EOL'
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
EOL
  
  # Apply the patch
  echo -e "\e[1;33m🔧 Applying DevTools position patch...\e[0m"
  node .config/window-manager-patch.js
  
  # Create nodemon configuration
  echo -e "\e[1;33m👀 Setting up file watching configuration...\e[0m"
  cat > nodemon.json << 'EOL'
{
  "watch": [
    "main/**/*.js",
    "preload.js",
    "renderer/**/*.js",
    "*.html",
    "styles/**/*.css",
    "assets/**/*"
  ],
  "ignore": [
    "node_modules/**/*",
    "dist/**/*",
    ".config/**/*"
  ],
  "ext": "js,html,css,svg,json",
  "delay": "500",
  "verbose": true
}
EOL
  
  # ✅ Notify about configuration completion
  echo -e "\e[1;32m✅ Development configuration created! ✓\e[0m"
  echo -e "\e[1;36m🚀 Starting application with auto-reload...\e[0m"
  echo -e "\e[1;33m🔄 Any changes to files will automatically reload the app.\e[0m"
  echo -e "\e[1;33m⌨️ Press Ctrl+C to stop the application.\e[0m"
  
  # 🔄 Add a global shortcut hint
  echo -e "\e[1;33m🔎 If the window is not visible, press Alt+Tab to find it\e[0m"
  echo -e "\e[1;33m🔎 You can also press Ctrl+Shift+O to bring the window to front\e[0m"
  echo -e "\e[1;33m🔄 To restart the app, press Ctrl+C and run: ./start.sh\e[0m"
  
  # 🚀 Run the development version with auto-reload
  if [[ "$1" == "--devtools" ]]; then
    # 🔧 Enable DevTools for debugging
    echo -e "\e[1;33m🔧 Running with DevTools explicitly enabled\e[0m"
    OPEN_DEV_TOOLS=true NODE_ENV=development npx nodemon --exec "electron ."
  else
    # 🚀 Run without DevTools flag but patch handles positioning
    NODE_ENV=development npx nodemon --exec "electron ."
  fi
}

# Define cleanup function
function cleanup {
  # Restore original window-manager.js if a backup exists
  if [ -f "main/window-manager.js.bak" ]; then
    cp -f main/window-manager.js.bak main/window-manager.js
    rm main/window-manager.js.bak
    echo -e "\e[1;32m✅ Restored original window-manager.js\e[0m"
  fi
  
  # Kill the window tracker if it's running
  if [ ! -z "$WINDOW_TRACKER_PID" ]; then
    kill $WINDOW_TRACKER_PID 2>/dev/null || true
    echo -e "\e[1;32m✅ Stopped window position tracker\e[0m"
  fi
}

# Set up the cleanup to run when the script exits
trap cleanup EXIT INT TERM

# Check if any arguments were provided
if [[ "$#" -gt 0 ]]; then
  # If there's a --dev-tools argument, start the application directly
  if [[ "$1" == "--devtools" ]]; then
    loop_restore_all
    start_application "$1"
  # If there's a --restore-windows argument, restore saved windows and start the app
  elif [[ "$1" == "--restore-windows" ]]; then
    loop_restore_all
    start_application
  else
    # For any other arguments, show usage
    echo "Usage: $0 [--devtools|--restore-windows]"
    echo "  --devtools: Start the application with DevTools explicitly enabled"
    echo "  --restore-windows: Restore saved window positions and start the application"
    exit 1
  fi
else
  # If no arguments, show the menu
  window_manager_menu
fi

# 🛑 If the application crashes or is stopped, provide instructions
echo ""
echo -e "\e[1;36m====================================\e[0m"
echo -e "\e[1;33m🛑 Application stopped. To restart, run:\e[0m"
echo -e "\e[1;32m./combined_start.sh\e[0m"
echo -e "\e[1;36m====================================\e[0m"