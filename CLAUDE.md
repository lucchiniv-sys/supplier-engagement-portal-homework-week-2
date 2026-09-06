# The Corporate — Supplier Sustainability Portal

## Identity
An interactive portal where The Corporate's Tier 1 suppliers submit their sustainability assessment in a single visit — either an EcoVadis scorecard upload, a re-uploaded completed Excel questionnaire, or the same questionnaire filled in directly online — accessed via a public link, no login.
Tier: 1 — public submission tool, nothing is persisted, no login required (D2+A1)
Spec version governed: v1.1 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP. Tell the builder: "The spec has changed since this CLAUDE.md was written — re-run the Project Governor on the revised spec before building, or these rules may contradict it." Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root — it is the current state of this build. If it is missing, recreate it with the structure at the end of this section, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat the notes back to the builder, treat them as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, or fix: update PROGRESS.md (current state, remaining work, build decisions, known issues), commit and push to main, then tell the builder in one line: "Save point committed: [what changed]." Never start the next piece of work before the save point is pushed — an ending session is a save point.

First Session Setup (session 1 only): create docs/ and move product-spec.md into it, announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npx serve .
```

## Tech Stack
HTML · CSS · JavaScript · Netlify · Resend
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is active — create the site, set environment variables, and deploy via MCP.

## Arms
Email — user-triggered — /netlify/functions/notify-submission.js — fires when a supplier completes any of the three paths (EcoVadis upload, online questionnaire submit, Excel re-upload) → sends to sustainability@thecorporate.com — attaches the uploaded file (EcoVadis PDF or re-uploaded .xlsx) or a generated PDF of the online answers in transit, never stored
Export — no user-facing button; the PDF generated for the online-questionnaire email attachment follows the design intent in docs/product-spec.md Section 3 (header with company name + date, Sections S2–S7 with question/answer pairs, footer with contact details, plain unbranded styling for this build)

## Environment Variables
RESEND_API_KEY — Resend dashboard — email arm — Netlify env var

Key storage follows function placement: this tool has only Netlify Functions, so every key is a Netlify environment variable. No value ever appears in code or in any file committed to GitHub. At session start, confirm this key exists before first use; prompt the builder if it's missing.

## Hard Rules
- API keys never in any frontend file or GitHub commit. The Resend key is only ever read inside /netlify/functions, called through a server-side function — never from the browser.
- No database of any kind in this build. Do not add Supabase, localStorage-as-a-database, or any other persistence layer — every field a supplier fills in exists only for the duration of that page load and is discarded once the notification email is sent.
- Every required field (including conditionally-required ones) accepts the literal text "Not Available" as a complete, valid answer. Validation checks non-empty, not format.
- PFAS follow-up field (pfas_substitution_roadmap) only renders and is only required when pfas_present = Yes. Water-stress follow-up field (drought_contingency_plan) only renders and is only required when high_water_stress_region = Yes. Both stay hidden and non-required otherwise.
- If the Netlify Function fails to send the notification email, show the supplier a clear error and do not show the confirmation screen. Never claim success on a failed send.
- File uploads (EcoVadis PDF, re-uploaded .xlsx) are forwarded as email attachments only — never written to disk or any storage bucket. Enforce a 10MB size limit and the correct file type (PDF / .xlsx) per upload field, with an inline error on rejection.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md, index.html + existing static assets (direct evolution of the current single-page site, not a rewrite)
/netlify/functions    ← notify-submission.js (email arm, PDF generation for the online path)
/docs                 ← product-spec.md
```

## Brand
No brand skill yet. These inline rules apply until one is added to the repo (then install it per First Session Setup and defer to it):
- Colours: chalk #F2F2F2 (page bg) · linen #EAE4D5 (surface) · white #FFFFFF (elevated) · ink #000000 (primary/dark) · stone #B6B09F (muted text) · lime #C8F135 (accent)
- Fonts: 'Playfair Display' (headings/display), 'DM Sans' (body/UI). Reuse existing components as-is where possible: .tc-btn-primary, .tc-btn-secondary, .tc-btn-ghost, .tree-btn-yes/.tree-btn-no (for the new Download/Fill Online buttons)
- Builder has explicitly prioritized logic over polish: new form screens may ship with plain, functional styling first — do not block functional completion on matching the full visual system exactly

## Business Rules
- Routing: has_ecovadis = Yes → EcoVadis Submission Form. has_ecovadis = No → No-EcoVadis Choice Screen, which routes to either the Excel Re-upload Path ("Download Questionnaire") or the Online Questionnaire ("Fill Online").
- The online questionnaire's Sections S2–S7 mirror docs/product-spec.md Section 5 exactly in field name, type, and order. Do not re-ask the EcoVadis question inside the online form — has_ecovadis is already captured on the Landing Page.
- Nothing is saved if a supplier closes the tab before submitting on any path — this is expected behavior, not a bug.

Out of scope — do not build:
- Any database/persistence (Supabase or otherwise), "Save & Continue Later"/resume links, or scheduled reminder emails
- A read-only answers page, internal review dashboard, automated EcoVadis score verification, or digital signature capture
- AI-assisted features, CSV/bulk export, or cross-path deduplication
- A formal GDPR consent checkbox/data statement — explicitly deferred by the builder for this exercise build (flagged in PROGRESS.md Known Issues); do not add without the builder asking

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full module specs, UI sections (Section 8), logic (Section 9), PDF design intent (Section 3), field list (Section 5)
PROGRESS.md in the root is read at every session start per the Session Protocol.
