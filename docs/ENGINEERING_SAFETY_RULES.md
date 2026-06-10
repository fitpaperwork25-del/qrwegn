# Engineering Safety Rules — QR-Wegn

Goal: prevent future breakage of already-working flows.

## Rules

1. Never modify root `package.json` or `package-lock.json` unless explicitly approved.
2. Never run `npm install` in root unless explicitly approved.
3. `local-bridge` dependencies must stay inside `local-bridge` only.
4. Before every commit, show `git status`.
5. Commit only explicitly named files.
6. After every feature, run `npm run build`.
7. After every deploy, smoke test:
   - `/login`
   - `/dashboard`
   - `/admin`
   - `/staff-login`
   - `/staff`
   - `/staff/floor`
   - `/cashier`
8. New feature queries must not block app boot.
9. Loading screens need an error fallback/timeout.
10. Inspect first, edit second.
11. Do not rebuild working systems.
12. If dependency drift occurs, revert root `package.json`/`package-lock.json` immediately.

## Claude working rules

- Do not edit files outside requested scope.
- Do not commit unrelated modified/untracked files.
- Do not touch auth, financials, staff routing, or payments unless the task explicitly requires it.
