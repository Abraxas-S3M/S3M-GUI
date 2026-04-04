# S3M-Core Backend Requirements for S3M-GUI

## API Requirements

- Base URL exposed to GUI through `VITE_S3M_API_BASE_URL`.
- JSON REST endpoints:
  - `GET /mission/snapshot`
  - `GET /decisions`
  - `PATCH /decisions/:id` with `{ "status": "approved" | "rejected" }`
- Non-2xx responses should include:
  - `code` (string)
  - `message` (string)
  - `details` (object, optional)

## WebSocket Requirements

- URL exposed through `VITE_S3M_WS_BASE_URL`.
- Message envelope:

```json
{
  "type": "string",
  "payload": {}
}
```

- Recommended event types:
  - `decision.updated`
  - `mission.snapshot.updated`
  - `alert.created`

## Operational Requirements

- CORS must allow S3M-GUI origin(s).
- TLS required in production (`https`/`wss`).
- API latency budget should support GUI timeout defaults (8-10s).
- Request IDs in response headers are strongly recommended for traceability.

## Development / Mocking

- S3M-GUI supports a mock backend mode (`VITE_S3M_ENABLE_MOCK_BACKEND=true`) for disconnected frontend development.
- Mock mode should mirror payload shapes used by the live backend to avoid integration drift.
