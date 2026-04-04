import { useEffect } from 'react';
import { RealtimeWebSocketClient } from '../websocketClient';

export const useRealtimeChannel = <TPayload>(
  client: RealtimeWebSocketClient,
  messageType: string,
  handler: (payload: TPayload) => void,
): void => {
  useEffect(() => {
    client.connect();
    const unsubscribe = client.subscribe<TPayload>(messageType, handler);

    return () => {
      unsubscribe();
    };
  }, [client, messageType, handler]);
};
