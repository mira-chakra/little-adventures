# User suggestions and adventure history

This version includes the interactive map, weather, admin tools and expanded catalogue, plus both new features.

## Upgrade on Windows

1. Stop your running app with Ctrl+C.
2. Extract this ZIP into a separate folder and open the folder containing client, server and package.json.
3. Copy your existing server/.env into the new server folder. Keep your database connection and JWT secret.
4. Run each command separately in PowerShell:

```powershell
npm.cmd install
```

```powershell
npm.cmd run install:all
```

```powershell
npm.cmd run dev
```

Open http://localhost:5173. No database reset, reseeding or new admin account is required. Existing favorites and visited checkmarks remain compatible. If your database has not received the 37-place catalogue, follow README.md's catalogue preview/apply instructions.

## Suggest a place (normal account)

Log in -> Suggest a place. Enter name, location, description, estimated cost, duration and mood. Information source and coordinates are optional; provide both coordinates or neither.

Submit for review. My suggestions shows Pending review, Approved, Rejected or Under admin editing. Rejected suggestions display the admin's feedback. Approved suggestions link to the published adventure.

## Review suggestions (admin account)

Admin -> Review user suggestions. Inspect the details and source. Use Edit details / add a photo if needed; preserve Pending visibility to return to the review workflow.

Approve and publish makes the place available in Explore, recommendations and (if coordinates exist) Map. Reject suggestion requires feedback. Pending and rejected records are excluded from public list, detail, weather, favorites, history and recommendation reads. Review decisions use a pending-only atomic update so two reviewers cannot decide the same pending submission simultaneously.

Admins can also use the existing place editor to manage visibility. Rejection feedback is easiest to provide through Review user suggestions. Users cannot approve, edit or delete other users' submissions.

## History

Open a public adventure -> Been here? -> optionally choose a visit date -> Save as visited. History displays visited places and lets you update dates or remove entries. Dates may be omitted but cannot be future or impossible calendar dates.

Favorites' existing Mark visited button also adds the place to History without assuming a visit date. Old visited checkmarks appear as date not recorded. Removing a favorite keeps its history entry; removing a history entry keeps its favorite. History stores one entry per user and place (the date can be updated), not multiple visits to the same place.

History remains tied to the live catalogue: places deleted by an admin are removed, and unpublished places are hidden. It is not an immutable travel journal.

## Demo checklist

1. With a normal account, suggest a place. Check Pending review.
2. Verify it is absent from public Explore and Map.
3. With admin, reject it with a reason; verify the submitter can see the feedback.
4. Submit another place. Approve it as admin and locate it in Explore.
5. Add coordinates in the admin editor and verify its map marker.
6. As normal user, save a place to Favorites, mark it visited, then add a date from History.
7. Remove it from Favorites and confirm History retains it.
8. Remove it from History and verify unrelated favorites remain.
9. Check with a second account: the first account's History and My suggestions must not appear.

## Validation and limitations

36 backend tests and 14 frontend tests passed; the production build passed. Tests cover authentication, ownership, pending-only approval, rejection feedback, public visibility, date validation, favorite/history independence and frontend forms.

Database methods are mocked in backend route tests; a live MongoDB end-to-end check is still needed on your PC. Browser execution is blocked in the development environment, so check the desktop/mobile layout and live map there too.

No photo upload, email notification or repeat-visit journal is included. Admins can attach a photo through the existing URL-based editor.
