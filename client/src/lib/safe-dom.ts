/**
 * Safe DOM operations to prevent DOMException errors
 */

// Safe localStorage operations
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Safe canvas operations
export const safeCanvas = {
  getContext: (canvas: HTMLCanvasElement, type: '2d' | 'webgl' = '2d'): CanvasRenderingContext2D | WebGLRenderingContext | null => {
    try {
      if (!canvas || typeof canvas.getContext !== 'function') return null;
      return canvas.getContext(type);
    } catch {
      return null;
    }
  },

  setDimensions: (canvas: HTMLCanvasElement, width: number, height: number): boolean => {
    try {
      if (!canvas || width <= 0 || height <= 0 || width > 4096 || height > 4096) return false;
      canvas.width = width;
      canvas.height = height;
      return true;
    } catch {
      return false;
    }
  },

  toDataURL: (canvas: HTMLCanvasElement, type = 'image/png', quality?: number): string | null => {
    try {
      if (!canvas || typeof canvas.toDataURL !== 'function') return null;
      const dataURL = canvas.toDataURL(type, quality);
      if (!dataURL || dataURL === 'data:,') return null;
      return dataURL;
    } catch {
      return null;
    }
  },

  toBlob: (canvas: HTMLCanvasElement, callback: (blob: Blob | null) => void, type = 'image/png', quality?: number): void => {
    try {
      if (!canvas || typeof canvas.toBlob !== 'function') {
        callback(null);
        return;
      }
      canvas.toBlob(callback, type, quality);
    } catch {
      callback(null);
    }
  }
};

// Safe DOM manipulation
export const safeDom = {
  createElement: (tagName: string): HTMLElement | null => {
    try {
      if (typeof document === 'undefined') return null;
      return document.createElement(tagName);
    } catch {
      return null;
    }
  },

  appendChild: (parent: Element, child: Element): boolean => {
    try {
      if (!parent || !child || typeof parent.appendChild !== 'function') return false;
      parent.appendChild(child);
      return true;
    } catch {
      return false;
    }
  },

  removeChild: (parent: Element, child: Element): boolean => {
    try {
      if (!parent || !child || typeof parent.removeChild !== 'function') return false;
      if (!parent.contains(child)) return true; // Already removed
      parent.removeChild(child);
      return true;
    } catch {
      return false;
    }
  },

  click: (element: HTMLElement): boolean => {
    try {
      if (!element || typeof element.click !== 'function') return false;
      element.click();
      return true;
    } catch {
      return false;
    }
  }
};

// Safe file download
export const safeDownload = {
  downloadCanvas: (canvas: HTMLCanvasElement, filename: string): boolean => {
    try {
      const dataURL = safeCanvas.toDataURL(canvas);
      if (!dataURL) return false;

      const link = safeDom.createElement('a') as HTMLAnchorElement;
      if (!link) return false;

      link.download = filename;
      link.href = dataURL;
      link.style.display = 'none';

      const body = document.body;
      if (!body) return false;

      const appended = safeDom.appendChild(body, link);
      if (!appended) return false;

      const clicked = safeDom.click(link);
      
      // Clean up after a short delay
      setTimeout(() => {
        safeDom.removeChild(body, link);
      }, 100);

      return clicked;
    } catch {
      return false;
    }
  },

  downloadBlob: (blob: Blob, filename: string): boolean => {
    try {
      const url = URL.createObjectURL(blob);
      const link = safeDom.createElement('a') as HTMLAnchorElement;
      if (!link) return false;

      link.download = filename;
      link.href = url;
      link.style.display = 'none';

      const body = document.body;
      if (!body) return false;

      const appended = safeDom.appendChild(body, link);
      if (!appended) return false;

      const clicked = safeDom.click(link);

      // Clean up
      setTimeout(() => {
        safeDom.removeChild(body, link);
        URL.revokeObjectURL(url);
      }, 100);

      return clicked;
    } catch {
      return false;
    }
  }
};

// Safe WebSocket operations
export const safeWebSocket = {
  create: (url: string, protocols?: string | string[]): WebSocket | null => {
    try {
      if (typeof WebSocket === 'undefined') return null;
      return new WebSocket(url, protocols);
    } catch {
      return null;
    }
  },

  send: (ws: WebSocket, data: string | ArrayBuffer | Blob): boolean => {
    try {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(data);
      return true;
    } catch {
      return false;
    }
  },

  close: (ws: WebSocket, code?: number, reason?: string): boolean => {
    try {
      if (!ws) return true;
      if (ws.readyState === WebSocket.CLOSED) return true;
      ws.close(code, reason);
      return true;
    } catch {
      return false;
    }
  }
};

// Error logging without throwing exceptions
export const safeLog = {
  error: (...args: any[]): void => {
    try {
      if (typeof console !== 'undefined' && console.error) {
        console.error(...args);
      }
    } catch {
      // Ignore logging errors
    }
  },

  warn: (...args: any[]): void => {
    try {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(...args);
      }
    } catch {
      // Ignore logging errors
    }
  },

  info: (...args: any[]): void => {
    try {
      if (typeof console !== 'undefined' && console.info) {
        console.info(...args);
      }
    } catch {
      // Ignore logging errors
    }
  }
};