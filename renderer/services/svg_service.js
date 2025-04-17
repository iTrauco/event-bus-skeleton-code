// renderer/services/svg_service.js
// SVG Service - Handles SVG management

import { eventBus } from '../core/event_bus.js';
import { EventTypes } from '../config/constants.js';

export class SvgService {
  constructor() {
    this.svgCache = new Map();
    this.setupEventListeners();
    console.log('SVG Service created');
  }
  
  setupEventListeners() {
    // Subscribe to events
    eventBus.on(EventTypes.COMMAND_SELECT_SVG, this.handleSelectSvg.bind(this));
    eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, this.handleDisplaySvg.bind(this));
  }
  
  handleSelectSvg(data) {
    if (!data || !data.id) return;
    console.log(`SVG selected: ${data.id}`);
    
    // Publish event for other components
    eventBus.emit(EventTypes.SVG_SELECTED, { id: data.id });
  }
  
  handleDisplaySvg(data) {
    if (!data || !data.id) return;
    console.log(`Displaying SVG: ${data.id}`);
    
    // Publish event
    eventBus.emit(EventTypes.SVG_DISPLAYED, data);
  }
}

// Create singleton instance
export const svgService = new SvgService();
