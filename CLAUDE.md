# The Corporate Supplier Sustainability Portal 2026

## Identity
Single-page public landing page onboarding Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment programme, routing them to EcoVadis scorecard submission or the Excel questionnaire download. Accessed via a direct URL sent by The Corporate's procurement/EHS team.
Tier: 1 — public landing page, all content hardcoded, no database, no login required (D1+A1)
Spec version governed: v1.0
Position: Standalone

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP and tell the builder to re-run the Project Governor first. Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md — it is the current state of this build. If missing, recreate it with the structure below, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat it back to the builder, treat it as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, fix, or content change:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Never end a session without a save point.

First Session Setup (session 1 only):
1. Create docs/ and move product-spec.md into it.
2. This build starts from the existing supplier_onboarding.html uploaded to the repo root — adapt it into the Project Structure below rather than rebuilding from scratch.
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines), Remaining work (shrinking checklist), Build decisions, Known issues, Notes for next session.

## Commands
```
npx serve .
```

## Tech Stack
HTML · CSS · JavaScript · Netlify
Deployment: repo already exists and is connected to Netlify — push to main auto-deploys. Netlify MCP status is unconfirmed; if active, deploy directly via MCP instead. No environment variables required either way.

## Arms
Export — browser only, no server function — "Download Assessment" downloads /assets/The_Corporate_Supplier_Questionnaire_2026.xlsx via an HTML anchor with the download attribute. Served as-is; nothing populated server-side.

## Hard Rules
- No API keys or external services required. Do not add any service, key, or env variable without first updating docs/product-spec.md and this file.
- "Submit EcoVadis Scorecard" opens https://ecovadis.com in a new tab, target="_blank" rel="noopener noreferrer" — never same-tab.
- "Download Assessment" uses the static asset in /assets/ only — never fetch, generate, or populate the workbook dynamically.
- "Contact EHS" mailto recipient and subject are fixed spec values — never user-editable.
- Both submission paths stay visible at all times — never gate or hide either based on user selection.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md only
/assets               ← The_Corporate_Supplier_Questionnaire_2026.xlsx
/docs                 ← product-spec.md
index.html            ← landing page (adapted from supplier_onboarding.html)
```

## Brand
No brand skill file uploaded yet. Inline rules from the spec apply until one is added (then install per First Session Setup and defer to it):
- Surfaces: White #FFFFFF, Chalk #F2F2F2, Linen #EAE4D5 (cards) · Ink #000000 text
- Accent: Acid Lime #C8F135 — max 2 uses per page, always on #000000, never on a light background
- Fonts: Playfair Display (headlines), DM Sans 300 (body), DM Sans 500 (labels) — Google Fonts CDN
- No drop shadows. Square corners (border-radius: 0) on buttons/cards. Cards: 0.5px Stone (#B6B09F) border. No blue links — underline + Ink only.

## Business Rules
- "Why We Are Asking" copy is drafted by Claude Code in The Corporate brand voice (short declarative sentences, active voice, no exclamation points, no emoji); builder reviews before deployment.
- "View Document" and "View Policy" links stay as # until the builder supplies real URLs — flag, never guess.
- Stats row and timeline content are fixed spec values — do not recalculate or infer them.

Out of scope — do not build:
- Online in-browser questionnaire form · Internal review dashboard · Automated email notification on download
- Submission tracker · Supplier login/saved progress · Automated EcoVadis scorecard validation

## Reference Docs
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
PROGRESS.md in the root is read at every session start per the Session Protocol.
