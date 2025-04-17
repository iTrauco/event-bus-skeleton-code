# Event Bus Implementation with Error Handling

## Overview
This module implements a robust pub/sub event system for the SVG Overlay application with comprehensive error handling.

## Features
- Event subscription and publication  
- Automatic error capture and reporting  
- Prevention of infinite error loops  
- Debug logging for development

## Usage

### Basic Event Flow
```javascript
import { eventBus } from './renderer/core/event_bus.js';

// Subscribe to events
const unsubscribe = eventBus.on('event-name', (data) => {
  console.log('Event received:', data);
});

// Publish events
eventBus.emit('event-name', { message: 'Hello World' });

// Unsubscribe when done
unsubscribe();
```

### Error Handling
The event bus automatically catches errors in event handlers and emits them as `'error'` events:
```javascript
// Set up error listener
eventBus.on('error', (errorData) => {
  console.error(`Error in ${errorData.originalEvent}:`, errorData.error);
  // Take recovery actions
});
```

## Testing
Run tests with:
```bash
npm test
```

## Next Steps
- Event namespacing  
- Event debugging tools  
- Performance optimization  
