# S3M-GUI Backend Integration Layer

This document describes the non-UI backend integration layer used by S3M-GUI to connect to S3M-Core services.

## Goals

- Keep existing UI/UX untouched.
- Isolate all network logic behind service modules.
- Support both HTTP APIs and WebSocket real-time events.
- Allow local development with a mock backend.

## Folder Structure

```
src/services/
  apiClient.ts                # HTTP client wrapper
  websocketClient.ts          # Realtime WebSocket client + subscriptions
  storeSync.ts                # Zustand-compatible sync state helpers
  hooks/
    useApiQuery.ts            # Generic data-fetching hook
    useBackendData.ts         # Domain hooks (snapshot + decisions)
    useRealtimeChannel.ts     # Realtime subscription hook
  mock/
    mockBackend.ts            # In-memory mock backend for local dev
  __tests__/                  # Service-layer unit tests
```

## Runtime Configuration

Configuration is controlled via Vite environment variables:

- `VITE_S3M_API_BASE_URL`
- `VITE_S3M_WS_BASE_URL`
- `VITE_S3M_REQUEST_TIMEOUT_MS`
- `VITE_S3M_ENABLE_MOCK_BACKEND`

See:

- `.env.development`
- `.env.production`

## Data Flow

1. UI components consume hooks from `src/services/hooks`.
2. Hooks call `ApiClient` for REST data and `RealtimeWebSocketClient` for live events.
3. Store sync helpers in `storeSync.ts` map backend payloads into Zustand state slices.
4. Local dev can switch to mock services when `VITE_S3M_ENABLE_MOCK_BACKEND=true`.

## Testing Strategy

Service-layer tests cover:

- request serialization and error handling in `ApiClient`
- subscription/message behavior in `RealtimeWebSocketClient`

This keeps backend behavior verifiable without rendering UI components.
