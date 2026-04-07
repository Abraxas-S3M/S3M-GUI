import { useEffect } from 'react';
import { BackendWebSocketClient } from '../websocket/client';
import type { BackendSocketEventType } from '../websocket/types';

export const useRealtimeChannel = <TPayload>(
  client: BackendWebSocketClient,
  messageType: BackendSocketEventType,
  handler: (payload: TPayload) => void,
): void => {
  useEffect(() => {
    client.connect();
    const unsubscribe = client.subscribe((event) => {
      if (event.type !== messageType) {
        return;
      }

      handler(event.payload as TPayload);
    });

    return () => {
      unsubscribe();
    };
  }, [client, messageType, handler]);
};
