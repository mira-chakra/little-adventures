# Interactive map update

## Run this updated version on Windows

1. Stop the old app with Ctrl+C and keep its folder as a backup.
2. Extract this ZIP into a separate folder. Open the folder containing client, server and package.json.
3. Copy your existing server/.env into this version's server folder. Keep your existing MongoDB URI and JWT secret.
4. Open PowerShell in the new project folder. Run each command separately:

```powershell
npm.cmd install
```

```powershell
npm.cmd run install:all
```

If you have not imported the expanded 37-place catalogue yet:

```powershell
npm.cmd run catalog:preview --prefix server
```

Review the preview, then:

```powershell
npm.cmd run catalog:apply --prefix server
```

Start the app:

```powershell
npm.cmd run dev
```

Open http://localhost:5173, go to Explore and select Map.
An existing database does not need a new seed or admin account. For first-time database setup, follow README.md.

## Included

- List / Map switch with the existing search, region, mood, category, cost, duration, setting and difficulty filters.
- All matching result pages are fetched for Map; List keeps its existing pagination.
- Clickable, keyboard-focusable markers with photograph (when available), name, cost and details link.
- Map fits the matching coordinates automatically. Plus/minus controls zoom; dragging pans. Mouse-wheel zoom is disabled so page scrolling stays comfortable.
- Accessible place links below the map. Places with missing coordinates are listed separately.
- Mobile height and tile-load error message.
- Lazy-loaded Leaflet assets, and cleanup for React StrictMode.
- Existing admin forms can add/edit coordinates; published places with coordinates appear on subsequent Explore loads.

Coordinates indicate place areas, not verified entrances or routes. The map does not calculate driving time.

## Quick check on your PC

1. Explore -> Map: check that the imported places appear.
2. Click a marker; check its photo, cost and View details link.
3. Apply a search or region filter: confirm only matching markers remain.
4. Reset filters, then switch to List and check pagination.
5. Add a published adventure as admin with coordinates; reload Explore and find it on Map.
6. Add a place without coordinates; verify it appears under Places without coordinates.
7. Resize your browser to a phone width and check the map and filters.

## Validation in the development environment

11 frontend tests and 25 backend tests passed. Production build passed.
New tests cover coordinate validation, multipage filtered data retrieval, safe popup text, StrictMode cleanup, missing coordinates and List / Map switching.
A real-browser visual check could not run because Chromium was blocked by the execution environment. A live MongoDB connection and live map tile rendering still need checking on your PC.

## Map service

Leaflet 1.9.4 is installed through npm. OpenStreetMap supplies the map tiles with visible attribution. No map API key is configured or required by this implementation. Internet access is needed for the map background. Do not add tile prefetching or offline downloads; public tiles are a best-effort service. Review the tile policy before public deployment or larger-scale use:
https://operations.osmfoundation.org/policies/tiles/

Leaflet reference: https://leafletjs.com/reference-1.9.4.html

## Main code changes

- client/src/components/AdventureMap.jsx: map lifecycle, markers, popups and fallback links.
- client/src/lib/mapResults.js: coordinate checks and retrieval across result pages.
- client/src/pages/Explore.jsx: lazy map loading and List / Map switch.
- client/src/styles.css: map layout and marker styling.
- client/src/Map.test.jsx: map regression tests.
- client/package.json and package-lock.json: Leaflet dependency.
- server/src/app.js: referrer policy compatible with map tile requests.
