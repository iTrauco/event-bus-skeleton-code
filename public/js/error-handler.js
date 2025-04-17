// Error handling module
export function setupErrorHandling(socket) {
  // Set up error trigger button
  document.getElementById('trigger-error').addEventListener('click', () => {
    socket.send(JSON.stringify({
      type: 'TRIGGER_ERROR',
      data: { message: 'User triggered test error' }
    }));
  });
  
  // Add error event handler
  return function handleErrorMessages(message) {
    if (message.type === 'error') {
      const errorLog = document.getElementById('error-log');
      errorLog.innerHTML += `<div class="error-entry">
        <strong>Error in event:</strong> ${message.data.originalEvent}<br>
        <strong>Message:</strong> ${message.data.error}
      </div>`;
      return true; // Error was handled
    }
    return false; // Not an error message
  };
}
