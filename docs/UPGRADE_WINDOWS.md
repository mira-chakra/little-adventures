# Upgrade your existing Little Adventures project on Windows

This is a complete updated source package, with 37 photographed places (your original 10 + 27 new ones). The photographs are included in client/public/photos, not generated illustrations. Attribution and source links accompany every photograph.

## 1. Keep your working version

Stop the old terminal with Ctrl+C. Keep your original Little_Adventures_Complete folder as a backup.
Extract this ZIP into a separate folder. Open Little_Adventures_Expanded in VS Code.

## 2. Reuse your existing database configuration

Copy server/.env from your OLD folder into server/ in the NEW folder. Do not copy node_modules.
Keep the same MONGODB_URI and JWT_SECRET. Your existing account and favorites are in MongoDB and will remain there. Do not share the .env file.
No new admin or Atlas cluster is required. SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD can remain blank because you have already created your admin.

## 3. Install (terminal in the new project's top folder)

Your Node.js 24 installation is suitable.

```powershell
npm.cmd install
npm.cmd run install:all
```

The tested dependency versions are recorded in package-lock.json files. React and Express are already part of the project; do not run create-vite again.

## 4. Preview the catalogue upgrade

```powershell
npm.cmd run catalog:preview --prefix server
```

This reads your existing records and prints what would be added or enriched. It does not write to MongoDB.

## 5. Apply the catalogue upgrade

```powershell
npm.cmd run catalog:apply --prefix server
```

For an untouched initial database, this adds 27 places and enriches the original 10 with photos and extra fields. Existing IDs, accounts, favorites, prices, descriptions and custom photographs are preserved. If you have renamed an original record, it may be treated as a new place; review the preview before applying. Repeating the command does not duplicate records with the same title. It does not delete anything.

The packaged planning budgets are illustrative estimates, not verified admission fees. Review and edit these in Admin. Coordinates identify place areas, not guaranteed entrances or trailheads. Photographs may be historic and do not establish present-day access or conditions.

## 6. Start

```powershell
npm.cmd run dev
```

Open http://localhost:5173 and leave the terminal running. If Vite selects another port, use the address it prints.

## 7. Check these features

1. Explore: photos, category / region / setting / difficulty filters, budget and activity-time filters, and pagination.
2. Open a place: source links, activities, photograph credits, area directions and seven-day forecast by date.
3. Pick for Me: choose multiple interests, optional location, budget, activity time and forecast preference. Show more adds another page of results.
4. Log in with your EXISTING admin account. Edit an existing place or add a new one.
5. Use Admin's JSON import: preview -> import drafts -> edit/review -> select published -> save. Up to 100 records per import; the catalogue itself is not limited to 100 records.
6. Open the site on a narrow browser window and check the layout.

## 8. Tests and production build

```powershell
npm.cmd test
npm.cmd run build
```

Development uses two servers (5173 + 5000). For the production build, stop development, then run npm.cmd start and open http://localhost:5000.

## Weather

No weather API key is needed for the educational non-commercial Open-Meteo endpoint used here. The backend requests forecasts by place coordinates, caches them for 30 minutes and uses a five-second upstream timeout. The UI shows missing/unavailable forecasts honestly. Dates outside today plus six days cannot use forecast-aware ranking. Your computer needs Internet access to api.open-meteo.com. Review provider terms before commercial deployment.

## Add more real places

Admin -> Add place supports a photo URL, author, licence, source, coordinates and practical details. For bundled photos put your permitted image into client/public/photos/your-name.jpg, then use /photos/your-name.jpg in the form. External photo URLs must use HTTPS.

Bulk import accepts a JSON array with the schema demonstrated in server/data/lebanon-catalog.json. See docs/CATALOGUE.md for field details. Bulk imports are ALWAYS drafts until you review and publish each record. Duplicate title + location rows are skipped. Import never overwrites existing records.

## Known limits

- 37 starter places, not an exhaustive or live directory of Lebanon. No guarantee of current opening or access.
- One main photograph per place; no photo gallery or image-upload hosting service yet.
- Budget and duration describe the activity; they exclude travel and are not live prices.
- Optional location ranks by straight-line distance, not driving time.
- Date affects weather only; it does not verify opening hours or availability.
- No multi-stop itinerary, bookings, live reviews, or paid Places API integration.
- Existing records with missing coordinates show weather unavailable until coordinates are supplied.
- Browser visual/end-to-end checks and a real MongoDB upgrade should be completed on your PC; see docs/QA_STATUS.md.
