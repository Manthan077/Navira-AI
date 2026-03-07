// WebSocket client utility with auto-reconnect

const WS_URL = `ws://${window.location.hostname}:4000`;

export function createSocket(onMessage) {
  let ws = null;
  let reconnectTimer = null;
  let isClosing = false;

  function connect() {
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          onMessage(msg);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        if (!isClosing) {
          console.log('🔌 WebSocket disconnected, reconnecting...');
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = (err) => {
        console.error('WS error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('WS connection error:', e);
      reconnectTimer = setTimeout(connect, 2000);
    }
  }

  connect();

  return {
    close() {
      isClosing = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    },
  };
}
