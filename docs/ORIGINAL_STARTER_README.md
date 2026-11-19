# Little Adventures — Full-Stack Capstone

**Team:** Fatima Hamze and Mira Chakra  
**Status:** Milestone 1 starter (not the finished project)

Discover affordable outings in Lebanon based on mood, budget, and available time.

## What works in this starter
- React + Vite frontend with client-side page routing
- Express/Node backend with `GET /api/health`
- Vite proxy: React can call the backend using `/api/health`
- Initial page layouts and responsive CSS
- Database schema and wireframe drafts under `docs/`

**Not built yet:** MongoDB integration, authentication, admin management, recommendations, favorites, tests, deployment. We will add these in subsequent steps.

## Requirements
- VS Code, Git and npm
- **Node.js 22.12+ (or 20.19+)** and npm (check with `node -v` and `npm -v`)
- Internet access to install npm packages

## Start the app (Windows / VS Code)
1. Unzip the project. In VS Code choose **File → Open Folder** and select the `Little_Adventures_Milestone1_Starter` folder.
2. Open **Terminal → New Terminal** and run:
   ```powershell
   cd server
   npm install
   npm run dev
   ```
   Leave it running. Open `http://localhost:5000/api/health`; you should see JSON with `status: ok`.
3. Open **a second terminal** (make sure you are in the root folder) and run:
   ```powershell
   cd client
   npm install
   npm run dev
   ```
   If your new terminal is already in `server`, type `cd ..` before `cd client`.
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The homepage should say **Backend connected**.

## Folder map
```
client/     React website and styles
server/     Express REST API
  src/
    app.js        App definition and routes
    server.js     Starts the server
docs/       Draft database schema and screen wireframes
```

## GitHub (once both terminals work)
Create one GitHub repository and invite your teammate. From the project root:
```powershell
git init
git add .
git commit -m "Milestone 1: React and Express scaffold"
```
Then use GitHub's instructions to connect and push the repository. Do not commit `.env`, secrets, or `node_modules`.

## Planned tech stack
- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Node.js, Express, REST API
- **Database:** MongoDB Atlas + Mongoose
- **Auth (future milestone):** password hashing, JWT in an HttpOnly cookie, role-based admin checks
- **Custom feature (future milestone):** server-side budget/time/mood recommendation algorithm
- **Deployment (future milestone):** public website + public API

## Important design decision
Initial adventures will live in **MongoDB** as starter records, not as hard-coded React cards. An authorized admin will be able to add, edit, and remove adventures without changing code. The admin role will not be assignable through public signup.
