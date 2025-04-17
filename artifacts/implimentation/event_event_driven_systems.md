Event Bus Skeleton Code
Overview
This repository contains minimal skeleton code for implementing an event bus pattern in a JavaScript application. All business logic has been stripped away to focus solely on the event communication mechanisms.
Purpose
Demonstrate a barebones event-driven architecture focused on:

Centralized event publication/subscription
Component communication via events
State management with reducers
Unidirectional data flow

Structure
├── config/
│   └── constants.js       # Event types and other constants
├── core/
│   └── event-bus.js       # Core event bus implementation
├── store/
│   ├── app-store.js       # Central store
│   └── reducers/          # State reducers
│       ├── index.js
│       ├── svg-reducer.js
│       ├── ui-reducer.js
│       └── drag-reducer.js
├── services/
│   ├── service-provider.js # Service registration
│   ├── svg-service.js     # Event handlers for SVG operations
│   └── drag-service.js    # Event handlers for drag operations
├── components/
│   ├── component-factory.js # Component registration
│   ├── svg-list.js        # List component skeleton
│   └── svg-controller.js  # Controller component skeleton
├── utils/
│   ├── dom-utils.js       # DOM manipulation utilities
│   └── svg-utils.js       # SVG utility functions
├── preload.js             # Browser compatibility layer
└── index.js               # Application entry point
Key Concepts

Event Bus: Central hub for all application events
Command Events: Request actions (prefix: COMMAND_)
State Events: Notify state changes
Reducers: Pure functions for state updates
Services: Business logic handlers for commands
Components: UI elements that emit/listen to events

Implementation Details

Singleton instances for event bus, store, and services
Event flow: Component → Command Event → Service → Store Update → UI Update
Clear component lifecycles (mount/unmount)
Consistent logger tags for debugging

Getting Started

Clone the repository
Run npm install
Run npm run dev to start in development mode
Use browser console to test event emissions:
jswindow.App.eventBus.emit('EVENT_NAME', { data: 'value' });


Testing Events
The repository includes basic event flow for:

Selection events
Display events
Visibility toggle events
Drag events

Development
Focus on implementing each step in isolation:

Add event emission logging
Implement basic event handlers
Connect store updates to events
Test event chains via console
