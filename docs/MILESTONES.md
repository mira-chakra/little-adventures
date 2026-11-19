# Professor milestones — actual deliverables and evidence

The assignment defines deadlines by **course sessions, not actual calendar dates**. Verify the current Moodle session deadlines. No GitHub tags or URLs can be truthfully claimed until you personally create/verify them.

| Official due | Deliverable | Where the implementation lives | Evidence to prepare |
|---|---|---|---|
| Session 19: Proposal | 1 page: idea, features, stack and sketch | Original approved proposal | Instructor approval + admin-role feedback |
| Session 20: M1 | Scaffold, finalized wireframes, DB schema | `client/`, `server/`, `docs/WIREFRAMES.md`, `docs/DATABASE_SCHEMA.md` | Open folder in VS Code; show wireframe/schema; commit/tag `milestone-1` |
| Session 21: M2 | Working backend: signup/login + CRUD | `server/src/routes/`, `middleware/`, `models/` | `GET /api/health`, signup/login, admin creates/edits/deletes; commit/tag `milestone-2` |
| Session 22: M3 | Connected frontend + working features | `client/src/pages/`, `components/`, `lib/` | Browse, recommend, signup, save favorite, add new adventure in UI; tag `milestone-3` |
| Session 23: M4 | Public live frontend & backend | `render.yaml`, `docs/DEPLOYMENT.md` | Real HTTPS site URL + `/api/health` responds publicly; tag `milestone-4` |
| Session 24: Final | Polished project + 5–8 minute demo | Entire repo + tests + documentation | GitHub repository, URLs, `npm test`, live browser demo, Q&A |

## What is coded vs. what is not yet verified?

- **Source files written:** React pages/components, Express endpoints, Mongoose models, seed, custom recommendation algorithm, tests, README, security notes and deployment configuration.
- **Requires your action:** a MongoDB Atlas account, valid `.env`, `npm install`, seed run, full end-to-end testing, GitHub push, Render configuration, production demo test and milestone submissions.
- **Automated test results:** record the output from `npm test` on your computer (do not assume tests passed unless they actually did).

## Suggested Git timeline

```bash
git init
git add .
git commit -m "Milestone 1: scaffold, schema, wireframes"
git tag milestone-1
# After verifying backend and any fixes:
git add . && git commit -m "Milestone 2: auth and CRUD API"
git tag milestone-2
# After verifying UI and any fixes:
git add . && git commit -m "Milestone 3: integrated React app"
git tag milestone-3
# After public deployment is verified:
git add . && git commit -m "Milestone 4: deployed capstone"
git tag milestone-4
```

**Be truthful:** if building from an already completed project, don't fabricate a historical sequence of commits by backdating them. Use honest commits reflecting work and verification that happened, or short updates explaining progress per milestone.
