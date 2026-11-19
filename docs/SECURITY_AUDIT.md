# Security & Best Practices (Course Session 21)

This project follows the vocabulary from the supplied Chapter 21: **XSS, injection, CSRF, validation/sanitization/escaping, HTTPS, Helmet headers, secrets, rate limiting, IDOR, mass assignment and authentication/authorization**.

## Security mechanisms implemented

| Course problem | This project's defense | File |
|---|---|---|
| Plaintext passwords | bcrypt hashes, compare during login | `routes/auth.js` |
| Mass assignment (`role:'admin'`) | Zod `.strict()` rejects unknown signup fields; role hardcoded as `user` | `utils/validation.js`, `routes/auth.js` |
| Unauthorized access | JWT HttpOnly session cookie, requireAuth and requireAdmin | `middleware/auth.js` |
| IDOR / other people's favorites | Every query is scoped to `req.user._id` from the verified JWT | `routes/favorites.js` |
| NoSQL injection | Zod typed strings/numbers, strict schemas, escaped search regex | `validation.js`, `routes/adventures.js` |
| XSS | React renders database text as text, not raw HTML; no `dangerouslySetInnerHTML` | `client/src` |
| CSRF (cookie-authenticated API) | SameSite=Lax cookies, JSON-only mutations, custom `X-Requested-With` header, no CORS middleware | `app.js`, `middleware/auth.js` |
| Header protection | Helmet defaults + explicit Content-Security-Policy | `app.js` |
| Brute force | Auth login/register limiter: 10 attempts per 15 minutes/IP; global API limiter: 300 requests per 15 minutes/IP | `app.js` |
| Secrets | `.env` ignored, `.env.example` contains placeholders, prod startup requires a long JWT secret | `.gitignore`, `server.js` |
| HTTPS | Host provides HTTPS; cookie `secure` automatically enabled in production | `middleware/auth.js`, hosting |
| Bad status codes | 400 invalid, 401 unauthenticated, 403 forbidden, 404 missing, 409 duplicate, 429 rate-limit | API routes |

## Three attack checks to reproduce for Chapter 21 lab

**These checks document intended defenses; collect actual request/response screenshots in your own running environment for the professor.**

### 1. Mass assignment

Attempt signup with `role: "admin"` added to the JSON body. Include the custom header. **Expected**: HTTP 400 because the registration schema is strict. Remove the extra field: ordinary signup succeeds with `role: user`.

### 2. CSRF-like request

Try POST `/api/auth/login` with JSON but without header `X-Requested-With: LittleAdventures`. **Expected**: HTTP 403. With header and valid data, the login endpoint proceeds normally. This is one layer in combination with SameSite=Lax and no cross-origin CORS.

### 3. Unauthenticated admin edit / IDOR

Try POST `/api/adventures` without a session cookie. **Expected**: HTTP 401. Log in as a normal user, repeat: **expected** HTTP 403. The same call as a genuine admin with valid input creates a record. For favorites, GET `/api/favorites` only returns the authenticated account's saved records.

### Optional additional lab checks

- Submit `q=...` containing regex characters to GET `/api/adventures`; all characters are treated literally by the escaped search expression.
- Submit a `moods` object instead of a string array to POST `/api/adventures` as admin: expected HTTP 400.
- Send 11 login requests from the same test IP within 15 minutes: expect at least one HTTP 429 (note other attempts also count toward the limit).
- Check `/api/health` headers to see Helmet headers including CSP, `X-Content-Type-Options` and `Strict-Transport-Security`.
- Check that Git does not track `server/.env` with `git status` / `git check-ignore server/.env`.

## Security limitations / honest notes

- A custom header plus SameSite=Lax is appropriate for this same-origin class project; large production systems may additionally use dedicated CSRF tokens, session revocation and risk-based login protection.
- JWTs remain valid until expiry if stolen; they aren't stored server-side, so individual token revocation isn't implemented. Cookie is HttpOnly and Secure in production.
- Rate limiting uses the in-process default store and resets on deployment; a distributed limiter would be necessary across many server replicas.
- HTTPS requires correct host configuration. Do not turn off `secure` cookies in public production.
- Initial admin account must be created through the seed procedure, not browser signup. Seed credentials must be removed from deployment secrets after use.
- This is a capstone with meaningful safeguards, **not** a professionally audited production service.
