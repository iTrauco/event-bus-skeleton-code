// renderer/core/event_bus.js - Enhanced with error handling
export class EventBus {
  constructor() {
    this.listeners = {};
    this.debug = process.env.NODE_ENV === 'development';
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    if (this.debug) console.log(`Listener added for '${event}'`);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    if (this.debug) console.log(`Listener removed from '${event}'`);
    
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }

  emit(event, data) {
    if (this.debug) console.log(`Emitting '${event}'`);
    
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in '${event}' event handler:`, error);
        
        // Emit an error event, but prevent infinite loops
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

export const eventBus = new EventBus();