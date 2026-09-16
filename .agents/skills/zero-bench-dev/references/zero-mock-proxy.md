# 🗄️ Zero Mock Overhead & Reverse Proxy Architecture

Per the workspace Autonomous Development Protocol, hardcoding static mock arrays inside `src/` runtime application files is **strictly forbidden**.

---

## 🏛️ 1. Architecture Overview

```
Frontend (Angular Client)
       │
       ▼  HTTP GET /api/consultants
Angular CLI Proxy (proxy.conf.json)
       │
       ▼  Proxy Target: http://localhost:3001
External Mock Express Server (mock-server/server.mjs)
       │
       ▼  Reads file
Seed JSON Datastore (mock-server/data/consultants.json)
```

---

## 📐 2. Mock Datastore Conventions

1. **Location:** Seed JSON files reside exclusively in `mock-server/data/<domain>.json`:
   - `consultants.json`
   - `risk-overview.json`
   - `clients.json`
   - `placements.json`
2. **Server Implementation (`mock-server/server.mjs`):**
   - Express server running on port `3001`.
   - Supports query filtering (e.g. `?status=on_bench`, `?search=react`).
   - Supports latency simulation for realistic loading states.
3. **Execution Scripts (`package.json`):**
   ```json
   "scripts": {
     "mock:server": "node mock-server/server.mjs",
     "start": "concurrently -k -p \"[{name}]\" -n \"MOCK,NG\" -c \"cyan,magenta\" \"npm run mock:server\" \"ng serve\""
   }
   ```

---

## 🌐 3. Dual-Mode SSR & Proxy Configuration

To ensure both client-side browser requests and server-side prerendering / SSR requests work seamlessly:

1. **`proxy.conf.json`:**
   ```json
   {
     "/api": {
       "target": "http://localhost:3001",
       "secure": false,
       "changeOrigin": true,
       "logLevel": "info"
     }
   }
   ```
2. **SSR-Safe `API_BASE_URL` Token (`src/app/core/tokens/api.token.ts`):**
   - **In the Browser:** Injects `''` (relative URL). The Angular dev server proxy forwards `/api/*` to `http://localhost:3001`.
   - **In Node SSR / Prerender:** Injects `http://127.0.0.1:3001`. Directly reaches the local mock server over loopback without browser proxy infrastructure.

---

## 🚀 4. Seamless Production Migration

When switching from the mock server to the live production backend:
1. Update `proxy.conf.json` target to `http://79.137.14.75:3000`.
2. Configure Nginx upstream on the production host to proxy `/api/` to the backend Docker container.
3. **ZERO lines of code in `src/` need to change.**
