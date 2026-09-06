# PROGRESS — The Corporate — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 0 — build not started
**Last updated:** September 6, 2026 — by Project Governor, pre-build
**Live URL:** none yet

## Current state
Nothing built. GitHub repo not yet created by the builder — CLAUDE.md, PROGRESS.md, and product-spec.md should be uploaded to its root as soon as it exists, before opening Claude Code.

## Last session
None — the first build session has not happened yet.

## Remaining work
- [ ] First Session Setup: create docs/, move product-spec.md into it, commit (see CLAUDE.md Session Protocol)
- [ ] Builder: create a Resend account and have the API key ready to enter as an environment variable
- [ ] Build Landing Page — wire the existing Yes/No question to real routing (currently CSS-only)
- [ ] Build No-EcoVadis Choice Screen — "Download Questionnaire" / "Fill Online" buttons
- [ ] Build EcoVadis Submission Form — identity fields + PDF upload
- [ ] Build Excel Re-upload Path — identity fields + .xlsx upload, existing download link kept
- [ ] Build Online Questionnaire — Sections S2–S7, one long scrollable page, conditional PFAS/water-stress fields
- [ ] Build Confirmation Screens for all three paths
- [ ] Wire Email arm: Netlify Function that sends the team notification with the right attachment (uploaded file, or generated PDF for the online path)
- [ ] Local test pass — full walkthrough of every view before deploying
- [ ] Acceptance criteria pass — verify every criterion in spec Section 13 before deploy
- [ ] Deploy to Netlify via MCP, set environment variables

## Build decisions
None yet.

## Known issues
GDPR consent checkbox and data statement explicitly deferred for this course exercise (see spec Section 15) — must be added before this tool is ever used with real, non-exercise supplier data.

## Notes for next session
None.
