# Architecture and code walkthrough

## End-to-end request

```text
Browser (React/Vite, client/src)
       │ fetch('/api/adventures')
       ▼
Express app / middleware (server/src/app.js)
       │ HTTP route + query validation
       ▼
Express router (server/src/routes/adventures.js)
       │ Mongoose model query
       ▼
MongoDB Atlas collection "adventures"
       │ JSON response
       ▼
React `Explore.jsx` renders `AdventureCard.jsx` for each returned object
```

## Who does what?

1. `client/src/main.jsx` mounts React, BrowserRouter and AuthProvider.
2. `client/src/App.jsx` maps front-end URLs to screens. Its protected-page wrapper hides pages from guests or non-admins. This is **UX only**; backend authorization protects the actual data.
3. `client/src/lib/api.js` handles JSON fetch calls, cookie sessions, errors and the custom security header.
4. `client/src/lib/AuthContext.jsx` loads `/auth/me` on refresh and provides login/register/logout to components.
5. `server/src/server.js` reads env, connects to Atlas, then starts Express. `app.js` installs validation/security middleware and mounts route modules.
6. `server/src/middleware/auth.js` verifies the signed JWT from the cookie, queries the user and checks the live database role.
7. `server/src/models` define document fields and relationships.
8. `server/src/utils/recommend.js` computes results independently of the database and is easy to unit-test.

## Pick for Me, concretely

Client sends `{mood:'nature',budget:20,availableMinutes:240,region:''}`. API fetches possible adventures. The engine keeps items whose tags include `nature` and whose estimated cost/duration fit the limits. If a region is specified, it also requires an exact region match. Then it awards **60 base points for meeting the exact mood and constraints**, plus up to **20 points for price headroom** and **20 points for shorter duration**, and sorts descending. Up to six matches are sent back. If no records qualify, the UI says so clearly rather than showing irrelevant suggestions.

This is **a transparent rule-based recommendation system**, not AI. It fulfills the special-feature alternative to a third-party API.

## Authentication and role authorization

- Signup: Zod validates input, server always assigns `role:'user'`, bcrypt hashes the password, sets HttpOnly cookie.
- Login: bcrypt compares the input password with stored hash; server signs JWT with secret kept in env.
- Each protected request: cookie → JWT signature check → look up current user → optional admin role check.
- Logout: clears the cookie. No token is stored in localStorage.
- Favorites: queries always include `user:req.user._id`, so one account cannot read or edit another's favorites.
- Admin edits: require a database-backed `role:'admin'` verified server-side before changes are made.

## Security decisions

See `docs/SECURITY_AUDIT.md`. Browser content renders as React text (escaping user text by default), MongoDB query fields are validated strings/numbers, requests are rate-limited, and Helmet sets response security headers. State-changing requests require a custom header + JSON and cookies are SameSite=Lax to reduce CSRF risk. No arbitrary HTML injection or permissive CORS middleware is enabled.

## Scaling notes / tradeoffs

- A single Node web service handles the API and serves the built React SPA, simplifying cookies/deployment.
- MongoDB Atlas persists data; 10 examples are only initial seed data, not fixed UI code.
- Recommendation and list endpoints have limits (up to 500 candidates, 100 on browse) appropriate for a small capstone. For a production large dataset, add indexes, pagination and server-side ranked filtering.
- No image uploads or payment workflows in this capstone. Optional external HTTPS image links are allowed for admin records.
