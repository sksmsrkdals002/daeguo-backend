import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url) => {
  const [onlineCount, setOnlineCount] = useState(0);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'online_count') setOnlineCount(data.count);
        } catch {}
      };

      ws.current.onclose = () => {
        // 3초 후 재연결
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [url]);

  return { onlineCount };
};

export default useWebSocket;
