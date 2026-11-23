// node --env-file=.env.local scripts/hubspot-forms.mjs
//
// Makes the site's forms in HubSpot (Marketing > Forms), one for each form on
// the site, so each form's entries stay separate there. The site sends every
// entry to its form's own HubSpot form (src/app/api/contact/hubspot.ts).
//
// Needs HUBSPOT_ACCESS_TOKEN with the `forms` scope. A form that already
// exists (by its name) is left as it is. It prints HUBSPOT_FORMS, with each
// form's ID, for src/app/api/contact/hubspot.ts. Run it again only for a new
// HubSpot account, or after a form there was deleted.

const API = 'https://api.hubapi.com/marketing/v3/forms';
const token = process.env.HUBSPOT_ACCESS_TOKEN;
if (!token) {
  console.error('HUBSPOT_ACCESS_TOKEN is not set. Run: node --env-file=.env.local scripts/hubspot-forms.mjs');
  process.exit(1);
}
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

/** A contact field ("0-1" is HubSpot's ID for contacts). */
const field = (name, label, fieldType, extra = {}) => ({
  objectTypeId: '0-1',
  name,
  label,
  fieldType,
  required: false,
  hidden: false,
  dependentFields: [],
  ...extra,
});
// No blocked domains: many leads write from Gmail or Yahoo.
const EMAIL = field('email', 'Email', 'email', { required: true, validation: { blockedEmailDomains: [], useDefaultBlockList: false } });
const ANSWERS = [
  EMAIL,
  field('firstname', 'First name', 'single_line_text'),
  field('lastname', 'Last name', 'single_line_text'),
  // The site's own checks: at least 7 digits (the brief, the bio call request).
  field('phone', 'Phone number', 'phone', { useCountryCodeSelect: false, validation: { minAllowedDigits: 7, maxAllowedDigits: 20 } }),
  // Every other answer, one per line.
  field('message', 'Message', 'multi_line_text'),
];

/** [the form's name on the site (src/components/convert/lead.ts), its name in HubSpot, its fields] */
const FORMS = [
  ['project_brief', 'Website: Project brief', ANSWERS],
  ['referral', 'Website: Referral', ANSWERS],
  ['estimate_email', 'Website: Estimate email', ANSWERS],
  ['regional_inquiry_nigeria', 'Website: Nigeria inquiry', ANSWERS],
  ['regional_inquiry_jamaica', 'Website: Jamaica inquiry', ANSWERS],
  ['bio_call_request', 'bio.mapltech.com: Call request', ANSWERS],
  ['careers_application', 'Careers: Job application', ANSWERS],
  ['talent_list', 'Careers: Talent list', ANSWERS],
  ['newsletter', 'Website: Newsletter', [EMAIL]],
];

function definition(name, fields) {
  const now = new Date().toISOString();
  return {
    formType: 'hubspot',
    name,
    createdAt: now,
    updatedAt: now,
    archived: false,
    fieldGroups: fields.map((one) => ({ groupType: 'default_group', richTextType: 'text', fields: [one] })),
    configuration: {
      language: 'en',
      cloneable: true,
      editable: true,
      archivable: true,
      // The site checks reCAPTCHA itself, and HubSpot refuses entries sent to a form with its own check on.
      recaptchaEnabled: false,
      // The site emails contact@mapltech.com itself.
      notifyContactOwner: false,
      notifyRecipients: [],
      createNewContactForNewEmail: true,
      prePopulateKnownValues: false,
      allowLinkToResetKnownValues: false,
      postSubmitAction: { type: 'thank_you', value: 'Thanks. We got it.' },
      // No lifecycle stage: on MAPL TECH's HubSpot plan the Forms API refuses one
      // ("Lifecycle stage provided were not valid", Nov 23 2026), even 'lead'.
      lifecycleStages: [],
    },
    // Required by HubSpot; nobody sees these forms, the site has its own.
    displayOptions: {
      renderRawHtml: false,
      theme: 'default_style',
      submitButtonText: 'Send',
      style: {
        fontFamily: 'arial, helvetica, sans-serif',
        backgroundWidth: '100%',
        labelTextColor: '#33475b',
        labelTextSize: '14px',
        helpTextColor: '#7c98b6',
        helpTextSize: '11px',
        legalConsentTextColor: '#33475b',
        legalConsentTextSize: '14px',
        submitColor: '#ff7a59',
        submitAlignment: 'left',
        submitFontColor: '#ffffff',
        submitSize: '12px',
      },
    },
    legalConsentOptions: { type: 'none' },
  };
}

/** The account's forms, name → ID. */
async function existingForms() {
  const byName = new Map();
  let after;
  do {
    const res = await fetch(`${API}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`, { headers });
    if (!res.ok) throw new Error(`HubSpot refused the list of forms (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const page = await res.json();
    for (const form of page.results ?? []) byName.set(form.name, form.id);
    after = page.paging?.next?.after;
  } while (after);
  return byName;
}

const have = await existingForms();
const ids = {};
for (const [key, name, fields] of FORMS) {
  if (have.has(name)) {
    ids[key] = have.get(name);
    console.error(`kept:    ${name}`);
    continue;
  }
  const res = await fetch(API, { method: 'POST', headers, body: JSON.stringify(definition(name, fields)) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HubSpot refused "${name}" (${res.status}): ${JSON.stringify(body).slice(0, 400)}`);
  ids[key] = body.id;
  console.error(`created: ${name}`);
}

console.log('export const HUBSPOT_FORMS: Record<HubSpotForm, { id: string; name: string }> = {');
for (const [key, name] of FORMS) console.log(`  ${key}: { id: '${ids[key]}', name: '${name}' },`);
console.log('};');
