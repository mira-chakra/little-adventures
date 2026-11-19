# START HERE – Friendly guide for Fatima and Mira

## 1. What are we building?

**Little Adventures** helps people in Lebanon find outings. Users can browse places, tell the app their budget/mood/free time to get matching suggestions, and save favorite outings. Administrators can add or edit the database entries so the list grows without a code change. This directly answers the doctor's remark that 8–10 hard-coded adventures were too limited.

## 2. How does it work?

- **React** is the visible website. `/explore` is a page; `/admin` is another page.
- **Node.js** runs the JavaScript backend. **Express** receives HTTP requests at `/api/`.
- **MongoDB Atlas** stores information so it remains after a refresh. **Mongoose** defines the shape of stored objects and queries them.
- **JWT** is a signed token stored in an HttpOnly browser cookie when a user logs in. Passwords are hashed with bcrypt, not saved directly.
- **Admin role** exists in the database. The backend, not just the frontend, checks it for protected routes.
- **CRUD** means Create, Read, Update, Delete. Here, admins do CRUD on adventures.

## 3. Exact Windows steps

1. Install recent Node.js and open VS Code. From the top folder terminal, confirm `node -v` and `npm -v`.
2. Run `npm install` and `npm run install:all`. You need internet for npm packages.
3. Visit MongoDB Atlas, create a project and cluster. Create a **Database User**, then add your current computer IP to Network Access. (Atlas also requires network access for the deployed server.)
4. Click Atlas **Connect → Drivers**, copy the connection string, set its database to `littleadventures`, and put it in `server/.env` under `MONGODB_URI`.
5. Create `server/.env`: copy `server/.env.example` in VS Code and rename the copy. Add a long random `JWT_SECRET`. For example generate one with the Node command `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste its output. Don't send the key in chat.
6. Choose an admin email and long password: temporarily put them in `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` inside `.env`. Run `npm run seed --prefix server`. **Do not share actual passwords with anyone.** Remove these two values from the env file after seeding.
7. Run `npm run dev`. Visit http://localhost:5173 (website) and http://localhost:5000/api/health (API check). If either fails, read the terminal errors.
8. Visit Explore: the 10 seed adventures should appear. Create an ordinary account through Signup. Save/visit an adventure. Log out. Log in with admin credentials and try **Admin → Add adventure**.
9. Verify: the new adventure appears under Explore and can be edited, deleted and recommended. Confirm that an ordinary user cannot open the admin dashboard or call admin endpoints.
10. Run `npm test`. Then follow `docs/DEPLOYMENT.md` for GitHub and public site.

## 4. Divide work for the next few days

- **Fatima:** understand frontend pages and React routing; test Explore, Pick for Me, Favorites; record any UI issues; practice user-facing demo.
- **Mira:** configure database and admin login with you; test admin actions and security responses; practice technical architecture and API explanations.
- **Together:** run automated tests, create actual Git commits, deploy, check on mobile, rehearse the 5–8 minute presentation. You should both be able to explain the entire app—not only the pages you tested.

## 5. Common errors

- `Cannot find module`: run the install commands in Step 2.
- `Missing MONGODB_URI`: create `server/.env` with the Atlas connection string.
- `MongoServerSelectionError`: check Atlas IP access, connection string, database user and internet.
- `JWT_SECRET must be at least 32 characters`: generate the secret as Step 5 says.
- `EADDRINUSE: 5000`: stop the other API server or change `PORT` in `.env` (also update Vite proxy if needed).
- `403 Request verification failed`: a manual POST/PATCH/DELETE request is missing the custom header (the website handles it automatically).
- `401 Please log in`: log in first; `403 Administrator access required`: user isn't an admin.
- UI only shows an empty Explore page: run the seed command; also confirm API database connection.

## 6. Please do not do these

- Do not upload `server/.env` to GitHub, Moodle or this chat.
- Do not reuse a real personal password for the admin demo account.
- Do not claim the app has weather, maps, bookings or real ticket pricing.
- Do not skip the deployment verification or browser demonstration.
