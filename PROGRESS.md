# PROGRESS — The Corporate Supplier Sustainability Portal 2026

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — build complete, merged to main, Netlify deploy triggered
**Last updated:** 4 September 2026
**Live URL:** not yet recorded — builder to confirm from the Netlify dashboard

## Current state
Repo is organised to the CLAUDE.md project structure. `index.html` is rebuilt against docs/product-spec.md v1.0 and passes all 10 acceptance criteria locally (criterion 10 pending the live deploy). No JavaScript on the page — both submission paths are static and always visible. `netlify.toml` publishes a `dist/` folder built from `index.html` + `/assets` only, so internal reference PDFs in `/docs` are not served publicly.

## Last session
Ran First Session Setup: created `docs/` and `assets/`, moved the spec, questionnaire and PDFs, renamed `supplier-onboarding (2).html` to `index.html`.
Rebuilt the page from the existing build, fixing four spec violations: the EcoVadis/questionnaire decision tree gated the two paths (dimmed one on selection), the EcoVadis CTA was a mailto instead of ecovadis.com, the download pointed at the repo root instead of `/assets/`, and Acid Lime appeared six times against a maximum of two.
Drafted the "Why We Are Asking" body copy in The Corporate voice — needs builder review.
Wired "View Document" and "View Policy" to the Code of Conduct and Environmental Policy PDFs that were already in the repo, rather than leaving them as `#`.
Verified locally with a real browser at 1440px and 390px: zero horizontal overflow, all asset paths return 200.

## Remaining work
- [x] Merge to `main` to trigger the Netlify deploy — done, fast-forward, commit 15cc914
- [ ] Confirm the live URL and record it above
- [ ] Acceptance criterion 10: verify the live site loads and the XLSX downloads from the deployed URL
- [ ] Builder reviews the "Why We Are Asking" copy
- [ ] Builder confirms the two resource PDFs are the correct public-facing versions

## Build decisions
- No JavaScript at all. The spec forbids gating either path, and the decision tree in the previous build was the only thing needing JS. Removing it satisfied the hard rule and simplified the page.
- Acid Lime limited to two uses, both Pattern A (lime on Ink): the "Supplier Programme 2026" hero tag and the timeline step numbers. Removed the lime hero underline, the lime rule under the hero, the lime "why" card tags and the lime "Yes" button.
- Timeline step numbers rendered as black squares with lime numerals so all four steps carry the brand pattern; dropped the previous "active step" highlight, which was not in the spec.
- `netlify.toml` uses a copy-to-`dist` build so `/docs` stays off the public site.
- Resource PDFs are served from `/assets` and open in a new tab.
- `dist/` is gitignored — Netlify builds it on deploy.

## Known issues
- Netlify MCP is not available in this session, so the deploy was triggered by git push to `main` and its outcome could not be verified from here.
- "View Document" / "View Policy" now point at repo PDFs rather than `#`. The filenames match the spec's named documents exactly, but the builder should confirm these are the versions intended for suppliers.
- `docs/project-governor.zip` is kept in the repo for reference; it is not part of the site.

## Notes for next session
The builder authorised the merge and `main` was fast-forwarded to 15cc914, which triggers the Netlify build. Deployment was not verified from this session — there is no Netlify access here. First job next session: open the Netlify dashboard, confirm the build succeeded, record the live URL in the header above, then walk acceptance criterion 10 on the live site (page loads on desktop and mobile, no 404s, the XLSX downloads).

Note for that check: this is the first deploy that carries `netlify.toml`, so Netlify now runs a build command and publishes `dist/` rather than the repo root. If the site 404s, the publish directory is the first thing to look at.
