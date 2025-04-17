# Event Bus Implementation Guide

## Project Structure
```
project-root/
├── 📄 index.html               # Main HTML entry point
├── 📄 package.json             # Project configuration
├── 📄 preload.js               # Browser compatibility layer
├── 📄 start.sh                 # Development startup script
├── 📁 assets/                  # Static assets
│   └── 📁 svgs/                # SVG files for testing
├── 📁 main/                    # Electron main process
│   ├── 📄 file-operations.js   # File system operations
│   ├── 📄 ipc-handler.js       # IPC communication
│   ├── 📄 main.js              # Main process entry
│   └── 📄 window-manager.js    # Window management
├── 📁 renderer/                # Renderer process
│   ├── 📄 index.js             # Renderer entry point
│   ├── 📁 config/              # Configuration
│   │   └── 📄 constants.js     # Event types & constants
│   ├── 📁 core/                # Core functionality
│   │   └── 📄 event-bus.js     # Event bus implementation
│   ├── 📁 store/               # State management
│   │   ├── 📄 app-store.js     # Store implementation
│   │   └── 📁 reducers/        # State reducers
│   │       ├── 📄 index.js     # Reducer combination
│   │       ├── 📄 svg-reducer.js # SVG state reducer
│   │       ├── 📄 ui-reducer.js  # UI state reducer
│   │       └── 📄 drag-reducer.js # Drag state reducer
│   ├── 📁 services/            # Business logic
│   │   ├── 📄 service-provider.js # Service management
│   │   ├── 📄 svg-service.js   # SVG operations
│   │   └── 📄 drag-service.js  # Drag operations
│   ├── 📁 components/          # UI components
│   │   ├── 📄 component-factory.js # Component registry
│   │   ├── 📄 svg-list.js      # SVG selection component
│   │   └── 📄 svg-controller.js # SVG control component
│   └── 📁 utils/               # Utility functions
│       ├── 📄 dom-utils.js     # DOM manipulation
│       └── 📄 svg-utils.js     # SVG utilities
└── 📁 styles/                  # CSS styling
    ├── 📄 main.css             # Main stylesheet
    ├── 📄 base.css             # Base styles
    └── 📁 components/          # Component styles
        ├── 📄 active-svg-table.css
        ├── 📄 control-panel.css
        ├── 📄 drag-system.css
        ├── 📄 fullscreen.css
        ├── 📄 quadrant-grid.css
        ├── 📄 svg-container.css
        └── 📄 vaporwave.css
```

## Implementation Phases

### 🔄 Phase 1: Event Bus Core (branch: `phase1-event-bus-core`)
**Focus:** Event communication foundation

| File | Purpose | Implementation |
|------|---------|---------------|
| `renderer/core/event-bus.js` | Event pub/sub | Create event emitter/listener system |
| `renderer/config/constants.js` | Event definitions | Define all event types |
| `renderer/store/app-store.js` | State container | Implement store with dispatch/subscribe |
| `renderer/store/reducers/index.js` | Reducer combination | Set up reducer combining |
| `renderer/store/reducers/svg-reducer.js` | SVG state | Basic state structure |
| `renderer/store/reducers/ui-reducer.js` | UI state | Basic state structure |
| `renderer/utils/dom-utils.js` | DOM helpers | Element creation utilities |
| `preload.js` | Browser compatibility | Mock API implementation |
| `renderer/index.js` | Application entry | Basic initialization |

### 🛠️ Phase 2: Service Layer (branch: `phase2-service-layer`)
**Focus:** Business logic handlers

| File | Purpose | Implementation |
|------|---------|---------------|
| `renderer/services/service-provider.js` | Service registry | Service registration and initialization |
| `renderer/services/svg-service.js` | SVG operations | SVG selection and display handlers |
| `renderer/utils/svg-utils.js` | SVG helpers | SVG parsing and manipulation |
| `renderer/store/reducers/svg-reducer.js` | SVG state | Full reducer implementation |
| `renderer/index.js` | Service initialization | Register services |

### 🖼️ Phase 3: Component Layer (branch: `phase3-component-layer`)
**Focus:** UI interaction and rendering

| File | Purpose | Implementation |
|------|---------|---------------|
| `renderer/components/component-factory.js` | Component registry | Component lifecycle management |
| `renderer/components/svg-list.js` | SVG selection | List rendering and selection |
| `renderer/components/svg-controller.js` | SVG control | SVG placement and visibility |
| `renderer/index.js` | Component initialization | Register components |
| `styles/components/active-svg-table.css` | Table styling | Component styling |
| `styles/components/svg-container.css` | SVG styling | SVG display styling |
| `styles/components/quadrant-grid.css` | Grid styling | Quadrant layout styling |

### 🔄 Phase 4: Drag System (branch: `phase4-drag-system`)
**Focus:** Advanced interaction

| File | Purpose | Implementation |
|------|---------|---------------|
| `renderer/services/drag-service.js` | Drag operations | Drag event handling |
| `renderer/store/reducers/drag-reducer.js` | Drag state | Drag state management |
| `renderer/components/svg-controller.js` | Drag integration | Drag UI integration |
| `styles/components/drag-system.css` | Drag styling | Drag visual feedback |

## Event Flow Cycle
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

## Key Event Flows

1. **SVG Selection:**
   - User clicks SVG → `COMMAND_SELECT_SVG` → SVG Service → Store Update → UI Refresh

2. **SVG Display:**
   - User clicks quadrant → `COMMAND_DISPLAY_SVG` → SVG Service → Store Update → UI Refresh

3. **Drag Operation:**
   - Enable drag → `COMMAND_ENABLE_DRAG_MODE` → Drag Service → Store Update → UI Refresh
   - Drag start → `DRAG_STARTED` → Store Update → UI Refresh
   - Drag end → `DRAG_ENDED` → Store Update → UI Refresh

## Testing Strategy
1. After each phase, use browser console to test:
   - Event emission and subscription
   - Store state updates
   - Component rendering

2. Console commands for testing:
```javascript
// Test event bus
window.App.eventBus.emit('EVENT_NAME', {data: 'value'});

// Check store state
window.App.store.getState();

// Dispatch action
window.App.store.dispatch({type: 'ACTION_TYPE', payload: data});
```

## Event Bus Implementation Steps

### 1. Basic Event Bus Setup
```javascript
// event-bus.js
class EventBus {
  constructor() {
    this.listeners = {};
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
  }
  
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();
```

### 2. Store Implementation
```javascript
// app-store.js
function createStore(reducer) {
  let state = reducer(undefined, { type: '@@INIT' });
  const listeners = [];
  
  function getState() {
    return state;
  }
  
  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(listener => listener(state));
    return action;
  }
  
  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    };
  }
  
  return { getState, dispatch, subscribe };
}
```

### 3. Component Integration
```javascript
// svg-list.js
class SvgList {
  constructor() {
    this.mounted = false;
  }
  
  mount() {
    // Subscribe to store
    this.unsubscribe = appStore.subscribe(this.handleStoreUpdate.bind(this));
    
    // Initial render
    this.render();
    this.mounted = true;
  }
  
  handleSvgClick(id) {
    // Emit command event
    eventBus.emit('COMMAND_SELECT_SVG', { id });
  }
  
  handleStoreUpdate(state) {
    // Re-render on state change
    this.render();
  }
}
```

### 4. Service Implementation
```javascript
// svg-service.js
class SvgService {
  constructor() {
    // Set up event listeners
    eventBus.on('COMMAND_SELECT_SVG', this.handleSelectSvg.bind(this));
    eventBus.on('COMMAND_DISPLAY_SVG', this.handleDisplaySvg.bind(this));
  }
  
  handleSelectSvg(data) {
    // Update store
    appStore.dispatch({
      type: 'SET_SELECTED_SVG_ID',
      payload: data.id
    });
    
    // Emit state change event
    eventBus.emit('SVG_SELECTED', { id: data.id });
  }
}
```

## Debugging Techniques

1. **Event Tracing:** Add console logs to track event flow
```javascript
emit(event, data) {
  console.log(`[EVENT] Emitting: ${event}`, data);
  // Implementation
}
```

2. **State Logging:** Track state changes
```javascript
dispatch(action) {
  console.log(`[STORE] Before:`, state);
  state = reducer(state, action);
  console.log(`[STORE] After:`, state);
  // Implementation
}
```

3. **Component Lifecycle:** Monitor component mounting
```javascript
mount() {
  console.log(`[COMPONENT] Mounting: ${this.name}`);
  // Implementation
}
```
