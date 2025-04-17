// renderer/components/svg_list.js
// Component to display and manage SVG file selection

import { EventTypes } from '../config/constants.js';
import { eventBus } from '../core/event_bus.js';

export class SvgList {
  constructor() {
    this.containerId = 'svg-file-list';
    this.mounted = false;
    this.selectedId = null;
    
    // Bind event handlers
    this.handleSvgFileClick = this.handleSvgFileClick.bind(this);
  }
  
  mount() {
    if (this.mounted) return;
    
    console.log('Mounting SVG List component');
    
    // Initial render
    this.render();
    
    this.mounted = true;
  }
  
  unmount() {
    if (!this.mounted) return;
    
    console.log('Unmounting SVG List component');
    
    this.mounted = false;
  }
  
  // Handle SVG file click
  handleSvgFileClick(id) {
    console.log(`SVG file clicked: ${id}`);
    
    // Update selected ID
    this.selectedId = id;
    
    // Publish event
    eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id });
    
    // Update UI
    this.render();
  }
  
  // Render component (placeholder)
  render() {
    console.log('Rendering SVG List');
    // Actual implementation would render to DOM
  }
}

// Create singleton instance
export const svgList = new SvgList();
