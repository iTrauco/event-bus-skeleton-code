// event-monitor.js
const WebSocket = require('ws');
const chalk = require('chalk');

// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:3000');

console.log(chalk.cyan('=== Event Bus Monitor ==='));
console.log(chalk.cyan('Watching for events...'));

// Create a special event monitoring WebSocket
socket.on('open', () => {
  console.log(chalk.green('Connected to event bus server'));
  
  // Send a special monitoring registration message
  socket.send(JSON.stringify({
    type: 'MONITOR_EVENTS',
    data: { enabled: true }
  }));
});

// Handle incoming messages (events)
socket.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    
    // Format the output based on event type
    if (message.type.startsWith('COMMAND_')) {
      console.log(chalk.yellow(`⚡ COMMAND: ${message.type}`), message.data);
    } else if (message.type === 'SVG_SELECTED') {
      console.log(chalk.blue(`📋 STATE: ${message.type}`), message.data);
    } else if (message.type === 'SVG_DISPLAYED') {
      console.log(chalk.green(`🖼️ UI: ${message.type}`), message.data);
    } else if (message.type === 'error') {
      console.log(chalk.red(`❌ ERROR: ${message.type}`), message.data);
      console.log(chalk.red(`  Occurred in: ${message.data.originalEvent}`));
      console.log(chalk.red(`  Message: ${message.data.error}`));
    } else {
      console.log(chalk.gray(`ℹ️ INFO: ${message.type}`), message.data);
    }
  } catch (error) {
    console.log(chalk.red('Error parsing message:'), error);
  }
});

// Handle connection errors
socket.on('error', (error) => {
  console.log(chalk.red('WebSocket error:'), error);
});

// Handle WebSocket closure
socket.on('close', () => {
  console.log(chalk.red('Disconnected from server'));
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down event monitor...'));
  socket.close();
  process.exit(0);
});