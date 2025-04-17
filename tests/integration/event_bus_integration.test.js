/**
 * Integration Tests for EventBus with Components
 * 
 * Tests how the EventBus interacts with services and components,
 * focusing on error propagation across the application.
 */
import { EventBus } from '../../renderer/core/event_bus.js';
import { EventTypes } from '../../renderer/config/constants.js';

describe('EventBus Integration', () => {
  let eventBus;
  let mockSvgService;
  let mockSvgController;
  let errorHandler;
  
  beforeEach(() => {
    eventBus = new EventBus();
    errorHandler = jest.fn();
    eventBus.on('error', errorHandler);
    
    // Mock service
    mockSvgService = {
      handleSelectSvg: jest.fn(),
      errorThrowingHandler: jest.fn().mockImplementation(() => {
        throw new Error('Service error');
      })
    };
    
    // Mock component
    mockSvgController = {
      handleSvgSelected: jest.fn()
    };
    
    // Setup event listeners
    eventBus.on(EventTypes.COMMAND_SELECT_SVG, mockSvgService.handleSelectSvg);
    eventBus.on('problematic-event', mockSvgService.errorThrowingHandler);
  });
  
  test('events should flow between components and handle errors', () => {
    // Trigger normal event flow
    eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id: 'test-svg' });
    expect(mockSvgService.handleSelectSvg).toHaveBeenCalledWith({ id: 'test-svg' });
    
    // Trigger error event
    eventBus.emit('problematic-event', { data: 'test' });
    
    // Verify error was caught
    expect(errorHandler).toHaveBeenCalled();
    expect(errorHandler.mock.calls[0][0].originalEvent).toBe('problematic-event');
    
    // Verify system still works after error
    eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id: 'another-svg' });
    expect(mockSvgService.handleSelectSvg).toHaveBeenCalledWith({ id: 'another-svg' });
  });
});
