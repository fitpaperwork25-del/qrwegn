# QR-Wegn Local Bridge

Local print bridge for the QR-Wegn dashboard.
Runs on the POS machine. Accepts print jobs from the owner dashboard over localhost.

## Requirements

- Node.js 18+
- Windows, macOS, or Linux

## Setup

```bash
cd local-bridge
npm install
npm start
```

The bridge starts on `http://127.0.0.1:8787` by default.

To use a different port:

```bash
PORT=9000 npm start
```

## Health check

```
GET http://127.0.0.1:8787/health
→ { "ok": true, "version": "0.1.0" }
```

Paste this URL into Dashboard → Hardware → Local Bridge → Bridge URL, then click **Check Bridge**.

## Endpoints

| Method | Path | Status |
|--------|------|--------|
| GET | `/health` | Live |
| POST | `/print/test` | Stub |
| POST | `/print/receipt` | Stub |
| POST | `/print/open-drawer` | Planned |

## Security

- Binds to `127.0.0.1` only — not reachable from the network.
- CORS is restricted to allowed QR-Wegn origins.
- Do not port-forward or expose this service publicly.
