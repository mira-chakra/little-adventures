# GitHub + MongoDB Atlas + Render deployment

This is **work you must perform using your accounts**. No real public URL is created by merely having the ZIP. The browser and API can run under a *single* HTTPS hostname, simplifying secure cookie authentication.

## A. First, prove the local project runs

1. Complete `docs/START_HERE.md` and make sure Node.js, MongoDB, admin seed and both development servers run.
2. Confirm Explore shows records, Pick for Me returns ranked matches, user signup/favorites work, and admin CRUD modifies Explorer's results.
3. Run `npm test` and record the results. Fix any failures first.
4. Run `npm run build` locally. It should create `client/dist`.

## B. Upload to GitHub

In the project root, after checking `.env` is ignored:

```bash
git init
git add .
git status
git commit -m "Little Adventures capstone implementation"
git branch -M main
# Create an empty GitHub repository in your own account, then:
git remote add origin https://github.com/YOUR_USERNAME/little-adventures.git
git push -u origin main
```

Never include passwords, keys, Atlas connection strings or private `.env` files. If you accidentally commit a secret, rotate it rather than merely deleting the commit.

## C. Configure public hosting

A `render.yaml` Blueprint file is included, or create a **Node Web Service** on Render manually using:

- Repository: your GitHub repo; **Root Directory:** repository root.
- **Build command:** `npm install --include=dev --prefix client && npm run build --prefix client && npm install --omit=dev --prefix server`.
- **Start command:** `npm run start --prefix server`.
- **Environment variables:** `NODE_ENV=production`, `MONGODB_URI=<your Atlas URI>`, `JWT_SECRET=<long random secret>`. Set these in the Render UI, not GitHub.
- **Health check:** `/api/health`.
- Select appropriate free/paid options according to your account and current platform policies.

Your Express server serves Vite's `client/dist` files and API requests from the same hostname. Example URL **format only**: `https://YOUR-SERVICE.onrender.com/` and `https://YOUR-SERVICE.onrender.com/api/health`.

## D. Allow database connectivity

MongoDB Atlas must permit connections from the deployment environment. It requires a **database user** and an **IP access list** entry. Prefer narrowly scoped access where your hosting plan provides stable outbound IPs. If using a broad temporary IP entry due to hosting limitations, understand the security tradeoff, use strong database credentials and remove access when no longer needed.

Atlas reference: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
Render reference: https://render.com/docs/deploy-node-express-app

## E. Final checks on the actual public URL

- [ ] `https://.../` shows the website (try desktop + mobile)
- [ ] `https://.../api/health` returns `{ "status": "ok" }`
- [ ] Explore shows database records
- [ ] Pick for Me filters/returns real recommendations
- [ ] Signup creates standard user; login/logout work
- [ ] Favorites are isolated by user
- [ ] Admin can create/edit/delete adventures
- [ ] Standard user cannot reach admin routes
- [ ] Refresh on `/explore` still loads React correctly
- [ ] Live HTTP traffic is over HTTPS, secure cookie set
- [ ] README and tests present in GitHub
- [ ] Prepare 5–8 minute presentation and Q&A

Send the **GitHub repository URL** and **two links** to the professor: frontend homepage and API `/api/health`. Both can share the same base domain.
