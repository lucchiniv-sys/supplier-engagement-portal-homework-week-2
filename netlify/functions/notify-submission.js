// The Corporate — Supplier Sustainability Portal
// Email arm: forwards a supplier's submission to the team, with the appropriate
// attachment (uploaded file, or a generated PDF for the online questionnaire path).
// Nothing received here is written to disk or any storage — it lives only for the
// duration of this invocation.

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const RESEND_API_URL = 'https://api.resend.com/emails';
const TEAM_EMAIL = 'sustainability@thecorporate.com';
// Resend's shared test sender. Once a sending domain is verified in Resend, update
// this to an address on that domain so delivery isn't limited to sandbox rules.
const FROM_ADDRESS = 'The Corporate Supplier Portal <onboarding@resend.dev>';
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const PATH_LABELS = {
  ecovadis: 'the EcoVadis scorecard',
  excel_reupload: 'the completed Excel questionnaire',
  online: 'the online sustainability questionnaire'
};

// Duplicated from index.html's inline script: the static site has no build step /
// module bundler to share this data with the browser, so the field list (names,
// labels, section order) is kept in sync by hand in both places.
const ONLINE_SECTIONS = [
  {
    title: 'S2 — Climate & Decarbonisation (E1)',
    fields: [
      { name: 'scope1_emissions_tco2e', label: 'Scope 1 emissions (tCO2e)' },
      { name: 'scope2_emissions_tco2e_market_based', label: 'Scope 2 emissions, market-based (tCO2e)' },
      { name: 'scope2_verification_method', label: 'Scope 2 verification method' },
      { name: 'scope3_emissions_tco2e', label: 'Scope 3 emissions (tCO2e)' },
      { name: 'scope3_categories_included', label: 'Scope 3 categories included' },
      { name: 'sbti_target', label: 'Has an SBTi-validated target' },
      { name: 'decarbonisation_projects', label: 'Top 3 decarbonisation projects, next 24 months' },
      { name: 'reduction_barriers', label: 'Barriers to a 50% reduction by 2030' }
    ]
  },
  {
    title: 'S3 — Pollution & PFAS (E2)',
    fields: [
      { name: 'substances_of_concern_kg', label: 'REACH/SVHC substances of concern (kg)' },
      { name: 'pfas_present', label: 'Products/processes contain PFAS' },
      { name: 'pfas_substitution_roadmap', label: 'PFAS substitution roadmap' },
      { name: 'wastewater_treatment', label: 'Wastewater treatment process' }
    ]
  },
  {
    title: 'S4 — Water (E3)',
    fields: [
      { name: 'water_withdrawal_m3', label: 'Water withdrawal (m³)' },
      { name: 'water_source', label: 'Water source' },
      { name: 'high_water_stress_region', label: 'Primary facility in a high-water-stress region' },
      { name: 'water_saving_projects', label: 'Water-saving / recycling initiatives' },
      { name: 'drought_contingency_plan', label: 'Drought contingency plan' }
    ]
  },
  {
    title: 'S5 — Circular Economy & Waste (E5)',
    fields: [
      { name: 'waste_generated_tonnes', label: 'Waste generated (tonnes)' },
      { name: 'waste_breakdown', label: 'Waste breakdown' },
      { name: 'pcr_content_percent', label: 'Post-consumer recycled content (%)' },
      { name: 'circularity_in_components', label: 'Circularity approach for components supplied' },
      { name: 'zero_waste_strategy', label: 'Zero Waste to Landfill strategy' }
    ]
  },
  {
    title: 'S6 — Biodiversity (E4)',
    fields: [
      { name: 'protected_area_proximity', label: 'Site within/adjacent to a protected area' },
      { name: 'biodiversity_initiatives', label: 'Biodiversity initiatives taken' },
      { name: 'biodiversity_impact_assessment', label: 'TNFD or equivalent assessment status' }
    ]
  },
  {
    title: 'S7 — Social, Labour & Governance (S2, G1)',
    fields: [
      { name: 'human_rights_policy', label: 'Formal Human Rights Policy exists' },
      { name: 'human_rights_due_diligence', label: 'Due diligence conducted in last 24 months' },
      { name: 'grievance_mechanism', label: 'Grievance mechanism — description and numbers filed/resolved' },
      { name: 'conflict_minerals_policy', label: 'Verified 3TG conflict minerals policy in place' },
      { name: 'code_of_conduct_monitoring', label: 'How compliance is monitored, including audits' }
    ]
  }
];

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return respond(405, { ok: false, error: 'Method not allowed.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return respond(400, { ok: false, error: 'Invalid request body.' });
  }

  const { path, identity, file, answers } = payload;

  if (!path || !PATH_LABELS[path]) {
    return respond(400, { ok: false, error: 'Unknown submission path.' });
  }
  if (!identity || !identity.legal_name || !identity.contact_name || !identity.contact_email) {
    return respond(400, { ok: false, error: 'Missing required contact details.' });
  }
  if ((path === 'ecovadis' || path === 'excel_reupload')) {
    if (!file || !file.base64) {
      return respond(400, { ok: false, error: 'Missing file attachment.' });
    }
    if (Buffer.byteLength(file.base64, 'base64') > MAX_FILE_BYTES) {
      return respond(400, { ok: false, error: 'File exceeds the 10MB limit.' });
    }
  }
  if (path === 'online' && !answers) {
    return respond(400, { ok: false, error: 'Missing questionnaire answers.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured.');
    return respond(500, { ok: false, error: 'Email service is not configured.' });
  }

  let attachment;
  try {
    if (path === 'online') {
      const pdfBase64 = await buildQuestionnairePdf(identity, answers);
      attachment = { filename: sanitizeFilename(identity.legal_name) + '-sustainability-questionnaire.pdf', content: pdfBase64 };
    } else {
      const fallbackName = path === 'ecovadis' ? 'ecovadis-scorecard.pdf' : 'questionnaire.xlsx';
      attachment = { filename: file.name || fallbackName, content: file.base64 };
    }
  } catch (err) {
    console.error('Attachment preparation failed:', err);
    return respond(500, { ok: false, error: 'Could not prepare the submission for sending.' });
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TEAM_EMAIL],
        reply_to: identity.contact_email,
        subject: identity.legal_name + ' has submitted ' + PATH_LABELS[path],
        html: buildEmailHtml(identity, path),
        attachments: [attachment]
      })
    });

    if (!res.ok) {
      const errText = await res.text().catch(function () { return ''; });
      console.error('Resend API error:', res.status, errText);
      return respond(502, { ok: false, error: 'The notification email could not be sent.' });
    }

    return respond(200, { ok: true });
  } catch (err) {
    console.error('Failed to reach email service:', err);
    return respond(502, { ok: false, error: 'The notification email could not be sent.' });
  }
};

function respond(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function sanitizeFilename(name) {
  return String(name || 'supplier').replace(/[^a-z0-9\-_]+/gi, '-').slice(0, 60);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function buildEmailHtml(identity, path) {
  return (
    '<p>' + escapeHtml(identity.legal_name) + ' has submitted ' + PATH_LABELS[path] + '.</p>' +
    '<p><strong>Contact:</strong> ' + escapeHtml(identity.contact_name) + ', ' + escapeHtml(identity.contact_title) + '<br>' +
    '<strong>Email:</strong> ' + escapeHtml(identity.contact_email) + '<br>' +
    '<strong>Registered country:</strong> ' + escapeHtml(identity.registered_country) + '</p>'
  );
}

async function buildQuestionnairePdf(identity, answers) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const lineHeight = 14;
  const maxWidth = pageWidth - margin * 2;

  let page = doc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;

  function newPageIfNeeded(space) {
    if (cursorY - space < margin + 30) {
      page = doc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - margin;
    }
  }

  function drawWrapped(text, opts) {
    const size = (opts && opts.size) || 10;
    const useFont = (opts && opts.useFont) || font;
    const color = (opts && opts.color) || rgb(0, 0, 0);
    const gapAfter = opts && opts.gapAfter !== undefined ? opts.gapAfter : 6;

    const words = String(text || '').split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(function (word) {
      const test = line ? line + ' ' + word : word;
      if (useFont.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);

    lines.forEach(function (l) {
      newPageIfNeeded(lineHeight);
      page.drawText(l, { x: margin, y: cursorY, size: size, font: useFont, color: color });
      cursorY -= lineHeight;
    });
    cursorY -= gapAfter;
  }

  drawWrapped('The Corporate — Supplier Sustainability Questionnaire', { size: 16, useFont: boldFont, gapAfter: 4 });
  drawWrapped(identity.legal_name || '', { size: 12, useFont: boldFont, gapAfter: 2 });
  drawWrapped('Submitted: ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), {
    size: 10,
    color: rgb(0.4, 0.4, 0.4),
    gapAfter: 16
  });

  ONLINE_SECTIONS.forEach(function (section) {
    newPageIfNeeded(30);
    drawWrapped(section.title, { size: 13, useFont: boldFont, gapAfter: 8 });
    section.fields.forEach(function (f) {
      const value = answers[f.name];
      if (value === undefined) return;
      drawWrapped(f.label, { size: 10, useFont: boldFont, gapAfter: 2 });
      drawWrapped(value || 'Not Available', { size: 10, gapAfter: 10 });
    });
  });

  const allPages = doc.getPages();
  allPages.forEach(function (p, idx) {
    const footerText = [identity.contact_name, identity.contact_title, identity.contact_email].filter(Boolean).join(' · ');
    p.drawText(footerText, { x: margin, y: 24, size: 8, font: font, color: rgb(0.4, 0.4, 0.4) });
    const pageLabel = 'Page ' + (idx + 1) + ' of ' + allPages.length;
    const pageLabelWidth = font.widthOfTextAtSize(pageLabel, 8);
    p.drawText(pageLabel, { x: pageWidth - margin - pageLabelWidth, y: 24, size: 8, font: font, color: rgb(0.4, 0.4, 0.4) });
  });

  const bytes = await doc.save();
  return Buffer.from(bytes).toString('base64');
}
