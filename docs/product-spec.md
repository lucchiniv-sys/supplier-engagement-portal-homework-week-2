# Product Spec — The Corporate — Supplier Sustainability Portal

**Version:** 1.1
**Date:** September 6, 2026
**Author:** Valentina
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** The Corporate — Supplier Sustainability Portal

**What it does:** An interactive portal where The Corporate's Tier 1 suppliers submit their annual sustainability assessment in a single visit. Suppliers first answer whether they hold a valid EcoVadis Scorecard. If yes, they upload their scorecard (PDF), which is emailed straight to The Corporate's team. If no, they can either download the Excel questionnaire, complete it offline and re-upload it (also emailed straight through), or fill in the same questionnaire directly online in one sitting — on submit, a PDF of their answers is generated and emailed to the team.

**Who uses it:** The Corporate's 500+ Tier 1 suppliers (the sustainability/procurement contact at each supplier company), who access the portal via a link they receive, with no account or login required. The Corporate's Procurement/EHS team receives an email each time a supplier submits or uploads something.

**Why it exists:** This is a course exercise, built as a first, simplified pass on a live idea: replacing the current "download Excel, fill offline, email it back" flow with a page where a supplier can also fill in the questionnaire directly, without needing anywhere to store data. Persistence, save/resume, and automated reminders are intentionally out of scope for this pass and are planned for a later phase.

**Build status:** Iteration — Previous version (v1.0 of this spec) designed a Tier 2 build with Supabase, save/resume on the online questionnaire, a read-only answers page, and weekly reminder emails. The builder decided this first pass should be a simpler, session-only exercise with no database — this v1.1 spec replaces v1.0's persisted design with a session-only one. Before that, the very first version was a static HTML page with no working submission logic at all (see v1.0 for that history).

---

## Section 2 — Classification

### Data Model

**Decision:** D2 — Session

| Label | This tool? |
|-------|-----------|
| D1 — Hardcoded | No |
| D2 — Session | **Yes** |
| D3 — Persisted | No |

**Reason:** Nothing needs to be retrievable after the supplier closes the tab. Each submission (files or typed answers) is used only long enough to build and send one email to the team, then discarded — no database, no stored files, no way for a supplier to resume later.

---

### Access Model

**Decision:** A1 — Public

| Label | This tool? |
|-------|-----------|
| A1 — Public | **Yes** |
| A2 — Authentication | No |
| A3 — Authorization | No |

**Reason:** No account or login of any kind. Any supplier with the portal link can use it.

---

### Tier

**Tier:** 1

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Netlify only | Netlify |

Plain language: this is the simplest tier — no database at all. Everything a supplier does happens in one visit, and results are simply emailed to the team.

---

### Standalone or Stack

**This tool is:** Standalone.

---

## Section 3 — Arms

### AI API Arm

**Active:** No

---

### Export Arm

**Active:** No — there is no user-facing "download my results" button. However, a PDF is generated server-side to travel as an email attachment (see Email Arm below); its design intent is documented there per the Export arm's requirement for any generated PDF.

---

### Email Arm

**Active:** Yes.

| Detail | Answer |
|--------|--------|
| Trigger event | A supplier completes one of the three paths in a single visit: uploads their EcoVadis scorecard, submits the online questionnaire, or re-uploads the completed Excel questionnaire |
| Recipient | The Corporate's Procurement/EHS team, at `sustainability@thecorporate.com` |
| Email content | "[Company legal name] has submitted [the EcoVadis scorecard / the online sustainability questionnaire / the completed Excel questionnaire]." Contact name, title, and email of the supplier's referent are included in the email body. |
| File attachment in transit | Yes. EcoVadis path → the uploaded PDF scorecard, forwarded as-is. Excel re-upload path → the uploaded .xlsx file, forwarded as-is. Online questionnaire path → a PDF generated at submission time containing all of the supplier's answers (see PDF design intent below). None of these files are stored anywhere after the email is sent. |
| Function placement | Netlify Function — user-triggered, called at the moment the supplier's browser completes the submit action |

**PDF design intent (online questionnaire path only):**
- Header: "The Corporate — Supplier Sustainability Questionnaire", the supplier's legal company name, and the submission date
- Body: Sections S2–S7 in order, each with its section title (e.g. "Climate & Decarbonisation") followed by each question's plain-language label and the supplier's typed answer directly beneath it
- Footer: the supplier's contact name, title, and email; page numbers
- Styling: plain, readable, single-column layout for this first version — no branded design required yet, consistent with the builder's "logic first, aesthetics later" priority for this build

> Resend is the email service. Free tier: 3,000 emails/month — sufficient for this volume.

---

### Scheduled Automation Arm

**Active:** No — explicitly deferred (see Section 12). Weekly reminders require knowing who has and hasn't submitted, which requires persisted data; out of scope for this session-only build.

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | HTML/CSS/JS — matches the existing static page exactly |
| Deployment target | Netlify |
| Netlify MCP | Active — Netlify is connected via Claude Desktop Connectors. Claude Code creates the site, sets environment variables, and deploys automatically. |

**GitHub:** The builder has not yet created the GitHub repo for this project. It must be created, with `product-spec.md`, `CLAUDE.md`, and `PROGRESS.md` uploaded to its root, before the first Claude Code session opens.

> No Supabase section — this is a Tier 1 tool. Nothing is persisted.

---

## Section 5 — Data Architecture

**N/A per template (Data Model is D2, not D3 — no database, no schema).** The fields below are documented here anyway because Claude Code needs them to build the form UI, the outgoing email content, and the generated PDF — none of this data is stored once the email is sent.

**Fields collected during a session (not persisted):**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| legal_name | Legal company name | Text | Supplier | Yes |
| registered_country | Registered country | Text | Supplier | Yes |
| contact_name | Primary contact name | Text | Supplier | Yes |
| contact_title | Primary contact title | Text | Supplier | Yes |
| contact_email | Primary contact email | Text | Supplier | Yes |
| has_ecovadis | Holds a valid EcoVadis Scorecard? | Yes/No | Supplier (initial question) | Yes |
| ecovadis_scorecard_file | EcoVadis scorecard upload | File (PDF), forwarded by email, not stored | Supplier (EcoVadis path) | Yes, if path = ecovadis |
| reuploaded_excel_file | Re-uploaded completed questionnaire | File (.xlsx), forwarded by email, not stored | Supplier (Excel re-upload path) | Yes, if path = excel_reupload |

**Online questionnaire fields** (only used for the online path, in-memory for the duration of the session — identical content/order to the Excel questionnaire's Sections S2–S7; S1's EcoVadis question is not re-asked since it was already answered as `has_ecovadis`):

| Field name | Section | Type | Notes |
|-----------|---------|------|-------|
| scope1_emissions_tco2e | S2 Climate (E1) | Number | tCO2e |
| scope2_emissions_tco2e_market_based | S2 Climate (E1) | Number | tCO2e, market-based |
| scope2_verification_method | S2 Climate (E1) | Dropdown | Verified by Third Party / Internally Calculated / Estimated / Not Tracked |
| scope3_emissions_tco2e | S2 Climate (E1) | Number | tCO2e |
| scope3_categories_included | S2 Climate (E1) | Text | Which Scope 3 categories are included |
| sbti_target | S2 Climate (E1) | Dropdown Yes/No | Has an SBTi-validated target |
| decarbonisation_projects | S2 Climate (E1) | Long text | Top 3 projects, next 24 months |
| reduction_barriers | S2 Climate (E1) | Long text | Barriers to 50% reduction by 2030 |
| substances_of_concern_kg | S3 Pollution/PFAS (E2) | Number | kg, REACH/SVHC substances |
| pfas_present | S3 Pollution/PFAS (E2) | Dropdown Yes/No | Products/processes contain PFAS |
| pfas_substitution_roadmap | S3 Pollution/PFAS (E2) | Long text | **Conditional — only shown/required if pfas_present = Yes** |
| wastewater_treatment | S3 Pollution/PFAS (E2) | Long text | Treatment process description |
| water_withdrawal_m3 | S4 Water (E3) | Number | m³ |
| water_source | S4 Water (E3) | Text | Municipal / groundwater / surface |
| high_water_stress_region | S4 Water (E3) | Dropdown Yes/No | Primary facility in a high-water-stress region |
| water_saving_projects | S4 Water (E3) | Long text | Water-saving/recycling initiatives |
| drought_contingency_plan | S4 Water (E3) | Long text | **Conditional — only shown/required if high_water_stress_region = Yes** |
| waste_generated_tonnes | S5 Circular Economy (E5) | Number | Tonnes |
| waste_breakdown | S5 Circular Economy (E5) | Text | Landfill / recycled / energy recovery / hazardous |
| pcr_content_percent | S5 Circular Economy (E5) | Number | % post-consumer recycled content |
| circularity_in_components | S5 Circular Economy (E5) | Long text | Circularity approach for components supplied |
| zero_waste_strategy | S5 Circular Economy (E5) | Long text | Zero Waste to Landfill strategy |
| protected_area_proximity | S6 Biodiversity (E4) | Dropdown Yes/No | Site within/adjacent to a protected area |
| biodiversity_initiatives | S6 Biodiversity (E4) | Long text | Initiatives taken |
| biodiversity_impact_assessment | S6 Biodiversity (E4) | Long text | TNFD or equivalent assessment status |
| human_rights_policy | S7 Social/Governance (S2, G1) | Dropdown Yes/No | Formal Human Rights Policy exists |
| human_rights_due_diligence | S7 Social/Governance (S2, G1) | Dropdown Yes/No | Due diligence conducted in last 24 months |
| grievance_mechanism | S7 Social/Governance (S2, G1) | Long text | Description + numbers filed/resolved |
| conflict_minerals_policy | S7 Social/Governance (S2, G1) | Dropdown Yes/No | Verified 3TG policy in place |
| code_of_conduct_monitoring | S7 Social/Governance (S2, G1) | Long text | How compliance is monitored, incl. audits |

> **Rule for every required field above:** the literal text "Not Available" counts as a valid, complete answer. Validation checks that a field is non-empty, not that it contains a specific kind of value.

**Tables needed:** None — no database in this build.

**File storage:** No persistent storage. Uploaded files (EcoVadis PDF, re-uploaded Excel) pass through the Netlify Function only long enough to attach to the outgoing email, then are discarded. Suggested size limit: 10MB per file.

**Derived or calculated data:** None.

---

## Section 6 — Access and Permissions

**N/A** — Access Model is A1 (public, no login).

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable — confirmed during the interview. This is a D2 (session-only) tool with no database, so the mandatory GDPR section of the framework does not apply to it.

**Note for the builder:** personal data (contact name, title, email) is still transmitted by email to The Corporate's team on every submission, even though it isn't stored by the tool itself. The builder has explicitly deferred adding a formal consent checkbox and data statement to this exercise build; it should be revisited before this tool is used with real supplier data outside the course context (see Section 15).

---

## Section 8 — Screen and UI Structure

### Landing Page (existing, unchanged in this build)
- **Purpose:** Explain the programme and lead into the submission path.
- **What is visible:** Hero with footprint stats, "why we're asking" section, the EcoVadis Yes/No question card, timeline, resource links — all as already built.
- **User actions:** Click "Yes, I Have a Scorecard" or "No, I Don't."
- **What happens next:** Yes → EcoVadis Submission Form. No → No-EcoVadis Choice Screen. (This routing is now real, not just a CSS highlight.)

### No-EcoVadis Choice Screen (new — replaces the current static "Path A / Path B" panels)
- **Purpose:** Let the supplier pick how they want to complete the questionnaire.
- **What is visible:** Two clickable buttons, styled like the existing Yes/No decision-tree buttons: "Download Questionnaire (Excel)" and "Fill Online."
- **User actions:** Click one of the two buttons.
- **What happens next:** "Download Questionnaire" → Excel Re-upload Path. "Fill Online" → Online Questionnaire.

### EcoVadis Submission Form
- **Purpose:** Capture supplier identity and their scorecard, and send it straight to the team.
- **What is visible:** Fields for legal_name, registered_country, contact_name, contact_title, contact_email; a PDF upload field for the scorecard; a Submit button.
- **User actions:** Fill fields, upload PDF, click Submit.
- **What happens next:** The Netlify Function sends the team notification email with the PDF attached; supplier sees a confirmation screen. Nothing is stored.

### Excel Re-upload Path
- **Purpose:** Let the supplier download the existing Excel template (unchanged static asset), then come back and re-upload the completed file.
- **What is visible:** The existing download link/button for `The_Corporate_Supplier_Questionnaire_2026.xlsx`; identity fields (legal_name, registered_country, contact_name, contact_title, contact_email); an .xlsx upload field; Submit button.
- **User actions:** Download the file, fill it offline, come back, fill identity fields, upload the completed .xlsx, click Submit.
- **What happens next:** The Netlify Function sends the team notification email with the .xlsx attached; confirmation screen shown. Nothing is stored.

### Online Questionnaire (new — the core of this build)
- **Purpose:** Let the supplier complete the full ESRS-aligned questionnaire directly on the page, in a single visit.
- **What is visible:** Identity fields (legal_name, registered_country, contact_name, contact_title, contact_email) at the top, then Sections S2–S7 in order on one long scrollable page, each field matching the Excel exactly (dropdowns, number fields, long text). PFAS and water-stress follow-up questions only appear when their trigger question is answered Yes. A single Submit button at the bottom.
- **User actions:** Fill in fields (any field accepts "Not Available" as a valid answer); click Submit once every required field (including conditionally-required ones) is filled.
- **What happens next:** The Netlify Function generates the PDF of all answers (see PDF design intent, Section 3), sends the team notification email with it attached, and shows a confirmation screen. If the supplier closes the tab before submitting, everything they typed is lost — there is no save/resume in this build.

### Confirmation Screens
- **Purpose:** Confirm to the supplier that their submission went through.
- **What is visible:** A simple "Thank you, your submission has been received" style message, shown after EcoVadis upload, Excel re-upload, or online Submit.
- **User actions:** None required.
- **What happens next:** N/A.

---

## Section 9 — Logic and Calculations

**What is calculated or scored:** No numeric scoring — this tool routes, validates, and forwards. No persistence, no resumption logic.

**Inputs:** The initial `has_ecovadis` answer; the path chosen on the No-EcoVadis Choice Screen; all form fields listed in Section 5; the `pfas_present` and `high_water_stress_region` answers (drive conditional fields).

**Rules:**
1. `has_ecovadis = Yes` → route to EcoVadis Submission Form. `has_ecovadis = No` → route to No-EcoVadis Choice Screen.
2. On the No-EcoVadis Choice Screen: "Download Questionnaire" → Excel Re-upload Path. "Fill Online" → Online Questionnaire.
3. In the Online Questionnaire: `pfas_present = Yes` reveals and requires `pfas_substitution_roadmap`; otherwise hidden and not required. `high_water_stress_region = Yes` reveals and requires `drought_contingency_plan`; otherwise hidden and not required.
4. A required field is satisfied by any non-empty value, including the literal text "Not Available."
5. On Submit (any of the three paths): validate all currently-required fields are filled, then call the Netlify Function to send the team notification email with the appropriate attachment (uploaded file, or generated PDF for the online path). On success, show the confirmation screen.

**Output:** One email to the team per submission, with the relevant attachment. Nothing is saved by the tool.

**Edge cases:**
- Supplier closes the tab mid-form (any path) before submitting — nothing is sent, nothing is recoverable. This is expected behavior for this build.
- File upload of the wrong type or over the size limit — show an inline error and block submission until corrected.
- The email-sending function fails (e.g. Resend is down) — show the supplier an error message asking them to try again or contact `sustainability@thecorporate.com` directly; do not show a false confirmation.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** No brand skill file. Design tokens are already established in the existing static page (`supplier-onboarding.html`) and should be reused for every new screen:

- **Fonts:** 'Playfair Display' (headings/display) + 'DM Sans' (body/UI)
- **Colours:** ink `#000000` (primary dark/text), stone `#B6B09F` (muted text), linen `#EAE4D5` (surface), chalk `#F2F2F2` (page background), white `#FFFFFF` (elevated surface), lime `#C8F135` (accent)
- **Existing components to reuse as-is:** `.tc-btn-primary`, `.tc-btn-secondary`, `.tc-btn-ghost`, `.tree-btn-yes` / `.tree-btn-no` styling (for the new Download/Fill Online buttons), form field styling to be newly designed in the same visual language

**Visual feel:** Clean, minimal, editorial/corporate — dark hero sections, generous whitespace, uppercase micro-labels, thin borders.

**Build priority — explicitly confirmed by the builder:** Logic first. It is acceptable for the first working version of the new screens (forms, upload flows) to use plain, functional styling; matching the full existing brand system precisely can be refined in a follow-up pass once the submission logic works end-to-end. Do not block functional completion on pixel-perfect styling.

**Reference or inspiration:** The uploaded `supplier-onboarding.html` file itself is the reference.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Resend | Email arm — forwards uploads and the generated PDF to the team | API key | Netlify environment variable |

> **Security rule — no exceptions:** No API key, token, password, or credential may appear in any HTML, JavaScript, or file committed to GitHub.

**Credentials readiness:**

| Credential | Status | Where to get it |
|-----------|--------|----------------|
| Resend API key | Needs creating | Resend dashboard (resend.com) |

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Persistence (Supabase database) | Explicitly deferred by the builder for this course exercise — this is a session-only (D2) first pass. Planned for a future Phase 2. |
| "Save & Continue Later" / resume on the online questionnaire | Requires persistence; deferred alongside it. |
| Weekly reminder emails to suppliers who haven't submitted | Requires knowing who has/hasn't submitted, which requires persisted data. |
| Read-only answers page for the team | Not needed — in this build the team receives full submission content directly by email. |
| Formal GDPR consent checkbox and data statement | Deferred by the builder alongside persistence; should be revisited before real supplier data is collected outside this course exercise. |
| Internal review dashboard for the Procurement/EHS team | Not needed to validate the idea; the team's touchpoint is the notification email. |
| Automated EcoVadis score verification (checking the actual score is ≥45) | Not needed for this build; the team reviews the uploaded scorecard manually. |
| Digital signature capture on the declaration | Explicitly dropped in favour of relying on the submission email itself. |
| AI-assisted explanation of ESRS terms for confused suppliers | Not needed; suppliers can look terms up themselves. |
| CSV/bulk export of all submissions | Not applicable without persisted data. |
| Cross-path deduplication (detecting the same supplier submitting via more than one path) | Not needed to validate the idea; each submission is an independent email. |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Landing page Yes/No question routes for real | "Yes" opens EcoVadis Submission Form; "No" opens the Choice Screen | [ ] |
| 2 | EcoVadis Submission Form sends correctly | Submitting sends the team notification email with the uploaded PDF attached; supplier sees the confirmation screen | [ ] |
| 3 | Choice Screen buttons work | "Download Questionnaire" leads to the Excel Re-upload Path; "Fill Online" leads to the Online Questionnaire | [ ] |
| 4 | Excel Re-upload Path sends correctly | Submitting sends the team notification email with the .xlsx attached; confirmation screen shown | [ ] |
| 5 | Online Questionnaire renders all fields correctly | All S2–S7 fields from Section 5 appear in the correct order and type; PFAS and water-stress follow-ups are hidden unless their trigger is Yes | [ ] |
| 6 | "Not Available" satisfies required-field validation | Typing "Not Available" in any required field allows the form to proceed/submit | [ ] |
| 7 | Online Questionnaire generates and sends the PDF | Submitting generates a PDF matching the design intent in Section 3, attaches it, and sends the team notification | [ ] |
| 8 | Nothing persists after the tab closes | Reloading or reopening the portal never shows previously entered data — no save/resume in this build | [ ] |
| 9 | File upload validation | Uploads reject files over ~10MB or of the wrong type (PDF for scorecard, .xlsx for questionnaire) with a clear inline error | [ ] |
| 10 | Email failure is handled gracefully | If the Netlify Function fails to send, the supplier sees an error message, not a false confirmation | [ ] |
| 11 | Tool deploys and is accessible | Live URL loads correctly on desktop and mobile | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

### Pre-build steps — complete before opening Claude Code
- [ ] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] GitHub repo created by the builder (not yet done)
- [ ] product-spec.md uploaded to the GitHub repo root
- [ ] CLAUDE.md uploaded to the GitHub repo root
- [ ] PROGRESS.md uploaded to the GitHub repo root
- [ ] Resend account created (API key needed — not yet done)
- [ ] Netlify connected — skip manual step since Netlify MCP is active

### Tier 1 — build session
- [ ] Open Claude Code in the project folder (GitHub repo connected to Netlify)
- [ ] Claude Code runs First Session Setup: creates docs/, moves reference files
- [ ] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [ ] Claude Code builds the tool
- [ ] Test locally before deploying
- [ ] Claude Code sets Netlify environment variables (Resend key) and deploys automatically (Netlify MCP active)

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Should a formal GDPR consent checkbox be added before this tool is ever used with real (non-exercise) supplier data? | Builder | No — explicitly deferred for this course build, but flagged for before any real-world use |
| Is 10MB an acceptable upload size limit for both file types? | Builder | No — sensible default, can be adjusted post-build |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | September 6, 2026 | Initial interactive build design: Tier 2 with Supabase, EcoVadis PDF upload, Excel re-upload, online questionnaire with save/resume, team email notifications with links, weekly reminders until 30 Sept 2026. |
| v1.1 | September 6, 2026 | Simplified to Tier 1 (session-only, D2) for this course exercise: removed Supabase, save/resume, weekly reminders, and the read-only answers page. Submissions are emailed directly to the team — file attachments for the EcoVadis and Excel paths, an auto-generated PDF for the online questionnaire path. Persistence, resume, and reminders deferred to a future Phase 2. |

---

*This spec is written for Claude Code. It assumes zero prior context.*
