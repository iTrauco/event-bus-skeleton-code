// renderer/core/event_bus.js
// Simple Event Bus - Central message broker for application components

export class EventBus {
  constructor() {
    this.listeners = {};
    console.log('EventBus initialized');
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Emit an event with data
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      callback(data);
    });
  }
}

// Create singleton instance
export const eventBus = new EventBus();
