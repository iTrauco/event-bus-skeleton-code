/**
 * Unit Tests for EventBus
 * 
 * This file contains Jest tests for the EventBus implementation, focusing on:
 * - Basic event subscription and emission
 * - Error handling for event callbacks
 * - Prevention of infinite error loops
 * 
 * Run these tests with: npm test
 */
import { EventBus } from '../../renderer/core/event_bus.js';

describe('EventBus', () => {
  let eventBus;
  
  beforeEach(() => {
    eventBus = new EventBus();
  });
  
  test('should subscribe to events', () => {
    const callback = jest.fn();
    eventBus.on('test', callback);
    eventBus.emit('test', { data: 'value' });
    expect(callback).toHaveBeenCalledWith({ data: 'value' });
  });
  
  test('should handle errors and emit error event', () => {
    const errorCallback = jest.fn();
    eventBus.on('error', errorCallback);
    
    const errorThrowingCallback = () => {
      throw new Error('Test error');
    };
    
    eventBus.on('problem', errorThrowingCallback);
    eventBus.emit('problem', {});
    
    expect(errorCallback).toHaveBeenCalled();
    expect(errorCallback.mock.calls[0][0].originalEvent).toBe('problem');
    expect(errorCallback.mock.calls[0][0].error).toBeDefined();
  });
  
  test('should prevent infinite loops with error events', () => {
    const errorCallback = jest.fn(() => {
      throw new Error('Error in error handler');
    });
    
    eventBus.on('error', errorCallback);
    eventBus.emit('error', { originalEvent: 'test' });
    
    // The error handler should be called but not cause an infinite loop
    expect(errorCallback).toHaveBeenCalledTimes(1);
  });
});