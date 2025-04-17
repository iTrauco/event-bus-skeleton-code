import { setupErrorHandling } from './error-handler.js';

// Event types
export const EventTypes = {
  SVG_SELECTED: 'SVG_SELECTED',
  SVG_DISPLAYED: 'SVG_DISPLAYED',
  COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
  COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG',
  TRIGGER_ERROR: 'TRIGGER_ERROR'
};

// Initialize the application
export function initApp() {
  // Connect to WebSocket server
  const socket = new WebSocket(`ws://${window.location.host}`);
  let selectedSvgId = null;
  
  // Set up error handling
  const handleErrorMessage = setupErrorHandling(socket);
  
  // Handle WebSocket messages
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    // Check if it's an error message
    if (handleErrorMessage(message)) return;
    
    // Handle regular messages
    if (message.type === 'SVG_LIST') {
      renderSvgList(message.data);
    } else if (message.type === EventTypes.SVG_SELECTED) {
      selectedSvgId = message.data.id;
      renderSvgList();
    } else if (message.type === EventTypes.SVG_DISPLAYED) {
      renderActiveQuadrant(message.data);
    }
  };
  
  // Initialize UI
  setupQuadrants();
  
  // Render SVG list
  function renderSvgList(svgFiles = []) {
    const listElement = document.getElementById('svg-list');
    if (!listElement) return;
    
    if (svgFiles.length > 0) {
      window.svgFiles = svgFiles;
    }
    
    if (!window.svgFiles || window.svgFiles.length === 0) {
      listElement.innerHTML = '<div>No SVG files available</div>';
      return;
    }
    
    listElement.innerHTML = '';
    window.svgFiles.forEach(file => {
      const item = document.createElement('div');
      item.className = `svg-item ${file.id === selectedSvgId ? 'selected' : ''}`;
      item.textContent = file.name;
      item.onclick = () => handleSvgClick(file);
      listElement.appendChild(item);
    });
  }
  
  // Handle SVG file click
  function handleSvgClick(file) {
    socket.send(JSON.stringify({
      type: EventTypes.COMMAND_SELECT_SVG,
      data: file
    }));
  }
  
  // Set up quadrant click handlers
  function setupQuadrants() {
    const quadrants = document.querySelectorAll('.quadrant');
    quadrants.forEach(quadrant => {
      quadrant.onclick = () => {
        if (!selectedSvgId) {
          alert('Please select an SVG file first');
          return;
        }
        
        const quadrantId = parseInt(quadrant.dataset.id);
        const file = window.svgFiles.find(f => f.id === selectedSvgId);
        
        socket.send(JSON.stringify({
          type: EventTypes.COMMAND_DISPLAY_SVG,
          data: { ...file, quadrant: quadrantId }
        }));
      };
    });
  }
  
  // Render active quadrant
  function renderActiveQuadrant(data) {
    const quadrant = document.querySelector(`.quadrant[data-id="${data.quadrant}"]`);
    if (!quadrant) return;
    
    const existing = quadrant.querySelector('.active-svg');
    if (existing) existing.remove();
    
    const svgElement = document.createElement('div');
    svgElement.className = 'active-svg';
    svgElement.textContent = data.name;
    quadrant.appendChild(svgElement);
  }
}
