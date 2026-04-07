# S3M-GUI Deployment Guide — Cloudflare Pages

## Build Configuration

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18+ |
| Package manager | pnpm (preferred) or npm |

## Environment Variables (set in Cloudflare Pages dashboard)

### Production
| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/api/v1` |
| `VITE_WS_URL` | `wss://api.yourdomain.com/ws` |
| `VITE_USE_MOCK_BACKEND` | `false` |
| `VITE_API_TIMEOUT_MS` | `8000` |

### Preview
| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api-staging.yourdomain.com/api/v1` |
| `VITE_WS_URL` | `wss://api-staging.yourdomain.com/ws` |
| `VITE_USE_MOCK_BACKEND` | `false` |
| `VITE_API_TIMEOUT_MS` | `10000` |

## Expected Subdomains

| Subdomain | Purpose | Host |
|---|---|---|
| `demo.yourdomain.com` | GUI (Cloudflare Pages) | Cloudflare |
| `api.yourdomain.com` | S3M-Core API | Hetzner |

WebSocket connections from `demo.yourdomain.com` connect to `wss://api.yourdomain.com/ws`. Cloudflare proxies WebSocket connections to the Hetzner origin.

## CORS

The Hetzner backend must include these CORS headers:

```http
Access-Control-Allow-Origin: https://demo.yourdomain.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id, X-Client-Version
Access-Control-Allow-Credentials: false
```

## Rollback

In Cloudflare Pages dashboard, go to Deployments.
Find the last known-good deployment.
Click "Rollback to this deployment".
Verify with smoke tests below.

## Smoke Test Sequence

- GUI loads at https://demo.yourdomain.com
- Route refresh works (e.g., reload on /dashboard)
- Login flow completes
- API snapshot loads (Command Overview shows data)
- WebSocket connects (green status dot in status bar)
- Live update appears (decision or alert changes in real time)
- Backend disconnect state is visible (kill WS, verify red dot + "disconnected")
- Arabic language toggle works
- Backend evolution panel shows data (or graceful "not available" state)
