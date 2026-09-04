# The Corporate Supplier Sustainability Portal 2026

## Identity
A single-page public landing page that onboards Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment programme and routes each supplier to the correct action — EcoVadis scorecard submission or Excel questionnaire download.
Tier: 1 — public static page, all content hardcoded, no login, no database (D1+A1)
Spec version governed: v1.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone — does not share a database with any other tool.

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP. Tell the builder: "The spec has changed since this CLAUDE.md was written — re-run the Project Governor on the revised spec before building, or these rules may contradict it." Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root — it is the current state of this build. If it is missing, recreate it with the structure at the end of this section, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat the notes back to the builder, treat them as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, fix, or schema change:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. Never end a session without one — an ending session is a save point.

First Session Setup (session 1 only):
1. Create docs/ and move product-spec.md into it.
2. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npx serve .
```

## Tech Stack
HTML · CSS · JavaScript · Netlify
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the builder connects the repo and enters environment variables in the Netlify dashboard; remind them before the first deploy (none needed for this build).

## Arms
Export — browser only, no server function — XLSX: pre-formatted Supplier Questionnaire 2026 workbook, served as a static asset in /assets/, not populated server-side.

## Hard Rules
- No external services, APIs, or credentials are used in this build — there is nothing to store or protect.
- The tool must never gate, hide, or conditionally render either submission path based on any user selection. Both the EcoVadis path and the Download path stay visible simultaneously at all times (spec Section 9).
- Acid Lime (#C8F135) may appear in at most 2 places on the page, always against #000000, never directly on a light background: the "Supplier Programme 2026" hero label, and the timeline step numbers. Do not add further decorative uses of it.
- No blue links. Text links are underlined + Ink (#000000) colour only.
- No gradients, no drop shadows, no rounded corners anywhere (buttons and cards: border-radius 0).

## Brand
No brand skill installed. These inline rules apply until one is added to the repo (then install it per First Session Setup and defer to it):
- Fonts: Playfair Display (headlines), DM Sans 300 (body), DM Sans 500 (labels/emphasis) — Google Fonts CDN
- Colours: Ink #000000 · Stone #B6B09F · Linen #EAE4D5 · Chalk #F2F2F2 · White #FFFFFF · Acid Lime #C8F135
- Buttons: square corners, no shadows. Cards: square corners, 0.5px Stone border, Linen or White background.
- All copy: short declarative sentences, active voice, no exclamation points, no emoji.

## Business Rules
- "Submit EcoVadis Scorecard" button opens https://ecovadis.com in a new tab (target="_blank", rel="noopener noreferrer"). It never opens a mailto or a form.
- "Download Assessment" button triggers a browser download of assets/The_Corporate_Supplier_Questionnaire_2026.xlsx via an anchor with the download attribute.
- "View Document" and "View Policy" open the Supplier Code of Conduct and Global Environmental Policy PDFs from /assets/ in a new tab.
- "Contact EHS" is a mailto: link to sustainability@thecorporate.com with subject "Supplier Portal Help Desk Query".
- No calculations, no scoring, no form submission, and no data collection anywhere on the page.

Out of scope — do not build:
- An online form for suppliers to fill questionnaire responses in the browser
- An internal review dashboard for procurement/EHS teams
- Automated email notification on Excel download
- A submission tracker showing % of Tier 1 suppliers who have responded
- Supplier login or saved progress
- Automated EcoVadis scorecard validation

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full section detail, exact figures, UI structure, logic, and acceptance criteria
PROGRESS.md in the root is read at every session start per the Session Protocol.
