# Backend Integration Guide

This guide explains how the frontend should integrate with a real backend (S3M-Core), while keeping local development simple.

> Current state: the app is mock-data driven through Zustand (`useAppStore` in `src/app/store.ts`).
>  
> Goal state: data comes from S3M-Core (HTTP + WebSocket), then is normalized into frontend state.

---

## 1) Architecture overview

Use a 4-layer model:

1. **UI layer (React components)**
   - Workspace components render data and call actions.
   - Example: `DecisionsWorkspace.tsx` renders decisions and updates status.

2. **Hook layer (integration hooks)**
   - Hooks fetch/subscribe data and expose UI-friendly state.
   - Hooks hide transport details (REST/WebSocket/retries).

3. **API client layer**
   - Shared HTTP + WebSocket clients.
   - Handles auth headers, error mapping, and rate-limit responses.

4. **Store layer (Zustand)**
   - Single local source of truth for current session state.
   - Receives hydrated backend data plus optimistic UI updates.

### Data flow

`Component -> Integration Hook -> API Client -> S3M-Core -> Hook -> Zustand -> Component`

---

## 2) Hook usage (current and target)

### Current hooks in this repo

#### `useAppStore()`
- File: `src/app/store.ts`
- Role: app state + mock decisions + actions
- Backend integration role: still useful as the final UI state container

Typical usage:

```tsx
const { decisions, updateDecisionStatus } = useAppStore();
```

#### `useIsMobile()`
- File: `src/app/components/ui/use-mobile.ts`
- Role: layout responsiveness only (not backend-related)

---

### Recommended backend integration hooks

These hooks are not implemented yet, but this is the intended contract for integration:

#### `useWorkspaceDecisions(workspaceId: string)`
- Returns decisions for a workspace
- Exposes loading/error state
- Optionally supports polling fallback

Suggested return shape:

```ts
{
  decisions: Decision[];
  isLoading: boolean;
  error: ApiError | null;
  refresh: () => Promise<void>;
}
```

#### `useDecisionActions(workspaceId: string)`
- Exposes mutation actions (approve/reject/defer/escalate)
- Performs optimistic UI updates, then confirms with backend
- Rolls back on failure

#### `useWorkspaceFeed(workspaceId: string)`
- Subscribes to WebSocket updates (decision updates, alerts, timeline events)
- Reconnects with exponential backoff
- Publishes normalized events to store

#### `useBackendHealth()`
- Checks API + WebSocket health
- Useful for top-bar status badges and troubleshooting views

---

## 3) Example: Getting decisions in a workspace

Below is a minimal integration pattern for `DecisionsWorkspace`.

```tsx
import { useEffect } from "react";
import { useAppStore } from "@/app/store";
import { useWorkspaceDecisions } from "@/app/hooks/useWorkspaceDecisions";

export function DecisionsWorkspaceContainer({ workspaceId }: { workspaceId: string }) {
  const { setDecisions } = useAppStore(); // add this action during integration
  const { decisions, isLoading, error, refresh } = useWorkspaceDecisions(workspaceId);

  useEffect(() => {
    if (decisions) setDecisions(decisions);
  }, [decisions, setDecisions]);

  if (isLoading) return <div>Loading decisions...</div>;
  if (error) return <div>Failed to load decisions. <button onClick={refresh}>Retry</button></div>;

  return <DecisionsWorkspace />;
}
```

Key points:
- Keep backend calls out of visual components when possible.
- Normalize backend data once (hook/client), not in every component.
- Store remains the UI-facing interface.

---

## 4) Environment variable reference

Use Vite-style env names (`VITE_*`).

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `VITE_BACKEND_MODE` | Yes | `mock` or `real` | Global switch between local mock and S3M-Core |
| `VITE_API_BASE_URL` | Yes (real mode) | `https://s3m-core.example.com/api/v1` | Base URL for REST requests |
| `VITE_WS_BASE_URL` | Yes (real mode) | `wss://s3m-core.example.com/ws` | Base URL for WebSocket |
| `VITE_AUTH_TOKEN` | Dev only | `eyJ...` | Bearer token for local testing |
| `VITE_REQUEST_TIMEOUT_MS` | No | `15000` | HTTP timeout |
| `VITE_WS_RECONNECT_MS` | No | `1000` | Initial reconnect delay |
| `VITE_ENABLE_VERBOSE_API_LOGS` | No | `true` | Enable request/response debug logs |

Recommended local files:
- `.env.local` for developer machine values
- `.env.mock` for mock-only defaults
- `.env.real` for real backend defaults (non-secret)

---

## 5) Troubleshooting guide

### Symptom: workspace shows no decisions
- Confirm `VITE_BACKEND_MODE` is correct.
- Verify network calls in browser devtools.
- Check auth token exists and is not expired.
- Confirm `workspaceId` is valid for that user/tenant.

### Symptom: actions appear in UI but not persisted
- Inspect mutation response codes (`2xx` expected).
- Confirm optimistic updates are rolled back on non-`2xx`.
- Check if backend requires `If-Match` or version fields.

### Symptom: live updates stop after a few minutes
- Verify WebSocket keep-alive/ping behavior.
- Validate reconnect backoff logic and max-attempt rules.
- Ensure token refresh also updates WebSocket auth.

### Symptom: intermittent `429 Too Many Requests`
- Respect `Retry-After` and `X-RateLimit-*` headers.
- Add debounce for high-frequency UI actions.
- Batch refreshes per workspace where possible.

### Symptom: CORS errors in browser
- Confirm frontend origin is allow-listed on backend.
- Ensure `Authorization` is allowed in `Access-Control-Allow-Headers`.

---

## 6) Migration path: mock -> real backend

Use an incremental migration (by feature slice):

1. **Stabilize local contracts**
   - Define TypeScript DTOs for decisions, alerts, and timeline events.
   - Keep current mock data matching those DTOs.

2. **Introduce API client + adapters**
   - Add `apiClient` and mapping functions (`api -> app model`).
   - Keep UI unchanged.

3. **Add integration hooks**
   - Add read hooks first (`useWorkspaceDecisions`).
   - Then mutation hooks (`useDecisionActions`).

4. **Wire hooks into one workspace**
   - Start with `DecisionsWorkspace` only.
   - Keep other workspaces on mock state.

5. **Enable WebSocket for live updates**
   - Subscribe to decision and alert events.
   - Merge events into store safely (idempotent updates).

6. **Flip mode by environment**
   - `mock` in local default.
   - `real` in integration/staging.
   - Remove mock fallback only when parity is proven.

7. **Add integration tests and observability**
   - API contract tests.
   - WebSocket reconnection tests.
   - Logging and request tracing for production support.

