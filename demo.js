// demo.js - updated to include SvgController

import { EventBus } from './renderer/core/event_bus.js';
import { EventTypes } from './renderer/config/constants.js';

const eventBus = new EventBus();
const logElement = document.getElementById('log');
const svgListElement = document.getElementById('svg-file-list');
const controllerLogElement = document.createElement('div');
controllerLogElement.id = 'controller-log';
controllerLogElement.className = 'log';
controllerLogElement.style.height = '150px';
document.body.appendChild(document.createElement('h3')).textContent = 'Controller Log';
document.body.appendChild(controllerLogElement);

// Mock SVG files
const svgFiles = [
  { id: 'svg-001', name: 'logo.svg' },
  { id: 'svg-002', name: 'diagram.svg' },
  { id: 'svg-003', name: 'chart.svg' }
];

function log(message) {
  const entry = document.createElement('div');
  entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
}

function controllerLog(message) {
  const entry = document.createElement('div');
  entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  controllerLogElement.appendChild(entry);
  controllerLogElement.scrollTop = controllerLogElement.scrollHeight;
}

// SvgList Component
class SvgList {
  constructor() {
    this.selectedId = null;
    this.render();
  }
  
  handleClick(id) {
    this.selectedId = id;
    log(`SvgList: User clicked on SVG with ID ${id}`);
    
    eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id });
    
    this.render();
  }
  
  render() {
    svgListElement.innerHTML = '';
    
    svgFiles.forEach(file => {
      const item = document.createElement('div');
      item.className = `svg-item ${file.id === this.selectedId ? 'selected' : ''}`;
      item.textContent = file.name;
      item.onclick = () => this.handleClick(file.id);
      svgListElement.appendChild(item);
    });
  }
}

// SvgService
class SvgService {
  constructor() {
    log('SvgService: Initializing and setting up event listeners');
    
    eventBus.on(EventTypes.COMMAND_SELECT_SVG, data => {
      log(`SvgService: Received COMMAND_SELECT_SVG for ID ${data.id}`);
      
      setTimeout(() => {
        log(`SvgService: Selection processed, emitting SVG_SELECTED event`);
        eventBus.emit(EventTypes.SVG_SELECTED, { id: data.id });
      }, 500);
    });
  }
}

// SVG Controller Component
class SvgController {
  constructor() {
    this.activeSvgs = [];
    
    controllerLog('SvgController: Initializing');
    
    eventBus.on(EventTypes.SVG_SELECTED, data => {
      controllerLog(`SvgController: SVG selected ${data.id}`);
      
      // Simulating display after selection
      setTimeout(() => {
        controllerLog(`SvgController: Displaying SVG ${data.id}`);
        eventBus.emit(EventTypes.SVG_DISPLAYED, {
          id: data.id,
          quadrant: Math.floor(Math.random() * 4) + 1
        });
      }, 300);
    });
    
    eventBus.on(EventTypes.SVG_DISPLAYED, data => {
      controllerLog(`SvgController: SVG displayed in quadrant ${data.quadrant}`);
      this.activeSvgs.push(data);
      this.updateActiveList();
    });
  }
  
  updateActiveList() {
    const activeListDiv = document.getElementById('active-list') || 
      document.createElement('div');
    
    activeListDiv.id = 'active-list';
    activeListDiv.innerHTML = '<h3>Active SVGs</h3>';
    
    if (this.activeSvgs.length === 0) {
      activeListDiv.innerHTML += '<p>No active SVGs</p>';
    } else {
      const ul = document.createElement('ul');
      this.activeSvgs.forEach(svg => {
        const li = document.createElement('li');
        li.textContent = `SVG ${svg.id} in quadrant ${svg.quadrant}`;
        ul.appendChild(li);
      });
      activeListDiv.appendChild(ul);
    }
    
    if (!document.getElementById('active-list')) {
      document.body.appendChild(activeListDiv);
    }
  }
}

// Initialize components
log('Initializing application...');
const svgList = new SvgList();
const svgService = new SvgService();
const svgController = new SvgController();

log('Application ready - click on an SVG item to see event flow');