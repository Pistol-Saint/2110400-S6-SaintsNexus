# Final Submission Checklist of Saints Nexus

Use this checklist before submitting the project. Mark an item complete only after personally verifying it against the deployed application or final commit.

## A. Repository and deployment
- [ ] Repository is accessible to the faculty: https://github.com/Pistol-Saint/2110400-S6-SaintsNexus
- [ ] Final code is committed and pushed to `main`.
- [ ] Frontend works: https://2110400-saintsnexus-frontend.vercel.app/
- [ ] API health works: https://2110400-saintsnexus-backend.vercel.app/api/health
- [ ] Swagger UI works: https://2110400-saintsnexus-backend.vercel.app/docs
- [ ] Vercel environment variable names/configuration checked; values remain secret.
- [ ] No `.env`, service-role key, JWT secret, password pepper, access token, or refresh token committed.

## B. Documentation
- [ ] PRD, SRS, and TDD reviewed against the actual code.
- [ ] Final report cover details completed.
- [ ] AI/tool disclosure accurately completed per faculty policy.
- [ ] Database schema details verified from Supabase before including SQL/schema claims.
- [ ] Limitations section retained; do not claim missing features are implemented.

## C. Demo accounts
The faculty evidence requirements mandate two administrator accounts and three normal-user accounts. Prepare and verify all five accounts in the deployed application. Do not publish passwords in GitHub or in the public repository. Include credentials only in the final PDF and only as permitted by the faculty submission instructions.
- [ ] Admin account 1 tested.
- [ ] Admin account 2 tested.
- [ ] Normal user account 1 tested.
- [ ] Normal user account 2 tested.
- [ ] Normal user account 3 tested.
- [ ] README/report includes only safe account identifiers and roles if required; share credentials privately only through the faculty-approved method.
- [ ] Confirm no test account is accidentally banned or has an unexpected role.

## D. Functional verification
- [ ] Register a fresh test user.
- [ ] Log in and open dashboard.
- [ ] Browse courses and open course details.
- [ ] Confirm normal user cannot access admin-only API actions.
- [ ] Log in as admin and open admin dashboard.
- [ ] Change a test user's role and restore it.
- [ ] Ban a disposable test user with a reason; confirm access is denied; unban it.
- [ ] Update profile username.
- [ ] Test incorrect current password rejection.
- [ ] Change password only on a disposable test account if necessary.
- [ ] View sessions and revoke a different active session.
- [ ] Confirm audit records are created for relevant actions.

## E. Automated checks
Run from repository root with the backend virtual environment active:
```powershell
python -m pytest backend\tests -v
npm run build --prefix frontend
git diff --check
```
- [ ] Save fresh test output showing actual result.
- [ ] Save fresh successful frontend build output.
- [ ] Check final Git working tree and pushed commit.

## F. Faculty evidence screenshots

The following is the 21-item evidence capture list from the assessment preparation. Capture actual screenshots only when the feature/behavior exists. If a listed feature is not implemented, do not fabricate a screenshot; mark it as a gap and ask the faculty how to document it.

1. [ ] S1 â€” Signup/login with validation feedback.
2. [ ] S2 â€” Logged-in learner dashboard and course catalogue.
3. [ ] S3 â€” Profile page and incorrect current-password rejection.
4. [ ] S4 â€” Session list and revoke action.
5. [ ] S5 - Capture PROJECT AVENGERS group members and their Create, Update, Assign, and View permissions.
6. [ ] S6 â€” RBAC-denied action and 403 response.
7. [ ] S7 â€” Expired access token rejected with 401.
8. [ ] S8 â€” Refresh request and newly issued access token (not an HttpOnly cookie in current implementation).
9. [ ] S9 â€” Banned user rejected on next authenticated request.
10. [ ] S10 â€” Admin overview statistics.
11. [ ] S11 â€” User list with client-side search, role/status filters, and pagination over loaded users.
12. [ ] S12 â€” User detail, sessions, and recent activity (only list/session/audit views are implemented; no dedicated detail view).
13. [ ] S13 â€” Ban reason and resulting banned state.
14. [ ] S14 â€” Group/content moderation and bulk action (group/bulk moderation not present; course CRUD is present).
15. [ ] S15 â€” Filtered activity log using implemented client-side action filters.
16. [ ] S16 â€” Security view with failed login analysis (not present as a dedicated dashboard).
17. [ ] S17 â€” CSV export (not present in inspected implementation).
18. [ ] S18 â€” Vercel frontend production deployment.
19. [ ] S19 â€” Vercel backend deployment/environment variable names with values hidden.
20. [ ] S20 â€” Live API Swagger documentation.
21. [ ] S21 â€” Pytest results.

## G. Video and submission
- [ ] Record a 5â€“8 minute demonstration covering the implemented learner, course, profile/session, and administrator workflows.
- [ ] Check audio, browser zoom, and deployed URLs before recording.
- [ ] Ensure no passwords, tokens, private keys, or environment values appear.
- [ ] Complete the faculty submission form: https://forms.gle/USnKmgZcmZMuFCFP6
- [ ] Attach the final report PDF and required evidence/video links.
- [ ] Open the submitted links once more to ensure they are accessible.
