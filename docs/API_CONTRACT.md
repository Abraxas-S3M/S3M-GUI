# API Contract (Frontend <-> S3M-Core)

This document defines the expected API behavior for frontend integration.

It is intentionally strict on response and error formats so UI code can be predictable.

---

## 1) Base conventions

- Transport: HTTPS (REST) + WSS (realtime)
- Content type: `application/json; charset=utf-8`
- Timestamps: ISO-8601 UTC (`2026-04-04T12:34:56.000Z`)
- IDs: strings (stable, unique per entity)
- Pagination: cursor-based where applicable

---

## 2) Expected API response formats

### 2.1 Success envelope

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01JABC...",
    "timestamp": "2026-04-04T12:34:56.000Z"
  }
}
```

Notes:
- `data` can be an object or array.
- `meta.requestId` is required for tracing support tickets/logs.

### 2.2 List/paginated response

```json
{
  "data": [
    {
      "id": "R001",
      "workspaceId": "decisions",
      "title": "ENGAGE UAV-02",
      "description": "Weapons release Track 218",
      "risk": 82,
      "confidence": 74,
      "severity": "CRITICAL",
      "status": "pending",
      "updatedAt": "2026-04-04T12:34:56.000Z"
    }
  ],
  "meta": {
    "requestId": "req_01JABC...",
    "nextCursor": "cur_01JABD...",
    "hasMore": true
  }
}
```

### 2.3 Mutation response (approve/reject)

```json
{
  "data": {
    "id": "R001",
    "status": "approved",
    "updatedAt": "2026-04-04T12:35:10.000Z",
    "version": 8
  },
  "meta": {
    "requestId": "req_01JABE..."
  }
}
```

---

## 3) Error handling expectations

### 3.1 Standard error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "workspaceId is required",
    "details": {
      "field": "workspaceId"
    },
    "retryable": false
  },
  "meta": {
    "requestId": "req_01JABF...",
    "timestamp": "2026-04-04T12:35:12.000Z"
  }
}
```

### 3.2 Expected status code behavior

- `400` Bad Request: malformed request
- `401` Unauthorized: token missing/invalid
- `403` Forbidden: user authenticated but lacks permission
- `404` Not Found: entity/workspace does not exist
- `409` Conflict: version mismatch / optimistic lock failure
- `422` Unprocessable Entity: semantic validation failed
- `429` Too Many Requests: caller exceeded rate limits
- `5xx` Server errors: retry with backoff for idempotent requests

### 3.3 Frontend handling rules

- Always surface `error.message` to logs (not always to end users).
- Use `error.code` for deterministic UI flows.
- On `retryable: true`, show retry CTA with backoff.
- On `401`, trigger auth refresh/login flow.
- On `409`, fetch latest entity and show conflict resolution UI.

---

## 4) WebSocket message types

WebSocket should send typed envelopes:

```json
{
  "type": "decision.updated",
  "workspaceId": "decisions",
  "eventId": "evt_01JABG...",
  "timestamp": "2026-04-04T12:36:00.000Z",
  "payload": {}
}
```

### Required message types

#### `connection.ready`

```json
{
  "type": "connection.ready",
  "payload": {
    "sessionId": "ws_123",
    "heartbeatIntervalMs": 30000
  }
}
```

#### `decision.created`
Payload: full decision record.

#### `decision.updated`
Payload: partial or full decision; must include `id`, `version`, `updatedAt`.

#### `decision.deleted`

```json
{
  "type": "decision.deleted",
  "payload": {
    "id": "R001"
  }
}
```

#### `workspace.alert`
Payload: alert/event card data for workspace timelines/panels.

#### `error`

```json
{
  "type": "error",
  "payload": {
    "code": "WS_AUTH_EXPIRED",
    "message": "Token expired",
    "retryable": true
  }
}
```

### Ordering and idempotency expectations

- `eventId` must be unique.
- Messages may arrive out of order; frontend should apply by `version`/`updatedAt`.
- Duplicate messages are possible; updates must be idempotent.

---

## 5) Authentication header format

Use bearer token auth:

```http
Authorization: Bearer <access-token>
```

Recommended companion headers:

```http
X-Client-Version: s3m-web/1.0.0
X-Request-Id: <uuid-or-ulid>
```

WebSocket auth options (backend chooses one):
- Query string token: `wss://.../ws?token=<access-token>`
- Subprotocol token
- Initial auth message after connect

The chosen approach must be documented and stable across environments.

---

## 6) Rate limiting expectations

Backend should return standard headers:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1712234400
Retry-After: 30
```

Frontend expectations:
- On `429`, do not immediate-retry in tight loops.
- Respect `Retry-After` when present.
- Apply exponential backoff with jitter for retries.
- Disable/reduce background polling when socket is healthy.

---

## 7) Contract stability policy

- Additive changes (new fields) are backward-compatible.
- Breaking changes require versioning (`/api/v2`) or feature flags.
- Deprecations should include migration window and release notes.

