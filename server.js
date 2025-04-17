// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const chalk = require('chalk');

// Initialize Express app, HTTP server, and WebSocket server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// Event Bus implementation
class EventBus {
  constructor() {
    this.listeners = {};
    console.log(chalk.blue('EventBus initialized'));
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    // Color-coded terminal logging
    if (event.startsWith('COMMAND_')) {
      console.log(chalk.yellow(`EVENT: ${event}`), data);
    } else if (event === 'SVG_SELECTED') {
      console.log(chalk.blue(`EVENT: ${event}`), data);
    } else if (event === 'SVG_DISPLAYED') {
      console.log(chalk.green(`EVENT: ${event}`), data);
    } else {
      console.log(`EVENT: ${event}`, data);
    }
    
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

// Event types
const EventTypes = {
  SVG_SELECTED: 'SVG_SELECTED',
  SVG_DISPLAYED: 'SVG_DISPLAYED',
  COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
  COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG'
};

// Create event bus
const eventBus = new EventBus();
let activeQuadrants = {};

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log(chalk.green('✓ Browser connected'));
  
  // Send available SVGs to browser
  const svgFiles = [
    { id: 'svg-001', name: 'logo.svg' },
    { id: 'svg-002', name: 'diagram.svg' },
    { id: 'svg-003', name: 'chart.svg' }
  ];
  
  ws.send(JSON.stringify({ type: 'SVG_LIST', data: svgFiles }));

  // Handle messages from browser
  ws.on('message', (message) => {
    const { type, data } = JSON.parse(message);
    
    // Emit events to the event bus
    eventBus.emit(type, data);
  });

  // Set up event handlers
  eventBus.on(EventTypes.COMMAND_SELECT_SVG, data => {
    console.log(chalk.blue('SVG Service processing selection:'), data.id);
    
    // Process selection (simulated delay)
    setTimeout(() => {
      eventBus.emit(EventTypes.SVG_SELECTED, data);
      ws.send(JSON.stringify({ type: EventTypes.SVG_SELECTED, data }));
    }, 500);
  });

  eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, data => {
    console.log(chalk.blue('SVG Service processing display:'), data);
    
    // Process display (simulated delay)
    setTimeout(() => {
      activeQuadrants[data.quadrant] = data;
      console.log(chalk.blue('Active SVGs:'), activeQuadrants);
      
      eventBus.emit(EventTypes.SVG_DISPLAYED, data);
      ws.send(JSON.stringify({ type: EventTypes.SVG_DISPLAYED, data }));
    }, 500);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(chalk.green(`Server running at http://localhost:${PORT}`));
  console.log(chalk.blue('Open the browser to interact with the event bus demo'));
});
