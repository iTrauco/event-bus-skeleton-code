// renderer/index.js
// Entry point for the application

import { eventBus } from './core/event_bus.js';
import { EventTypes } from './config/constants.js';
import { svgList } from './components/svg_list.js';
import { svgService } from './services/svg_service.js';

// Initialize components
svgList.mount();

// Simulate user clicking on an SVG file
console.log('--- SIMULATION START ---');
console.log('User clicks on SVG file "logo.svg"');

// This triggers the event chain:
// 1. svgList emits COMMAND_SELECT_SVG
// 2. svgService receives it and emits SVG_SELECTED
svgList.handleSvgFileClick('svg-001');

console.log('--- SIMULATION END ---');
