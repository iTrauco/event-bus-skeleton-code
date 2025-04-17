// renderer/components/svg_controller.js
// Component to respond to SVG events

import { EventTypes } from '../config/constants.js';
import { eventBus } from '../core/event_bus.js';

export class SvgController {
  constructor() {
    this.activeSvgs = [];
    this.setupEventListeners();
    console.log('SvgController created');
  }
  
  setupEventListeners() {
    // Listen for SVG events
    this.unsubscribeSvgSelected = eventBus.on(
      EventTypes.SVG_SELECTED, 
      this.handleSvgSelected.bind(this)
    );
    
    this.unsubscribeSvgDisplayed = eventBus.on(
      EventTypes.SVG_DISPLAYED,
      this.handleSvgDisplayed.bind(this)
    );
  }
  
  handleSvgSelected(data) {
    console.log(`SvgController: SVG selected ${data.id}`);
    // Would update UI to show selection
  }
  
  handleSvgDisplayed(data) {
    console.log(`SvgController: SVG displayed ${data.id}`);
    this.activeSvgs.push(data);
    // Would update UI to show active SVGs
  }
  
  cleanup() {
    // Unsubscribe from events to prevent memory leaks
    this.unsubscribeSvgSelected();
    this.unsubscribeSvgDisplayed();
  }
}

export const svgController = new SvgController();
