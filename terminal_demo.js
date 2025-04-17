// terminal_demo.js
const chalk = require('chalk');

// Simple EventBus implementation
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
    let colorLog = console.log;
    
    if (event.startsWith('COMMAND_')) {
      colorLog = (msg, data) => console.log(chalk.yellow(msg), data);
    } else if (event === 'SVG_SELECTED') {
      colorLog = (msg, data) => console.log(chalk.blue(msg), data);
    } else if (event === 'SVG_DISPLAYED') {
      colorLog = (msg, data) => console.log(chalk.green(msg), data);
    }
    
    colorLog(`EVENT: ${event}`, data);
    
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

// Create components
const eventBus = new EventBus();
const svgFiles = ['logo.svg', 'chart.svg', 'diagram.svg'];
let activeQuadrants = {};

// Setup event listeners
console.log(chalk.blue('Setting up components...'));

// SVG Service
eventBus.on(EventTypes.COMMAND_SELECT_SVG, data => {
  console.log(chalk.blue('SVG Service received selection command for'), data.name);
  setTimeout(() => {
    eventBus.emit(EventTypes.SVG_SELECTED, data);
  }, 500);
});

eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, data => {
  console.log(chalk.blue('SVG Service received display command for'), data.name);
  setTimeout(() => {
    activeQuadrants[data.quadrant] = data;
    console.log(chalk.blue('Active SVGs:'), activeQuadrants);
    eventBus.emit(EventTypes.SVG_DISPLAYED, data);
  }, 500);
});

// Simulation
function simulateUserAction() {
  console.log(chalk.gray('-----------------------------------------'));
  
  // Pick random SVG
  const randomIndex = Math.floor(Math.random() * svgFiles.length);
  const svgName = svgFiles[randomIndex];
  const id = `svg-${Date.now()}`;
  
  console.log(chalk.magenta('User selects:'), svgName);
  
  // Emit selection event
  eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id, name: svgName });
  
  // After selection, simulate display command
  setTimeout(() => {
    const quadrant = Math.floor(Math.random() * 4) + 1;
    console.log(chalk.magenta('User displays in quadrant:'), quadrant);
    eventBus.emit(EventTypes.COMMAND_DISPLAY_SVG, { id, name: svgName, quadrant });
  }, 1000);
}

// Run simulation
console.log(chalk.blue('Starting simulation...'));

// Run a few simulations then exit
let count = 0;
const interval = setInterval(() => {
  simulateUserAction();
  count++;
  if (count >= 3) {
    clearInterval(interval);
    setTimeout(() => {
      console.log(chalk.blue('Simulation complete. Final state:'));
      console.log(chalk.blue('Active SVGs:'), activeQuadrants);
      console.log(chalk.blue('Event bus demo finished.'));
    }, 2000);
  }
}, 3000);

