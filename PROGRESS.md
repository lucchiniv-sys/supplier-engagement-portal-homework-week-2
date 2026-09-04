# PROGRESS — The Corporate Supplier Sustainability Portal 2026

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 1
**Last updated:** 4 September 2026 — by Claude Code, session 1
**Live URL:** none yet [Rule: fill in after the first successful deploy]

## Current state
index.html built at the repo root: nav, hero (stats + brand pill), Why We Are Asking, Two Routes (EcoVadis + Download, both always visible, no gating), What Happens Next (4-step timeline), Key Resources, footer. assets/ holds The_Corporate_Supplier_Questionnaire_2026.xlsx, The_Corporate_Supplier_Code_of_Conduct_2026.pdf, and The_Corporate_Global_Environmental_Policy.pdf, all linked from the page. CLAUDE.md and PROGRESS.md exist at root. First Session Setup (docs/ move) has not run yet.
[Rule: this section describes what exists and works right now — never what is
planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 1: rebuilt the page to match product-spec (3).md exactly — removed the prior decision-tree/branching JS (spec requires both paths always visible, no gating), pointed the EcoVadis button at https://ecovadis.com instead of a mailto, moved referenced static assets into /assets/, reduced Acid Lime usage to the 2 spec-approved placements, and wrote CLAUDE.md + PROGRESS.md.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] First Session Setup: create docs/, move product-spec.md, commit (see CLAUDE.md Session Protocol)
- [ ] Confirm real URLs are acceptable as local /assets/ PDF links for "View Document" and "View Policy" (currently linked to the PDFs already in this repo)
- [ ] Local test pass — full walkthrough of every view before deploying
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before deploy
- [ ] Deploy to Netlify — builder connects the repo and adds environment variables in the Netlify dashboard (none required for this build)
[Rule: completed items leave this list and are absorbed into Current state. This
list only shrinks.]

## Build decisions
- Renamed the page file to index.html (was "supplier-onboarding (2).html") so it serves at the site root on Netlify.
- Linked "View Document" / "View Policy" to the Code of Conduct and Environmental Policy PDFs already present in this repo's /assets/, resolving the spec's open question without a placeholder "#".

## Known issues
None.

## Notes for next session
None.
