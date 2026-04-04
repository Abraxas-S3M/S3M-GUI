# S3M-GUI Backend Integration Checklist

This checklist turns the integration goals into an executable backend contract for S3M-Core and a validation matrix for S3M-GUI.

## Status

- Frontend foundation: complete (API client, hooks, store integration, mock backend, tests, docs, CI/CD)
- Backend APIs and runtime integration: pending
- End-to-end integration testing: pending
- Deployment hardening: pending

---

## 1) Backend (S3M-Core) Delivery Checklist

### 1.1 Command Overview

- [ ] **GET `/api/command/overview`**
  - Returns operational summary used by `CommandOverview` workspace
  - Response includes at minimum:
    - `readinessScore: number`
    - `activeMissions: number`
    - `assetAvailability: number`
    - `openRisks: number`
    - `pendingDecisions: number`
    - `lastUpdated: string (ISO-8601)`
  - Non-200 behavior:
    - `401` unauthenticated
    - `403` authenticated but unauthorized
    - `5xx` system failures with correlation ID

### 1.2 Decision Management (CRUD + Workflow)

- [ ] **GET `/api/decisions`** (list/filter)
- [ ] **GET `/api/decisions/:id`** (single)
- [ ] **POST `/api/decisions`** (create)
- [ ] **PATCH `/api/decisions/:id`** (update fields/state)
- [ ] **DELETE `/api/decisions/:id`** (soft delete preferred)
- [ ] **POST `/api/decisions/:id/approve`** (approval workflow)

Required decision shape:

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|critical",
  "status": "draft|pending|approved|rejected|archived",
  "owner": "string",
  "createdAt": "2026-04-04T12:00:00Z",
  "updatedAt": "2026-04-04T12:00:00Z"
}
```

### 1.3 Risk Scoring

- [ ] **POST `/api/risk/score`**
  - Request includes risk factors and optional context
  - Response returns:
    - `score: number` (0-100)
    - `band: low|guarded|elevated|severe`
    - `drivers: string[]`
    - `recommendations: string[]`
    - `computedAt: ISO-8601`

### 1.4 COP (Common Operational Picture) Aggregation

- [ ] **GET `/api/cop/aggregate`**
  - Aggregates tracks, incidents, readiness, and threat posture
  - Supports optional query parameters:
    - `region`
    - `window` (e.g. `1h|6h|24h`)
    - `classification` (if applicable)

### 1.5 WebSocket Gateway

- [ ] **WS `/ws`**
  - Authenticated connection handshake
  - Heartbeat/ping support
  - Event envelope:

```json
{
  "type": "decision.updated",
  "timestamp": "2026-04-04T12:00:00Z",
  "correlationId": "string",
  "payload": {}
}
```

Required events:
- [ ] `decision.created`
- [ ] `decision.updated`
- [ ] `risk.scored`
- [ ] `cop.updated`
- [ ] `timeline.event.created`

### 1.6 ISR Asset Management

- [ ] Asset CRUD for ISR entities (platform/sensor/feed metadata)
- [ ] Secure media/reference handling (signed URLs if object storage is used)
- [ ] Validation for source, geospatial metadata, and timestamps

### 1.7 Message Relay

- [ ] Ingest path for external feeds (queue/topic/webhook)
- [ ] Normalization into internal event schema
- [ ] Delivery guarantees documented (at-least-once or exactly-once)
- [ ] Dead-letter handling for malformed events

### 1.8 Timeline Events

- [ ] **GET `/api/timeline/events`** (queryable by window/entity/severity)
- [ ] **POST `/api/timeline/events`** (system/manual event create)
- [ ] Timeline events emitted to WS in near real-time

### 1.9 Authentication + RBAC

- [ ] JWT/OIDC bearer auth on REST and WS
- [ ] Role checks at endpoint and event-channel level
- [ ] Baseline roles:
  - [ ] `viewer`
  - [ ] `analyst`
  - [ ] `commander`
  - [ ] `admin`

### 1.10 Audit Logging

- [ ] Immutable audit record for state-changing operations
- [ ] Include actor, action, resource, before/after (when safe), and timestamp
- [ ] Query endpoint for audit retrieval with RBAC restrictions

---

## 2) Integration Testing Checklist

### 2.1 Frontend -> Backend (Mock)

- [ ] Contract tests pass against mocked endpoints for:
  - [ ] command overview
  - [ ] decisions
  - [ ] risk score
  - [ ] COP aggregate

### 2.2 Frontend -> Backend (Real)

- [ ] Staging environment runs against real S3M-Core APIs
- [ ] CORS, auth token exchange, and error shapes validated
- [ ] API latency/error budget metrics captured

### 2.3 WebSocket Connectivity

- [ ] WS connect/reconnect behavior validated
- [ ] Event ordering/duplication handling tested
- [ ] Graceful fallback behavior for WS outage

### 2.4 E2E Workflows

- [ ] Decision approval workflow end-to-end
- [ ] Risk scoring end-to-end
- [ ] Track display/COP refresh end-to-end

---

## 3) Deployment Checklist

- [ ] S3M-Core endpoints deployed and reachable from frontend environment
- [ ] Frontend runs in production mode with backend integration enabled
- [ ] Monitoring and alerting configured:
  - [ ] API error rate
  - [ ] WS disconnect/reconnect spikes
  - [ ] p95/p99 latency
  - [ ] queue/relay lag
- [ ] Rollback procedures documented and tested

---

## 4) Exit Criteria (Definition of Done)

- [ ] All backend checklist items completed
- [ ] All integration tests green in CI for mock and real backend
- [ ] No Sev-1/Sev-2 defects open for decision, risk, COP, or timeline features
- [ ] Deployment checklist completed with verified rollback
