# PROGRESS — The Corporate — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 1
**Last updated:** September 6, 2026 — Session 1
**Live URL:** none yet — not deployed (see Known issues)

## Current state
Full submission flow built and locally tested end-to-end (Playwright), not yet deployed. Landing page's Yes/No question now really routes: Yes → EcoVadis Submission Form; No → Choice Screen → Excel Re-upload Path or Online Questionnaire (Sections S2–S7). All three paths validate client-side (including the "Not Available" rule and conditional PFAS/water-stress fields), then POST to `/netlify/functions/notify-submission.js`, which validates again server-side, generates the Section 3 PDF for the online path (pdf-lib), and sends the team notification via the Resend REST API. Confirmation screens are shown only on a verified successful send; a failed send shows an inline error and never a false confirmation.

## Last session
Session 1 (this session): ran First Session Setup (moved product-spec.md to docs/); built the full frontend wizard (routing, 3 forms, conditional fields, client-side validation, confirmation screens) in index.html; built the Netlify Function (email + PDF generation); verified the function's logic and PDF output with local Node tests; verified the full frontend flow in a real browser with Playwright (all paths, conditional-field toggling, "Not Available" validation, file-type/size rejection, and the failure path never showing a false confirmation) — this caught and fixed one real bug (a `.field { display:flex }` rule was overriding the browser's native `[hidden]` behavior, so conditional fields didn't actually hide). Could not deploy — no Netlify MCP access in this remote session (see Known issues).

## Remaining work
- [x] First Session Setup: create docs/, move product-spec.md into it, commit (see CLAUDE.md Session Protocol)
- [x] Build Landing Page — wire the Yes/No question to real routing
- [x] Build No-EcoVadis Choice Screen — "Download Questionnaire" / "Fill Online" buttons
- [x] Build EcoVadis Submission Form — identity fields + PDF upload
- [x] Build Excel Re-upload Path — identity fields + .xlsx upload, existing download link kept
- [x] Build Online Questionnaire — Sections S2–S7, conditional PFAS/water-stress fields
- [x] Build Confirmation Screens for all three paths
- [x] Wire Email arm: Netlify Function sends the team notification with the right attachment
- [x] Local test pass — full walkthrough of every view (Playwright) before deploying
- [ ] Builder: create a Resend account, verify a sending domain (or confirm sandbox limits are acceptable), and add the API key as `RESEND_API_KEY` in Netlify's environment variables
- [ ] Connect Netlify (via MCP or the Netlify dashboard), create/confirm the site, set `RESEND_API_KEY`, and deploy — could not be done from this session (see Known issues)
- [ ] Once deployed: acceptance criteria pass against the live URL — verify every criterion in spec Section 13, including a real end-to-end send with a real Resend key
- [ ] Record the Live URL in this file's status header once deployed

## Build decisions
- Number-type fields (e.g. `scope1_emissions_tco2e`) use `<input type="text">`, not `type="number"` — a native number input would reject the literal text "Not Available", violating the Hard Rule.
- Yes/No dropdowns and the Scope 2 verification dropdown all get an appended "Not Available" option, since a `<select>` can't accept typed free text.
- Uploaded files and the online-path answers are sent to the function as one JSON payload (file content base64-encoded) rather than multipart/form-data — simpler to implement with no dependency, at the cost of ~33% payload inflation for files (see Known issues re: the 10MB limit).
- The online questionnaire's field list (names, labels, section order) is duplicated between index.html's inline script and notify-submission.js, since this is a static site with no build step / bundler to share a module between browser and function code.
- Netlify Functions use `pdf-lib` (pure JS, no native deps) for the PDF, bundled via esbuild per netlify.toml's `[functions]` block.

## Known issues
- **Not deployed.** This remote Claude Code session has no Netlify MCP connection (unlike the local/desktop setup CLAUDE.md assumes), so the site could not be created, `RESEND_API_KEY` could not be set, and nothing has been deployed. Whoever picks this up next needs either Netlify MCP access or the Netlify dashboard to: connect this repo, set `RESEND_API_KEY`, and trigger a deploy of this branch (or merge to main, since netlify.toml already assumes GitHub → Netlify auto-deploy from main).
- **Email sending is untested against the real Resend API.** Verified with local Node tests (payload validation, PDF generation) and a mocked function endpoint in the browser tests — never against a live `RESEND_API_KEY`, since no Resend account/key exists yet. Test this for real once deployed and configured.
- **Resend sandbox limitation:** the function sends from `onboarding@resend.dev` (Resend's shared test sender). Until a sending domain is verified in the Resend dashboard, Resend may restrict delivery to only the account owner's own verified address rather than `sustainability@thecorporate.com`. Verify a domain and update `FROM_ADDRESS` in notify-submission.js if needed.
- **10MB file limit vs. platform payload limits:** files are base64-encoded into a JSON body, inflating size by ~33%; a file near the 10MB spec limit could exceed Netlify Functions' underlying request-body limit (~6MB) before the function's own 10MB check ever runs, in which case the request fails with a platform-level error rather than the function's own message. Acceptable for this exercise build; worth a look if it comes up in real use.
- GDPR consent checkbox and data statement explicitly deferred for this course exercise (see spec Section 15) — must be added before this tool is ever used with real, non-exercise supplier data.

## Notes for next session
Deployment is the very next step: get Netlify MCP access (or dashboard access), connect the repo, set `RESEND_API_KEY`, deploy, then run the full spec Section 13 acceptance pass against the live URL — including one real end-to-end email send.
