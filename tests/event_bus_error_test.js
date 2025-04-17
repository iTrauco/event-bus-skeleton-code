// tests/event_bus_error_test.js
import { EventBus } from '../renderer/core/event_bus.js';

// Create a test instance
const eventBus = new EventBus();

// Set up an error listener
eventBus.on('error', (errorData) => {
  console.log('Error event captured:', errorData.originalEvent);
  console.log('Error message:', errorData.error);
});

// Test normal event
eventBus.on('test', (data) => {
  console.log('Test event received:', data);
});

// Test error-throwing event
eventBus.on('problematic', () => {
  throw new Error('Simulated error in event handler');
});

// Trigger events
console.log('Triggering normal event...');
eventBus.emit('test', { message: 'Hello' });

console.log('\nTriggering problematic event...');
eventBus.emit('problematic', { shouldFail: true });

console.log('\nVerifying system still works...');
eventBus.emit('test', { message: 'Still working' });
