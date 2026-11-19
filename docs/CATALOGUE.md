# Starter catalogue and import schema

37 places with real photographs. Existing 10 titles remain unchanged so the explicit catalogue upgrade can enrich them without replacing IDs. 27 additional entries are added. The catalogue is deliberately expandable, not an exhaustive list.

Place descriptions, estimated budgets and durations are editorial planning examples. Geographical identity and photographs have linked references. Opening hours and current entry prices were not verified. `checkedOn` stays blank. Some coordinates identify a town/site area, not its entrance. Four coordinate fallbacks were retrieved from Wikidata: Tannourine Q4119057; National Museum Q2915627; Sidon Sea Castle Q2918974; Jezzine Q25910.

## Places and sources

- **Golden Hour at Raouche** — Beirut, waterfront. Reference: https://en.wikipedia.org/wiki/Raouch%C3%A9

- **Old Streets of Byblos** — Keserwan-Jbeil, heritage. Reference: https://en.wikipedia.org/wiki/Byblos

- **Batroun Seaside Wander** — North Lebanon, waterfront. Reference: https://en.wikipedia.org/wiki/Batroun

- **Cedar Trails in Tannourine** — North Lebanon, reserve. Reference: https://en.wikipedia.org/wiki/Tannourine

- **Deir el Qamar Village Walk** — Mount Lebanon, village. Reference: https://en.wikipedia.org/wiki/Deir_al-Qamar

- **Tyre Coastal Escape** — South Lebanon, waterfront. Reference: https://en.wikipedia.org/wiki/Tyre,_Lebanon

- **Qadisha Valley Viewpoints** — North Lebanon, viewpoint. Reference: https://en.wikipedia.org/wiki/Kadisha_Valley

- **Baalbek Heritage Day** — Baalbek-Hermel, heritage. Reference: https://en.wikipedia.org/wiki/Baalbek

- **Jeita Nature & Caves** — Keserwan-Jbeil, heritage. Reference: https://en.wikipedia.org/wiki/Jeita_Grotto

- **Anjar History Walk** — Bekaa, heritage. Reference: https://en.wikipedia.org/wiki/Anjar,_Lebanon

- **Beiteddine Palace Visit** — Mount Lebanon, heritage. Reference: https://en.wikipedia.org/wiki/Beiteddine_Palace

- **National Museum of Beirut** — Beirut, museum. Reference: https://en.wikipedia.org/wiki/National_Museum_of_Beirut

- **Sursock Museum Visit** — Beirut, museum. Reference: https://en.wikipedia.org/wiki/Sursock_Museum

- **MIM Mineral Museum** — Beirut, museum. Reference: https://en.wikipedia.org/wiki/MIM_Museum

- **Beirut Souks Walk** — Beirut, other. Reference: https://en.wikipedia.org/wiki/Beirut_Souks

- **Horsh Beirut Park Break** — Beirut, park. Reference: https://en.wikipedia.org/wiki/Horsh_Beirut

- **Harissa Viewpoint & Sanctuary** — Keserwan-Jbeil, religious. Reference: https://en.wikipedia.org/wiki/Our_Lady_of_Lebanon

- **Faqra Heritage Stop** — Keserwan-Jbeil, heritage. Reference: https://en.wikipedia.org/wiki/Faqra

- **Afqa Landscape Visit** — Keserwan-Jbeil, viewpoint. Reference: https://en.wikipedia.org/wiki/Afqa

- **Baatara Gorge Viewpoint** — North Lebanon, waterfall. Reference: https://en.wikipedia.org/wiki/Baatara_gorge_waterfall

- **Cedars of God Walk** — North Lebanon, reserve. Reference: https://en.wikipedia.org/wiki/Cedars_of_God

- **Gibran Museum Visit** — North Lebanon, museum. Reference: https://en.wikipedia.org/wiki/Gibran_Museum

- **Bcharre Village Discovery** — North Lebanon, village. Reference: https://en.wikipedia.org/wiki/Bsharri

- **Ehden Village Walk** — North Lebanon, village. Reference: https://en.wikipedia.org/wiki/Ehden

- **Horsh Ehden Nature Outing** — North Lebanon, reserve. Reference: https://en.wikipedia.org/wiki/Horsh_Ehden

- **Tripoli Old City Discovery** — North Lebanon, heritage. Reference: https://en.wikipedia.org/wiki/Tripoli,_Lebanon

- **Tripoli Citadel Visit** — North Lebanon, heritage. Reference: https://en.wikipedia.org/wiki/Citadel_of_Tripoli

- **Mseilha Fort Stop** — North Lebanon, heritage. Reference: https://en.wikipedia.org/wiki/Mseilha_Fort

- **Sidon Sea Castle Visit** — South Lebanon, heritage. Reference: https://en.wikipedia.org/wiki/Sidon_Sea_Castle

- **Eshmun Temple Heritage Stop** — South Lebanon, heritage. Reference: https://en.wikipedia.org/wiki/Temple_of_Eshmun

- **Jezzine Town & Views** — South Lebanon, village. Reference: https://en.wikipedia.org/wiki/Jezzine

- **Beaufort Castle Viewpoint** — Nabatieh, heritage. Reference: https://en.wikipedia.org/wiki/Beaufort_Castle,_Lebanon

- **Ksara Winery Visit** — Bekaa, food. Reference: https://en.wikipedia.org/wiki/Ch%C3%A2teau_Ksara

- **Aammiq Wetland Nature Walk** — Bekaa, reserve. Reference: https://en.wikipedia.org/wiki/Aammiq_Wetland

- **Qaraoun Landscape Stop** — Bekaa, viewpoint. Reference: https://en.wikipedia.org/wiki/Qaraoun

- **Niha Archaeological Visit** — Bekaa, heritage. Reference: https://en.wikipedia.org/wiki/Niha,_Zahl%C3%A9

- **Shouf Cedar Nature Outing** — Mount Lebanon, reserve. Reference: https://en.wikipedia.org/wiki/Al_Shouf_Cedar_Nature_Reserve


## JSON import

Use an array of objects following server/data/lebanon-catalog.json. The admin importer accepts up to 100 objects per batch and a 900 KB file in the UI. Required fields: title (3–100 chars), description (20–1100), region (2–75), location (2–90), estimatedCost (0–1000), durationMinutes (30–1440 integer), moods (1–4).

Optional fields: category, district, environment (indoor/outdoor/mixed/unknown), difficulty (easy/moderate/hard/unknown), latitude, longitude, costStatus (estimate/verified/unknown), activities, bestSeason, openingHours, bookingUrl, sourceUrl, checkedOn (YYYY-MM-DD or empty), imageUrl, imageCredit, imageSource, imageLicense, cover, status. A photo URL must be HTTPS or /photos/a-safe-filename.jpg (also png, jpeg, webp).

Choose costStatus=unknown when no planning estimate is available. Such records appear in unfiltered Explore, but are excluded from budget-filtered lists and recommendations. Blank opening hours mean unknown. Use accurate coordinates or leave both blank. Never use 0,0 as a missing-location placeholder.

Imports always create drafts, regardless of status in the file. Preview does not write. Existing title + location duplicates are skipped; existing data is not overwritten. Edit and publish after checking each imported entry. The separate catalogue upgrade script is for this reviewed bundled starter catalogue and inserts its published entries directly after the explicit --apply command.

## Coverage limitations

There is no automatic live discovery, venue-hours verification, or current safety assessment. The initial catalogue does not cover every district. Extend it through admin tools with verified sources and permitted photographs. A paid commercial places integration would require separate credentials, terms and budget decisions.
