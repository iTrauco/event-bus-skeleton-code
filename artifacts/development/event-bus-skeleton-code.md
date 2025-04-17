   # Complete Event Bus Implementation Skeleton Code

## Project Structure

```
project-root/
├── index.html                # Main HTML entry point
├── main/                     # Electron main process
│   ├── file-operations.js    # File system operations
│   ├── ipc-handler.js        # IPC communication
│   ├── main.js               # Main process entry point
│   └── window-manager.js     # Window management
├── package.json              # Project configuration
├── preload.js                # Preload bridge script
├── renderer/                 # Renderer process
│   ├── components/           # UI components
│   │   ├── component-factory.js  # Component registry
│   │   ├── svg-controller.js     # SVG manipulation
│   │   └── svg-list.js           # SVG selection
│   ├── config/               # Configuration
│   │   └── constants.js          # Constants and event types
│   ├── core/                 # Core architecture
│   │   └── event-bus.js          # Event bus implementation
│   ├── index.js              # Renderer entry point
│   ├── services/             # Business logic
│   │   ├── drag-service.js       # Drag operations
│   │   ├── service-provider.js   # Service registry
│   │   └── svg-service.js        # SVG operations
│   ├── store/                # State management
│   │   ├── app-store.js          # Central store
│   │   └── reducers/             # State reducers
│   │       ├── drag-reducer.js   # Drag state
│   │       ├── index.js          # Reducer combiner
│   │       ├── svg-reducer.js    # SVG state
│   │       └── ui-reducer.js     # UI state
│   └── utils/                # Utilities
│       ├── dom-utils.js          # DOM helpers
│       └── svg-utils.js          # SVG utilities
└── styles/                   # CSS styling
    ├── base.css                  # Base styles
    ├── components/               # Component-specific styles
    │   ├── active-svg-table.css  # SVG table styles
    │   ├── control-panel.css     # Control panel styles
    │   ├── drag-system.css       # Drag feedback styles
    │   ├── fullscreen.css        # Fullscreen mode styles
    │   ├── quadrant-grid.css     # Quadrant layout styles
    │   ├── svg-container.css     # SVG container styles
    │   └── vaporwave.css         # Visual effects styles
    └── main.css                  # Main stylesheet
```

## Skeleton Code - Renderer Process

### constants.js
```javascript
// Event types used by the event bus
export const EventTypes = {
  SVG_SELECTED: 'SVG_SELECTED',
  SVG_DISPLAYED: 'SVG_DISPLAYED',
  SVG_REMOVED: 'SVG_REMOVED',
  SVG_VISIBILITY_CHANGED: 'SVG_VISIBILITY_CHANGED',
  ROUTE_CHANGED: 'ROUTE_CHANGED',
  CONTROLS_VISIBILITY_CHANGED: 'CONTROLS_VISIBILITY_CHANGED',
  DRAG_MODE_ENABLED: 'DRAG_MODE_ENABLED',
  DRAG_MODE_DISABLED: 'DRAG_MODE_DISABLED',
  COMMAND_LOAD_SVG_FILES: 'COMMAND_LOAD_SVG_FILES',
  COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
  COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG',
  COMMAND_TOGGLE_SVG_VISIBILITY: 'COMMAND_TOGGLE_SVG_VISIBILITY',
  COMMAND_ENABLE_DRAG_MODE: 'COMMAND_ENABLE_DRAG_MODE'
};

export const ElementIds = {
  MAIN_CONTENT: 'main-content',
  CONTROL_PANEL: 'control-panel',
  TOGGLE_CONTROLS: 'toggle-controls',
  QUADRANT_GRID: 'quadrant-grid',
  FULLSCREEN_CONTAINER: 'fullscreen-container',
  ENABLE_DRAG_MODE: 'enable-drag-mode'
};

export const ClassNames = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  HAS_SVG: 'has-svg',
  SVG_CONTAINER: 'svg-container',
  DRAGGABLE: 'draggable',
  DRAGGING: 'dragging',
  SELECTED: 'selected'
};

export const Routes = {
  HOME: 'home',
  SETTINGS: 'settings',
  ABOUT: 'about'
};

export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};
```

### event-bus.js
```javascript
import { LogLevel } from '../config/constants.js';

class EventBus {
  constructor() {
    this.listeners = {};
    this.debug = false;
    console.log(`[${LogLevel.INFO}] EventBus initialized`);
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }
  
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.log(`[${LogLevel.ERROR}] Error in listener for '${event}': ${error.message}`);
      }
    });
  }
  
  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

export const eventBus = new EventBus();
```

### app-store.js
```javascript
import { LogLevel } from '../config/constants.js';
import rootReducer from './reducers/index.js';

function createStore(reducer) {
  let currentState = reducer(undefined, { type: '@@INIT' });
  const listeners = [];
  
  function getState() {
    return currentState;
  }
  
  function dispatch(action) {
    console.log(`[${LogLevel.INFO}] Store: Dispatching ${action.type}`);
    currentState = reducer(currentState, action);
    listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.log(`[${LogLevel.ERROR}] Store: Error in listener: ${error.message}`);
      }
    });
    return action;
  }
  
  function subscribe(listener) {
    listeners.push(listener);
    console.log(`[${LogLevel.INFO}] Store: Listener added, total: ${listeners.length}`);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }
  
  return { getState, dispatch, subscribe };
}

export const appStore = createStore(rootReducer);

console.log(`[${LogLevel.INFO}] Application store initialized`);

export const ActionTypes = {
  SET_SVG_FILES: 'SET_SVG_FILES',
  SET_SELECTED_SVG_ID: 'SET_SELECTED_SVG_ID',
  ADD_ACTIVE_SVG: 'ADD_ACTIVE_SVG',
  REMOVE_ACTIVE_SVG: 'REMOVE_ACTIVE_SVG',
  UPDATE_SVG_VISIBILITY: 'UPDATE_SVG_VISIBILITY',
  UPDATE_ALL_SVG_VISIBILITY: 'UPDATE_ALL_SVG_VISIBILITY',
  UPDATE_SVG_POSITION: 'UPDATE_SVG_POSITION',
  SET_CONTROLS_VISIBLE: 'SET_CONTROLS_VISIBLE',
  SET_ACTIVE_ROUTE: 'SET_ACTIVE_ROUTE',
  SET_SELECTED_QUADRANT: 'SET_SELECTED_QUADRANT',
  SET_DRAG_MODE: 'SET_DRAG_MODE',
  DRAG_START: 'DRAG_START',
  DRAG_END: 'DRAG_END'
};
```

### reducers/index.js
```javascript
import { LogLevel } from '../../config/constants.js';
import svgReducer from './svg-reducer.js';
import uiReducer from './ui-reducer.js';
import dragReducer from './drag-reducer.js';

export function combineReducers(reducers) {
  return (state = {}, action) => {
    const nextState = {};
    
    Object.entries(reducers).forEach(([key, reducer]) => {
      nextState[key] = reducer(state[key], action);
    });
    
    return nextState;
  };
}

const rootReducer = combineReducers({
  svg: svgReducer,
  ui: uiReducer,
  drag: dragReducer
});

export default rootReducer;
```

### reducers/svg-reducer.js
```javascript
import { LogLevel } from '../../config/constants.js';

const initialState = {
  svgFiles: [],
  activeSvgs: [],
  selectedSvgId: null
};

export function svgReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_SVG_FILES':
      return {
        ...state,
        svgFiles: action.payload
      };
      
    case 'SET_SELECTED_SVG_ID':
      return {
        ...state,
        selectedSvgId: action.payload
      };
      
    case 'ADD_ACTIVE_SVG':
      return state;
      
    case 'REMOVE_ACTIVE_SVG':
      return state;
      
    case 'UPDATE_SVG_VISIBILITY':
      return state;
      
    case 'UPDATE_ALL_SVG_VISIBILITY':
      return state;
      
    case 'UPDATE_SVG_POSITION':
      return state;
      
    default:
      return state;
  }
}

export default svgReducer;
```

### reducers/ui-reducer.js
```javascript
// UI state reducer - Manages all UI-related state
import { LogLevel, Routes } from '../../config/constants.js';

// Initial state for UI-related data
const initialState = {
  controlsVisible: true,   // Control panel visibility
  activeRoute: Routes.HOME, // Current active route
  selectedQuadrant: null   // Currently selected quadrant
};

/**
 * Reducer for UI-related state
 * @param {Object} state - Current UI state
 * @param {Object} action - Dispatched action
 * @returns {Object} - New UI state
 */
export function uiReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_CONTROLS_VISIBLE':
      return {
        ...state,
        controlsVisible: action.payload
      };
    case 'SET_ACTIVE_ROUTE':
      return {
        ...state,
        activeRoute: action.payload
      };
    case 'SET_SELECTED_QUADRANT':
      return {
        ...state,
        selectedQuadrant: action.payload
      };
    default:
      return state;
  }
}

export default uiReducer;
```

### reducers/drag-reducer.js
```javascript
import { LogLevel } from '../../config/constants.js';

const initialState = {
  dragModeEnabled: false,
  draggedElementId: null,
  dragStartPosition: null,
  isDragging: false
};

export function dragReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_DRAG_MODE':
      return {
        ...state,
        dragModeEnabled: action.payload
      };
      
    case 'DRAG_START':
      return state;
      
    case 'DRAG_END':
      return state;
      
    default:
      return state;
  }
}

export default dragReducer;
```

### service-provider.js
```javascript
import { eventBus } from '../core/event-bus.js';
import { LogLevel } from '../config/constants.js';

class ServiceProvider {
  constructor() {
    this.services = new Map();
    this.isInitialized = false;
    console.log(`[${LogLevel.INFO}] ServiceProvider created`);
  }
  
  register(name, service) {
    if (this.services.has(name)) {
      console.log(`[${LogLevel.WARN}] Service ${name} already registered`);
      return;
    }
    
    this.services.set(name, service);
    console.log(`[${LogLevel.INFO}] Service ${name} registered`);
  }
  
  get(name) {
    return this.services.get(name) || null;
  }
  
  initializeServices() {
    if (this.isInitialized) return;
    
    console.log(`[${LogLevel.INFO}] Initializing services...`);
    
    const initOrder = ['svg', 'drag'];
    
    for (const serviceName of initOrder) {
      const service = this.services.get(serviceName);
      if (service && typeof service.initialize === 'function') {
        service.initialize();
      }
    }
    
    this.isInitialized = true;
    console.log(`[${LogLevel.INFO}] All services initialized`);
    
    eventBus.emit('SERVICES_INITIALIZED', { timestamp: Date.now() });
  }
}

export const serviceProvider = new ServiceProvider();
```

### svg-service.js
```javascript
import { eventBus } from '../core/event-bus.js';
import { appStore, ActionTypes } from '../store/app-store.js';
import { EventTypes, LogLevel } from '../config/constants.js';

class SvgService {
  constructor() {
    this.svgCache = new Map();
    this.setupEventListeners();
    console.log(`[${LogLevel.INFO}] SVG Service created`);
  }
  
  setupEventListeners() {
    eventBus.on(EventTypes.COMMAND_SELECT_SVG, this.handleSelectSvg.bind(this));
    eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, this.handleDisplaySvg.bind(this));
    eventBus.on(EventTypes.COMMAND_TOGGLE_SVG_VISIBILITY, this.handleToggleSvgVisibility.bind(this));
  }
  
  initialize() {
    console.log(`[${LogLevel.INFO}] SVG Service initializing`);
  }
  
  handleSelectSvg(data) {}
  
  handleDisplaySvg(data) {}
  
  handleToggleSvgVisibility(data) {}
  
  getSvgFile(id) {
    const state = appStore.getState();
    return state.svg.svgFiles.find(file => file.id === id) || null;
  }
}

export const svgService = new SvgService();
```

### drag-service.js
```javascript
import { eventBus } from '../core/event-bus.js';
import { appStore, ActionTypes } from '../store/app-store.js';
import { EventTypes, LogLevel, ClassNames } from '../config/constants.js';

class DragService {
  constructor() {
    this.dragEnabled = false;
    this.activeDrag = null;
    this.elementCache = new Map();
    this.setupEventListeners();
    console.log(`[${LogLevel.INFO}] Drag Service created`);
  }
  
  setupEventListeners() {
    eventBus.on(EventTypes.COMMAND_ENABLE_DRAG_MODE, this.handleToggleDragMode.bind(this));
  }
  
  initialize() {
    console.log(`[${LogLevel.INFO}] Drag Service initializing`);
  }
  
  handleToggleDragMode(data) {}
  
  setupDraggableElements() {}
  
  cleanupDraggableElements() {}
}

export const dragService = new DragService();
```

### component-factory.js
```javascript
import { EventTypes, LogLevel } from '../config/constants.js';
import { eventBus } from '../core/event-bus.js';

class ComponentFactory {
  constructor() {
    this.components = new Map();
    console.log(`[${LogLevel.INFO}] ComponentFactory created`);
  }
  
  register(id, component) {
    if (this.components.has(id)) {
      console.log(`[${LogLevel.WARN}] Component ${id} already registered`);
      return;
    }
    
    this.components.set(id, component);
    console.log(`[${LogLevel.INFO}] Component ${id} registered`);
  }
  
  initializeComponents() {
    console.log(`[${LogLevel.INFO}] Initializing components...`);
    
    const componentsToMount = ['svg-list', 'svg-controller'];
    
    for (const id of componentsToMount) {
      const component = this.components.get(id);
      if (component && typeof component.mount === 'function') {
        component.mount();
      }
    }
    
    console.log(`[${LogLevel.INFO}] All components initialized`);
    
    eventBus.emit(EventTypes.COMPONENTS_INITIALIZED, { timestamp: Date.now() });
  }
  
  get(id) {
    return this.components.get(id) || null;
  }
}

export const componentFactory = new ComponentFactory();
```

### svg-list.js
```javascript
import { EventTypes, ElementIds, ClassNames, LogLevel } from '../config/constants.js';
import { eventBus } from '../core/event-bus.js';
import { appStore, ActionTypes } from '../store/app-store.js';

class SvgList {
  constructor() {
    this.containerId = 'svg-file-list';
    this.mounted = false;
    this.selectedId = null;
    
    this.handleSvgFilesUpdated = this.handleSvgFilesUpdated.bind(this);
    this.handleSvgFileClick = this.handleSvgFileClick.bind(this);
    
    console.log(`[${LogLevel.INFO}] SvgList component created`);
  }
  
  mount() {
    if (this.mounted) return;
    
    console.log(`[${LogLevel.INFO}] Mounting SVG List component`);
    
    this.unsubscribeStore = appStore.subscribe(this.handleStoreUpdate.bind(this));
    
    this.render();
    
    this.mounted = true;
  }
  
  unmount() {
    if (!this.mounted) return;
    
    console.log(`[${LogLevel.INFO}] Unmounting SVG List component`);
    
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
    
    this.mounted = false;
  }
  
  render() {}
  
  handleSvgFilesUpdated(svgFiles) {}
  
  handleSvgFileClick(id) {}
  
  handleStoreUpdate(state) {}
}

export const svgList = new SvgList();
```

### svg-controller.js
```javascript
import { EventTypes, ElementIds, ClassNames, LogLevel } from '../config/constants.js';
import { eventBus } from '../core/event-bus.js';
import { appStore, ActionTypes } from '../store/app-store.js';

class SvgController {
  constructor() {
    this.controlPanelId = ElementIds.CONTROL_PANEL;
    this.quadrantGridId = ElementIds.QUADRANT_GRID;
    this.mounted = false;
    
    this.handleActiveSvgsUpdated = this.handleActiveSvgsUpdated.bind(this);
    this.handleQuadrantClick = this.handleQuadrantClick.bind(this);
    
    console.log(`[${LogLevel.INFO}] SvgController component created`);
  }
  
  mount() {
    if (this.mounted) return;
    
    console.log(`[${LogLevel.INFO}] Mounting SVG Controller component`);
    
    this.unsubscribeStore = appStore.subscribe(this.handleStoreUpdate.bind(this));
    
    const dragModeButton = document.getElementById(ElementIds.ENABLE_DRAG_MODE);
    if (dragModeButton) {
      dragModeButton.addEventListener('click', this.handleToggleDragMode.bind(this));
    }
    
    this.setupQuadrantListeners();
    
    this.render();
    
    this.mounted = true;
  }
  
  unmount() {}
  
  setupQuadrantListeners() {}
  
  removeQuadrantListeners() {}
  
  render() {}
  
  removeExistingSvgs() {}
  
  renderSvg(svg) {}
  
  renderActiveSvgsTable() {}
  
  handleToggleDragMode() {}
  
  handleQuadrantClick(quadrant) {}
  
  handleToggleSvgVisibility(id) {}
  
  handleRemoveSvg(id) {}
  
  handleActiveSvgsUpdated(activeSvgs) {}
  
  handleStoreUpdate(state) {}
}

export const svgController = new SvgController();
```

### dom-utils.js
```javascript
// Minimal dom-utils.js
export const DomUtils = {
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Set content if provided
    if (content) {
      element.textContent = content;
    }
    
    return element;
  },
  
  removeAllChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },
  
  setStyles(element, styles) {
    Object.entries(styles).forEach(([key, value]) => {
      element.style[key] = value;
    });
  }
};
```

### svg-utils.js
```javascript
export const SvgUtils = {
  sanitizeSvgContent(svgContent) {
    return svgContent;
  },
  
  extractSvgDimensions(svgContent) {
    return {
      width: 100,
      height: 100,
      viewBox: "0 0 100 100",
      aspectRatio: 1
    };
  },
  
  createSvgElement(svgContent, id) {
    return document.createElement('div');
  }
};
```

### index.js
```javascript
import { EventTypes, LogLevel, ElementIds } from './config/constants.js';
import { appStore, ActionTypes } from './store/app-store.js';
import { eventBus } from './core/event-bus.js';
import { serviceProvider } from './services/service-provider.js';
import { svgService } from './services/svg-service.js';
import { dragService } from './services/drag-service.js';
import { componentFactory } from './components/component-factory.js';
import { svgList } from './components/svg-list.js';
import { svgController } from './components/svg-controller.js';

async function initializeApp() {
  console.log(`[${LogLevel.INFO}] Starting application initialization`);
  
  try {
    // Register services
    serviceProvider.register('svg', svgService);
    serviceProvider.register('drag', dragService);
    
    // Initialize services
    serviceProvider.initializeServices();
    
    // Register components
    componentFactory.register('svg-list', svgList);
    componentFactory.register('svg-controller', svgController);
    
    // Initialize components
    componentFactory.initializeComponents();
    
    console.log(`[${LogLevel.INFO}] Application initialization complete`);
    return true;
  } catch (error) {
    console.log(`[${LogLevel.ERROR}] Application initialization failed: ${error.message}`);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(`[${LogLevel.INFO}] Document loaded, starting initialization`);
  
  initializeApp().then((success) => {
    if (success) {
      console.log(`[${LogLevel.INFO}] Application ready for use`);
    } else {
      console.log(`[${LogLevel.ERROR}] Application failed to initialize properly`);
    }
  });
});

window.App = {
  version: '1.0.0',
  eventBus,
  store: appStore
};
```

## Skeleton Code - Main Process

### file-operations.js
```javascript
/**
 * File operations for the main process
 */
class FileOperations {
  /**
   * Initialize file operations
   * @param {Object} windowManager - Window manager reference
   */
  constructor(windowManager) {
    this.windowManager = windowManager;
  }
  
  /**
   * Gets SVG files from the specified directory
   * @param {string} directory - Directory to scan for SVG files
   * @returns {Promise<Array>} - Array of file objects
   */
  getSvgFiles(directory) {
    return Promise.resolve([]);
  }
  
  /**
   * Reads SVG file content
   * @param {string} filePath - Path to SVG file
   * @returns {Promise<string>} - SVG file content
   */
  readSvgFile(filePath) {
    return Promise.resolve('');
  }
  
  /**
   * Ensures that the SVG directory exists
   * @param {string} directory - SVG directory path
   */
  ensureSvgDirectoryExists(directory) {
    // Implementation
  }
}

module.exports = FileOperations;
```

### ipc-handler.js
```javascript
// IPC Handler Module
class IpcHandler {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.registerHandlers();
  }

  registerHandlers() {
    // Handle control panel visibility toggle
    
    // Handle SVG file loading
    
    // Handle settings save
    
    // Handle SVG content reading
  }
}

module.exports = IpcHandler;
```

### main.js
```javascript
// Main process entry point
const { app } = require('electron');
const path = require('path');
const WindowManager = require('./window-manager');
const IpcHandler = require('./ipc-handler');

// Create singleton instances
const windowManager = new WindowManager();
let ipcHandler;

// Create window when Electron is ready
app.whenReady().then(() => {
  // Create the main window
  windowManager.createWindow(app);
  
  // Initialize IPC handler
  ipcHandler = new IpcHandler(windowManager);
  
  app.on('activate', function () {
    if (windowManager.getWindow() === null) {
      windowManager.createWindow(app);
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
```

### window-manager.js
```javascript
// Window Manager Module
class WindowManager {
  constructor() {
    this.mainWindow = null;
  }

  createWindow(app) {
    // Create the transparent window
    
    // Load the index.html of the app
    
    // Save window position when it moves
    
    // Log when window is ready
    
    // Prevent accidental closing
  }

  getWindow() {
    return this.mainWindow;
  }
}

module.exports = WindowManager;
```

### preload.js
```javascript
// Preload script - Secure bridge between renderer and main processes
(function() {
  // Create browser-compatible API
  window.api = {
    send: (channel, data) => {
      console.log(`[MOCK] Send to ${channel}:`, data);
    },
    
    receive: (channel, func) => {
      console.log(`[MOCK] Setup receiver for ${channel}`);
    },
    
    loadSvgs: async () => {
      console.log('[MOCK] loadSvgs called');
      return [
        {
          id: 'svg-1',
          name: 'Circle.svg',
          path: '/path/to/circle.svg'
        },
        {
          id: 'svg-2',
          name: 'Square.svg',
          path: '/path/to/square.svg'
        }
      ];
    },
    
    readSvgFile: async (filePath) => {
      console.log('[MOCK] readSvgFile called:', filePath);
      return '<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
    }
  };
  
  // Mock fs API
  window.fs = {
    readFile: (filePath, options = {}) => {
      return new Promise((resolve, reject) => {
        console.log('[MOCK] fs.readFile called:', filePath);
        resolve('<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>');
      });
    }
  };
  
  console.log('Browser-compatible preload script loaded');
})();
```

## Event Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Component  │───▶│  Event Bus  │───▶│   Service   │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                                     │
       │                                     ▼
┌─────────────┐                       ┌─────────────┐
│     UI      │◀──────────────────────│    Store    │
└─────────────┘                       └─────────────┘
```

## Event Flow Examples

### SVG Selection Flow
1. User clicks on SVG in list
2. SvgList component emits `COMMAND_SELECT_SVG` event with SVG ID
3. SvgService handles the event, updates store via dispatch
4. Store updates state and notifies subscribers
5. Components re-render based on new state

### SVG Display Flow
1. User clicks on quadrant with SVG selected
2. SvgController emits `COMMAND_DISPLAY_SVG` event with SVG and quadrant info
3. SvgService handles the event, creates active SVG, updates store
4. Store updates state and notifies subscribers
5. SvgController renders SVG in appropriate quadrant

### Drag Mode Flow
1. User clicks "Enable Drag Mode" button
2. SvgController emits `COMMAND_ENABLE_DRAG_MODE` event
3. DragService handles the event, updates store
4. Store updates state and notifies subscribers
5. Components update UI to reflect drag mode

## Testing Strategy

1. Test event emission and reception:
```javascript
// In browser console
window.App.eventBus.emit('EVENT_NAME', {data: 'test'});
```

2. Test store state:
```javascript
// In browser console
window.App.store.getState();
```

3. Test action dispatch:
```javascript
// In browser console
window.App.store.dispatch({
  type: 'SET_SELECTED_SVG_ID',
  payload: 'svg-1'
});
```

## Implementation Phases

1. **Phase 1: Event Bus Core**
   - Set up event bus and store infrastructure
   - Test event emission and subscription

2. **Phase 2: Service Layer**
   - Implement SVG service with handlers
   - Connect services to store

3. **Phase 3: Component Layer**
   - Implement SVG list and controller components
   - Connect components to services via events

4. **Phase 4: Drag System**
   - Implement drag service and operations
   - Complete the event cycle