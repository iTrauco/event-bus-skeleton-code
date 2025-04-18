// event-injector.js
const WebSocket = require('ws');
const readline = require('readline');
const chalk = require('chalk');

// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:3000');

// Create CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Available event types
const eventTypes = {
  'select': 'COMMAND_SELECT_SVG',
  'display': 'COMMAND_DISPLAY_SVG',
  'error': 'TRIGGER_ERROR'
};

// SVG files for reference
const svgFiles = [
  { id: 'svg-001', name: 'logo.svg' },
  { id: 'svg-002', name: 'diagram.svg' },
  { id: 'svg-003', name: 'chart.svg' }
];

// Handle connection
socket.on('open', () => {
  console.log(chalk.green('Connected to event bus server'));
  showHelp();
  promptUser();
});

// Handle errors
socket.on('error', (error) => {
  console.log(chalk.red('WebSocket error:'), error);
});

// Show available commands
function showHelp() {
  console.log(chalk.cyan('=== Event Injector Terminal ==='));
  console.log(chalk.cyan('Available commands:'));
  console.log(chalk.yellow('select <id>') + ' - Select an SVG (e.g., select svg-001)');
  console.log(chalk.yellow('display <id> <quadrant>') + ' - Display SVG in quadrant (e.g., display svg-001 1)');
  console.log(chalk.yellow('error') + ' - Trigger an error event');
  console.log(chalk.yellow('list') + ' - Show available SVGs');
  console.log(chalk.yellow('help') + ' - Show this help message');
  console.log(chalk.yellow('exit') + ' - Exit the program');
}

// List available SVGs
function listSvgs() {
  console.log(chalk.cyan('Available SVGs:'));
  svgFiles.forEach(svg => {
    console.log(`  ${chalk.yellow(svg.id)}: ${svg.name}`);
  });
}

// Process user commands
function processCommand(input) {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  
  if (command === 'help') {
    showHelp();
  } else if (command === 'list') {
    listSvgs();
  } else if (command === 'select' && parts[1]) {
    const id = parts[1];
    console.log(chalk.yellow(`Sending select event for SVG ${id}`));
    socket.send(JSON.stringify({
      type: eventTypes.select,
      data: { id }
    }));
  } else if (command === 'display' && parts[1] && parts[2]) {
    const id = parts[1];
    const quadrant = parseInt(parts[2]);
    console.log(chalk.yellow(`Sending display event for SVG ${id} in quadrant ${quadrant}`));
    socket.send(JSON.stringify({
      type: eventTypes.display,
      data: { id, quadrant }
    }));
  } else if (command === 'error') {
    console.log(chalk.yellow('Sending error trigger event'));
    socket.send(JSON.stringify({
      type: eventTypes.error,
      data: { message: 'Terminal triggered error' }
    }));
  } else if (command === 'exit') {
    console.log(chalk.green('Disconnecting...'));
    socket.close();
    rl.close();
    process.exit(0);
  } else {
    console.log(chalk.red('Unknown command. Type "help" for available commands.'));
  }
}

// Prompt user for input
function promptUser() {
  rl.question(chalk.green('> '), (input) => {
    processCommand(input);
    promptUser();
  });
}

// Handle WebSocket closure
socket.on('close', () => {
  console.log(chalk.red('Disconnected from server'));
  rl.close();
  process.exit(0);
});