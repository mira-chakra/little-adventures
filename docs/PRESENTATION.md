# Live 5–8 minute capstone presentation + Q&A

## Suggested 7-minute script / run of show

| Time | Demo segment | What to say |
|---|---|---|
| 0:00–0:40 | Problem | “Students in Lebanon spend too long searching for outings within their money, mood and time constraints.” |
| 0:40–1:10 | Solution / stack | “We built Little Adventures with React, Express/Node.js and MongoDB.” |
| 1:10–2:05 | Explore | Show seed adventures and search filters; explain records come from DB rather than being embedded in React. |
| 2:05–2:55 | Pick for Me | Select budget, time, mood; explain the server applies rules, ranks results and returns JSON. |
| 2:55–3:45 | Signup and favorites | Register/log in with **demo account**, save an item, mark visited, refresh to prove persistence. |
| 3:45–5:00 | Admin dashboard | Log in as **demo admin**; add/edit an outing, then show it on Explore. This answers professor feedback. |
| 5:00–6:00 | Architecture and security | Show React → Express API → MongoDB; bcrypt, cookies, authorization, validation, rate limits, Helmet. |
| 6:00–6:40 | Tests and technical challenge | Run/show automated tests; discuss secure cookies and admin authorization as challenge. |
| 6:40–7:00 | Future improvements | Weather/map API, pagination or user reviews (not implemented). |

## What to demonstrate live

1. Public site + API health endpoint from browser.
2. User signs up, saves a favorite, reloads, logs out.
3. Regular user cannot access Admin and unauthorized API returns 401/403.
4. Admin logs in and adds an adventure (no hard-coded list); Explore updates.
5. Pick for Me returns results from that same database, following criteria.
6. The GitHub repo, running tests, and README.

Use **fictional demo accounts**. Do not type real secrets on a projected screen.

## Likely questions and simple answers

**Why did you add an admin role?** The doctor said a fixed list of 8–10 places was too thin. Admin CRUD lets the database grow without changing frontend code.

**What is the difference between frontend and backend?** Frontend is the React interface. Backend validates requests, checks permissions and talks to MongoDB.

**What is CRUD?** Create, read, update and delete records. Admin CRUD manages adventures; users can manage saved favorites.

**Why use MongoDB?** We store each adventure and user as a document. Mongoose defines fields and handles persistent queries.

**What is a REST API?** Express endpoints use HTTP methods GET/POST/PATCH/DELETE and exchange JSON.

**What is authentication?** Proving who a user is (login). **Authorization** is checking what they are allowed to do (admin role).

**Why hash passwords?** If the database is exposed, plaintext passwords would be directly readable. bcrypt hashes are one-way and salted.

**What is a JWT?** Signed session token. The server verifies its signature and loads the current user before protected requests.

**Why HttpOnly cookies?** Browser JavaScript cannot directly read them, reducing token exposure to XSS. SameSite=Lax helps against cross-site requests.

**What stops a user from sending `role:admin` during registration?** Zod `.strict()` rejects unknown properties and the server always assigns `role:'user'`.

**What stops user A from deleting user B's favorite?** All favorites queries include the authenticated `req.user._id`; the browser doesn't choose ownership.

**How does Pick for Me work?** Filter by selected mood, max estimated cost and time, optional region, then score and rank based on price/time headroom. It is deterministic logic beyond CRUD, not AI.

**Did you use a weather/map API?** No. The professor suggested **either** more dynamic admin CRUD **or** a third-party API, and we selected admin CRUD while retaining the custom recommendation feature.

**What was technically difficult?** Keeping the UI, API, cookie sessions and role checks coherent, plus sharing React and API under one origin for deployment.

**What would you improve?** Map/weather API, database pagination for many adventures, or optional user reviews.

## Before presenting

- Test your exact public demo on the computer and internet connection you will use.
- Keep an already logged-in demo user and demo admin ready in separate private profiles, if permitted.
- Do not expose any `.env` values or paste secrets into slides.
- Prepare screenshots or a short screen recording as backup *only if the professor permits*; still have the real site available.
