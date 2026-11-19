# New: community suggestions and personal history

Start with [docs/COMMUNITY_UPDATE.md](docs/COMMUNITY_UPDATE.md) for setup and a demo checklist.

# New: interactive Explore map

See [docs/MAP_UPDATE.md](docs/MAP_UPDATE.md) for setup, changes and checks.

# Little Adventures — expanded Lebanon catalogue

React + Vite frontend, Express + MongoDB backend. Updated for Mira Chakra and Fatima Hamze's capstone.

**Existing installation? Start with [docs/UPGRADE_WINDOWS.md](docs/UPGRADE_WINDOWS.md).** Keep your old folder and copy its private server/.env into this new folder. Do not recreate your Atlas database or admin account.

## Included

- 37 source-linked places, with 37 reusable photographs bundled locally and visible credits.
- Paged catalogue; category, region, mood, setting, difficulty, cost and duration filters.
- Detailed place pages, information source links and area directions.
- Open-Meteo seven-day forecasts, server-side caching and graceful unavailable states.
- Multi-interest recommendations, optional location distance, forecast-aware ranking and show-more results.
- Admin editor, draft/published states, previewable JSON bulk import.
- Non-destructive catalogue enrichment command that preserves existing IDs and edits.
- Existing authentication, favorites, protected routes and production Express hosting.

## Run on Windows (Node.js 24+)

```powershell
npm.cmd install
npm.cmd run install:all
```

Configure server/.env using server/.env.example, or copy your existing private configuration.
For a brand-new database only: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, run `npm.cmd run seed --prefix server`, then clear those two values.

```powershell
npm.cmd run catalog:preview --prefix server
npm.cmd run catalog:apply --prefix server
npm.cmd run dev
```

Open http://localhost:5173. API health: http://localhost:5000/api/health.

```powershell
npm.cmd test
npm.cmd run build
```

## Architecture

- client/src/pages/Explore.jsx: filters and database pagination.
- client/src/pages/PickForMe.jsx: preferences, optional geolocation and more results.
- client/src/pages/Detail.jsx + components/PlaceExtras.jsx: details, sources and forecasts.
- client/src/pages/Admin.jsx: editing, publishing, import preview.
- server/src/models/Adventure.js + utils/validation.js: fields and request validation.
- server/src/routes/adventures.js: catalogue, recommendation, weather and admin routes.
- server/src/utils/recommend.js: transparent ranking (not machine learning).
- server/src/utils/weather.js: fixed Open-Meteo upstream, bounded cache, timeout.
- server/src/catalog.js: explicit preview/apply migration for this catalogue.
- server/data/lebanon-catalog.json: editable starter data; never hard-coded in React.
- client/public/photos: local images. See docs/PHOTO_CREDITS.md.

## Data reliability and scope

Photos and geographical identity have source links. The educational planning costs and durations are estimates, not verified admission fees. Opening hours are left blank. Coordinates usually indicate a place area rather than a precise entrance. Confirm local access, venue conditions and prices before a real outing. Weather forecasts do not imply safety or opening.

This release includes 37 places; it is not a live exhaustive Lebanon directory. Admins can keep adding records and importing batches. Galleries, multi-stop itineraries, live opening hours, reviews, bookings and automatic discovery from a commercial places API remain future work.

## Sources and terms

- Forecast API: https://open-meteo.com/en/docs (non-commercial public endpoint; check terms before commercial use).
- Photograph licences and authors: docs/PHOTO_CREDITS.md and each place's photo source link.
- Geographical source pages: docs/CATALOGUE.md and each record's sourceUrl.

Older sprint documents describe the ORIGINAL MVP scope. This README and docs/UPGRADE_WINDOWS.md describe the expanded implementation and take precedence for setup. The existing course plan has not been edited.
