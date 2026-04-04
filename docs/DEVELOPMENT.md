# Development Guide (Frontend + Backend Integration)

This guide is for frontend developers who know React and need to work with backend integration confidently.

---

## 1) Run frontend with mock backend

The app currently defaults to mock-style state via `useAppStore`.

### Install and start

```bash
npm i
npm run dev
```

### Suggested mock env (`.env.local`)

```bash
VITE_BACKEND_MODE=mock
VITE_ENABLE_VERBOSE_API_LOGS=true
```

### What mock mode should do

- No dependency on external API availability
- Fast UI iteration for layout/components
- Deterministic demo data for workspaces (including decisions)

---

## 2) Run frontend against real S3M-Core

Switch mode and provide backend endpoints.

### Suggested real env (`.env.local`)

```bash
VITE_BACKEND_MODE=real
VITE_API_BASE_URL=https://s3m-core.example.com/api/v1
VITE_WS_BASE_URL=wss://s3m-core.example.com/ws
VITE_AUTH_TOKEN=<your-dev-token>
VITE_REQUEST_TIMEOUT_MS=15000
VITE_WS_RECONNECT_MS=1000
```

### Startup checklist

1. Backend endpoint reachable from browser
2. Token valid for target environment
3. CORS allows local frontend origin
4. WebSocket endpoint reachable and authenticated

### Recommended integration toggle strategy

- Keep one code path with mode-based data provider selection.
- Avoid scattering `if (mock)` checks in UI components.
- Route both mock and real responses through shared mappers.

---

## 3) Testing integration

Use layered testing:

### A) Contract tests (API format)

- Validate success/error envelopes
- Validate required fields (`id`, `status`, `updatedAt`, `requestId`)
- Validate `429` + `Retry-After` behavior

### B) Hook tests (integration hooks)

For each hook (for example `useWorkspaceDecisions`):
- initial loading state
- success state mapping
- error state mapping
- retry behavior

### C) UI integration tests

- Render workspace with mocked network layer
- Assert loading -> data -> error transitions
- Assert action buttons perform optimistic updates and rollback on failure

### D) WebSocket tests

- connect success
- reconnect after disconnect
- duplicate event handling
- out-of-order event handling by `version`/`updatedAt`

---

## 4) Debugging tips

### Network debugging

- Browser devtools -> Network:
  - Confirm request URL, headers, payload, response
  - Track correlation via `meta.requestId` and `X-Request-Id`

### WebSocket debugging

- Verify `connection.ready` message arrives.
- Check heartbeat/ping intervals.
- Simulate disconnect and confirm reconnect backoff.

### State debugging

- Inspect Zustand state transitions around data hydration.
- Log before/after snapshots for mutation operations.
- Ensure store updates are immutable and idempotent.

### Common integration pitfalls

- Token expired but still cached by client
- Different field names between API DTO and UI model
- Duplicate event application from reconnect replay
- Race conditions between initial fetch and live updates

---

## 5) Performance considerations

When moving from mock to live data, performance issues often become visible.

### Keep renders predictable

- Select only required store slices in components.
- Avoid passing large objects through many component layers.
- Memoize expensive derived calculations.

### Control request volume

- Prefer WebSocket for live updates over short-interval polling.
- Debounce high-frequency user actions.
- Batch refreshes by workspace.

### Handle burst traffic safely

- Queue or coalesce rapid event updates before writing to store.
- Apply updates by version to skip stale events.
- Consider virtualized lists for large decision streams.

### Measure, do not guess

- Use React Profiler for re-render hotspots.
- Track API latency percentiles (p50/p95).
- Track WebSocket reconnect frequency and dropped-event counts.

---

## 6) Recommended day-to-day workflow

1. Build UI behavior in `mock` mode.
2. Add/update API contract fixtures.
3. Switch to `real` mode and validate flows.
4. Test unhappy paths (401/403/409/429/5xx).
5. Validate WebSocket reconnection and deduplication.
6. Merge only after both mock and real flows are stable.

