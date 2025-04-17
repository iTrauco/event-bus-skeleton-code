/**
 * Event Bus Implementation with Error Handling
 * 
 * This module implements a pub/sub pattern for application-wide event handling.
 * Features:
 * - Event subscription and emission
 * - Automatic error handling with error events
 * - Prevention of infinite error loops
 * - Debug logging for development environments
 * 
 * Usage:
 * - Import { eventBus } from this file
 * - Subscribe to events with eventBus.on(eventName, callback)
 * - Publish events with eventBus.emit(eventName, data)
 * - Unsubscribe with the returned function from eventBus.on()
 */
export class EventBus {
  /**
   * Creates a new EventBus instance
   */
  constructor() {
    // Map of event names to arrays of callback functions
    this.listeners = {};
    // Enable detailed logging in development mode
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Subscribe to an event
   * @param {string} event - The event name to subscribe to
   * @param {Function} callback - The callback function to execute when event occurs
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    if (this.debug) console.log(`Listener added for '${event}'`);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - The event name to unsubscribe from
   * @param {Function} callback - The callback function to remove
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    if (this.debug) console.log(`Listener removed from '${event}'`);
    
    // Clean up empty event arrays
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }

  /**
   * Emit an event with data to all subscribers
   * @param {string} event - The event name to emit
   * @param {any} data - Data to pass to subscribers
   */
  emit(event, data) {
    if (this.debug) console.log(`Emitting '${event}'`);
    
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in '${event}' event handler:`, error);
        
        // Special handling for error events to prevent infinite loops
        if (event !== 'error') {
          this.emit('error', { 
            originalEvent: event, 
            error: error.message, 
            stack: error.stack,
            data
          });
        }
      }
    });
  }
}

// Singleton instance for application-wide use
export const eventBus = new EventBus();