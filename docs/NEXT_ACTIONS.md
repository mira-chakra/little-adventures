# Your remaining actions before Friday, November 20, 2026

The complete source is supplied now; **external deployment, installing dependencies, connecting your actual database and verifying end-to-end behavior cannot be completed without your accounts.** Start with these steps rather than rebuilding code from zero.

## Nov 11–12: Setup and first real database connection

- Extract ZIP and open it in VS Code.
- Install packages and confirm both servers start.
- Create MongoDB Atlas cluster, database user, IP access, `server/.env`.
- Seed 10 example adventures + private admin account.
- Check homepage, Explore, Pick for Me. Screenshot any errors for troubleshooting.

## Nov 13–14: Feature verification and corrections

- Create a normal user through signup; confirm login/logout, favorites and visited status persist.
- Log in as admin: create a new adventure, edit it, delete it, check it disappears.
- Test validation errors, guest blocking and ordinary user blocking for admin endpoints.
- Correct anything that fails on your machine.

## Nov 15–16: Tests and milestones

- Run `npm test` and `npm run build`; save output and fix issues.
- Read architecture, database schema and security docs together.
- Commit your work honestly to GitHub and create milestone evidence/updates for your instructor.

## Nov 17–18: Public deployment

- Create a Render web service using `render.yaml` or `docs/DEPLOYMENT.md`.
- Configure production secrets in the host, allow the host access to Atlas.
- Test public frontend and `/api/health` plus every key user/admin flow.

## Nov 19: Rehearsal and backup

- Rehearse 5–8-minute presentation in front of each other, switching roles.
- Practice React → Express → MongoDB, authentication vs. authorization, and recommendation scoring.
- Test the site on a second device and save links/screenshots permitted by the professor.

## Fri Nov 20: Submit

- GitHub source repo link, actual live frontend link, backend `/api/health` link.
- README with setup + architecture, tests in the repository, and milestone progress evidence.
- Be ready for a live presentation/Q&A and unexpected internet problems.

**Keep your `.env` secret.** Do not paste database URLs, JWT secrets or passwords into ChatGPT or the README.
