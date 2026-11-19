# Expanded version validation

Performed in the build environment:
- 25 backend tests: security guards, guest/normal-user import rejection, import preview/no writes, duplicates, pagination beyond 100 records, safe partial updates, multiple interests, hard constraints, distance handling, weather batching/failure, and non-destructive merge behavior.
- 7 React tests: original homepage/cards; image credits/fallback; pagination and filters; weather failure; show-more preserving submitted preferences.
- Production frontend build.
- Both dependency audits: zero reported vulnerabilities at preparation time. This is a point-in-time audit, not a guarantee of future vulnerability status.
- All 37 catalogue records validated against the server schema; all 37 bundled photos decoded and inspected in a contact sheet.

Limits of these checks:
- API tests isolate model calls and weather transport where needed. They are not real Atlas integration tests.
- No access to the user's MongoDB, private .env or running Windows installation was used.
- Chromium launch was blocked by the execution environment's socket restrictions, so browser screenshot/end-to-end UI checks could not be completed here. React behavior was tested in jsdom; visually check desktop/mobile layouts on your PC.
- The live weather probe was unavailable in this environment; the fallback worked. Tests cover successful provider responses with mocked data and failure behavior. Verify live connectivity on your PC.

Before submission: run the upgrade preview, apply it, inspect Explore, login, add/edit a draft, publish it, test favorites, check weather, then run tests and build locally. Verify deployment separately.
