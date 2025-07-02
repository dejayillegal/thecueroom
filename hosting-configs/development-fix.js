// Development Environment Fix for WebSocket Issues
// This resolves Vite HMR WebSocket connection problems in Replit

const fixViteWebSocket = () => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    // Override WebSocket URL for Vite HMR in Replit
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      if (typeof url === 'string' && url.includes('localhost:undefined')) {
        // Fix the undefined port issue
        const currentHost = window.location.host;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        url = url.replace('wss://localhost:undefined', `${protocol}//${currentHost}`);
        url = url.replace('ws://localhost:undefined', `${protocol}//${currentHost}`);
      }
      return new originalWebSocket(url, protocols);
    };
  }
};

// Apply fix immediately
fixViteWebSocket();

export default fixViteWebSocket;