/**
 * Event Bus Error Handling Demo
 * 
 * This script demonstrates the error handling capabilities of the EventBus.
 * It shows:
 * - Normal event handling
 * - Error capturing and reporting
 * - System resilience after errors
 * 
 * Run this demo with: node -r esm tests/manual/demo_error_handling.js
 */

// tests/manual/demo_error_handling.js
import { eventBus } from '../../renderer/core/event_bus.js';

// Set up logging for demonstration
console.log('--- EVENT BUS ERROR HANDLING DEMO ---');

// Register normal handler
eventBus.on('normalEvent', (data) => {
  console.log(`Normal event received: ${JSON.stringify(data)}`);
});

// Register error handler
eventBus.on('error', (errorData) => {
  console.log(`ERROR EVENT RECEIVED:`);
  console.log(`- Original event: ${errorData.originalEvent}`);
  console.log(`- Error message: ${errorData.error}`);
  console.log(`- Stack: ${errorData.stack ? 'Available' : 'Not available'}`);
});

// Register problematic handler
eventBus.on('problematicEvent', () => {
  throw new Error('This is a simulated error in an event handler');
});

// Test sequence
console.log('\n1. Emitting normal event...');
eventBus.emit('normalEvent', { message: 'Hello world' });

console.log('\n2. Emitting problematic event...');
eventBus.emit('problematicEvent', { data: 'Will cause error' });

console.log('\n3. Emitting normal event again to show system still works...');
eventBus.emit('normalEvent', { message: 'System recovered' });

console.log('\n--- DEMO COMPLETE ---');
