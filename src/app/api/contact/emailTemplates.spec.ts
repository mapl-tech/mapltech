import { describe, expect, it } from 'vitest';
import { CONTACT_TO } from './email';
import { EMAIL_COLORS, FORM_COPY, VISITOR_FROM, firstName, hubspotStatus, inboxEmail, visitorEmail } from './emailTemplates';
import { HUBSPOT_FORMS, type HubSpotForm } from './hubspot';

const FORMS = Object.keys(FORM_COPY) as HubSpotForm[];
const SALES: HubSpotForm[] = ['project_brief', 'estimate_email', 'regional_inquiry_nigeria', 'regional_inquiry_jamaica', 'bio_call_request'];
const ok = { ok: true } as const;

const inbox = (form: HubSpotForm, crm: Parameters<typeof inboxEmail>[0]['crm'] = ok) =>
  inboxEmail({
    form,
    subject: 'New Contact: Website - from Chidi Okafor',
    who: 'Chidi Okafor',
    email: 'chidi@example.com',
    rows: [
      { label: 'Name', value: 'Chidi Okafor' },
      { label: 'Email', value: 'chidi@example.com', href: 'mailto:chidi@example.com' },
      { label: 'Message', value: 'Line one\nLine two' },
    ],
    crm,
  });

/** Every word a visitor can read in their email, for each form and each variant. */
const visitorWords = (form: HubSpotForm) => {
  const copy = FORM_COPY[form];
  const variants = [
    { first: 'Ada', phone: false, resume: false, email: 'a@b.co' },
    { first: '', phone: true, resume: true, email: 'a@b.co' },
  ];
  return [
    copy.subject,
    copy.preheader,
    copy.more,
    copy.reason,
    copy.cta.intro,
    copy.cta.label,
    ...variants.flatMap((v) => [copy.heading(v), copy.lead(v), ...(copy.steps?.(v) ?? [])]),
  ];
};

/** WCAG contrast of two #RRGGBB colours. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every email layout: each form's two emails, and the inbox email when HubSpot missed the entry. */
const everyHtml = () => [
  ...FORMS.flatMap((form) => [inbox(form).html, visitorEmail({ form, to: 'ada@example.com', name: 'Ada King' }).html]),
  inbox('referral', { ok: false, problem: 'HubSpot did not answer' }).html,
];

describe('the brand, on every email', () => {
  for (const form of FORMS) {
    it(`${form}: the logo, one heading, the company line, light with a dark-mode twin, and no "Inc."`, () => {
      for (const { html } of [inbox(form), visitorEmail({ form, to: 'ada@example.com', name: 'Ada King' })]) {
        expect(html.startsWith('<!doctype html>')).toBe(true);
        expect(html).toContain('<html lang="en"');
        expect(html).toContain('role="article" aria-roledescription="email"');
        expect(html).toContain('<meta name="color-scheme" content="light dark">');
        expect(html).toContain('src="https://mapltech.com/email/mapl-tech-logo-black.png" width="148" height="33" alt="MAPL TECH"');
        // The white logo waits, hidden, for a mail app in dark mode; Outlook on Windows never gets it.
        expect(html).toContain(
          '<!--[if !mso]><!--><div class="logo-dark" style="display:none;max-height:0;overflow:hidden;"><img class="c-fg" src="https://mapltech.com/email/mapl-tech-logo.png" width="148" height="33" alt="MAPL TECH"',
        );
        expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
        expect(html).toContain(`© ${new Date().getFullYear()} MAPL TECH <span style="white-space:nowrap;">Canada · Nigeria · Jamaica</span>`);
        expect(html).not.toContain('Inc.');
      }
    });
  }

  it('keeps every word at 7:1 or more on what it sits on, light and dark (WCAG AAA)', () => {
    const { LIGHT, DARK, FILL } = EMAIL_COLORS;
    // Text on the card; the logo's words (pictures off), the footnote and the company line on the ground; the notice.
    const pairs = [
      ['fg', 'card'],
      ['body', 'card'],
      ['muted', 'card'],
      ['link', 'card'],
      ['fg', 'ground'],
      ['muted', 'ground'],
      ['fg', 'raised'],
    ] as const;
    for (const palette of [LIGHT, DARK]) {
      for (const [text, surface] of pairs) expect(contrast(palette[text], palette[surface]), `${text} on ${surface}`).toBeGreaterThanOrEqual(7);
    }
    for (const fill of Object.values(FILL)) expect(contrast('#FFFFFF', fill)).toBeGreaterThanOrEqual(7);
  });

  it('recolours everything that carries a colour when a mail app is in dark mode', () => {
    const { LIGHT } = EMAIL_COLORS;
    // Each light colour as an inline style writes it, and the class that recolours it. A colour
    // the palette uses twice (ink for fg and body, paper for the ground and the card) may carry
    // either class.
    const roles: [string, string][] = [
      [`color:${LIGHT.fg};`, 'c-fg'],
      [`color:${LIGHT.body};`, 'c-body'],
      [`color:${LIGHT.muted};`, 'c-muted'],
      [`color:${LIGHT.link};`, 'c-link'],
      [`background:${LIGHT.ground};`, 's-ground'],
      [`background:${LIGHT.card};`, 'card'],
      [`background:${LIGHT.raised};`, 's-raised'],
      [`background:${LIGHT.line};`, 's-line'],
      [`solid ${LIGHT.line};`, 'b-line'],
      [`solid ${LIGHT.line};`, 'card'],
    ];
    const owners = new Map<string, string[]>();
    for (const [declaration, owner] of roles) owners.set(declaration, [...(owners.get(declaration) ?? []), owner]);
    for (const html of everyHtml()) {
      const [head, body] = html.split('</head>');
      const dark = head.slice(head.indexOf('@media (prefers-color-scheme:dark){'));
      for (const [, attributes] of body.matchAll(/<[a-z][a-z0-9]*\b([^>]*)>/g)) {
        const style = attributes.match(/style="([^"]*)"/)?.[1] ?? '';
        const classes = attributes.match(/class="([^"]*)"/)?.[1] ?? '';
        for (const [declaration, allowed] of owners) {
          if (style.includes(declaration)) {
            expect(allowed.some((owner) => classes.split(' ').includes(owner)), `${declaration} in <…${attributes.slice(0, 60)}>`).toBe(true);
          }
        }
        // And every colour class used has its dark rule.
        for (const name of classes.split(' ').filter((c) => /^(c|s|b)-/.test(c) || c === 'card')) expect(dark).toContain(`.${name}{`);
      }
    }
  });

  it('gives the visitor one button, and the team a reply button on every form but the newsletter', () => {
    for (const form of FORMS) {
      expect(visitorEmail({ form, to: 'ada@example.com' }).html.match(/class="btn-link"/g)).toHaveLength(1);
      expect(inbox(form).html.match(/class="btn-link"/g) ?? []).toHaveLength(form === 'newsletter' ? 0 : 1);
    }
  });
});

describe('the tone', () => {
  it('stays calm and plain in every visitor email: no exclamation marks, hype, NDA lines or straight apostrophes', () => {
    for (const form of FORMS) {
      for (const words of visitorWords(form)) {
        expect(words).not.toMatch(/!/);
        expect(words).not.toMatch(/'/);
        expect(words).not.toMatch(/\b(NDA|Inc\.|leverage|seamless|robust|cutting-edge|unlock|empower|elevate|revolution\w*|excited|thrilled|amazing)\b/i);
      }
    }
  });

  it('keeps every sales form’s promise: a reply within 24 hours, said in the subject line’s preview', () => {
    for (const form of SALES) {
      expect(FORM_COPY[form].preheader).toMatch(/within 24 hours/);
      expect(FORM_COPY[form].promise).toMatch(/within 24 hours/);
    }
  });

  it('tells every visitor how to add something or leave: a reply reaches the inbox', () => {
    for (const form of FORMS) expect(FORM_COPY[form].more).toMatch(/Reply (to this email|with)/);
  });
});

describe('firstName', () => {
  it('keeps a first name that is plainly a name, in any script', () => {
    expect(firstName('Chidi Okafor')).toBe('Chidi');
    expect(firstName('  O’Brien ')).toBe('O’Brien');
    expect(firstName('Jean-Luc Picard')).toBe('Jean-Luc');
    expect(firstName('José')).toBe('José');
    expect(firstName('Adébáyọ̀ Ọ')).toBe('Adébáyọ̀');
  });

  it('gives no greeting for anything that could carry a link or a pitch', () => {
    for (const name of ['http://spam.example', 'spam.example', 'Win$', '<b>Ada</b>', '@ada', '', undefined, 'A'.repeat(31)]) {
      expect(firstName(name)).toBe('');
    }
  });
});

describe('the visitor’s confirmation', () => {
  it('comes from MAPL TECH, replies reach the inbox, and the words are the form’s own', () => {
    const email = visitorEmail({ form: 'bio_call_request', to: 'ada@example.com', name: 'Ada King' });
    expect(email).toMatchObject({ to: 'ada@example.com', from: VISITOR_FROM, replyTo: CONTACT_TO, subject: 'Your call request is in' });
    expect(email.text).toContain('Thanks, Ada. Your call request is in.');
    expect(email.text).toContain('What happens next\n1. We email you within 24 hours to set a time.\n2. We talk for 20 minutes.');
    expect(email.html).toContain('<ol class="steps c-fg"');
    expect(email.text).toContain('See the work: https://mapltech.com/our-work');
  });

  it('greets without a name when the name is not plainly one, and never shows it', () => {
    const email = visitorEmail({ form: 'project_brief', to: 'ada@example.com', name: '<script>alert(1)</script>' });
    expect(email.text).toContain('Thanks. We have your brief.');
    for (const part of [email.html, email.text, email.subject]) {
      expect(part).not.toContain('alert(1)');
      expect(part).not.toMatch(/<\/?script/);
    }
  });

  it('follows the visitor’s choices: a call instead of an email, a resume', () => {
    expect(visitorEmail({ form: 'project_brief', to: 'a@b.co', phone: true }).text).toContain('1. We call you within 24 hours.');
    expect(visitorEmail({ form: 'project_brief', to: 'a@b.co' }).text).toContain('1. We reply by email within 24 hours.');
    expect(visitorEmail({ form: 'talent_list', to: 'a@b.co', resume: true }).text).toContain('with your resume to hand.');
    expect(visitorEmail({ form: 'careers_application', to: 'a@b.co' }).text).toContain('Your application is with us.');
  });

  it('gives the newsletter an unsubscribe header and names the address, escaped', () => {
    const email = visitorEmail({ form: 'newsletter', to: "o'brien&co@example.com" });
    expect(email.headers).toEqual({ 'List-Unsubscribe': '<mailto:contact@mapltech.com?subject=unsubscribe>' });
    expect(email.html).toContain('o&#39;brien&amp;co@example.com');
    expect(email.html).not.toContain("o'brien&co");
  });
});

describe('the inbox email', () => {
  it('says who sent which form, the promise to keep, every answer escaped, and where HubSpot has it', () => {
    const email = inboxEmail({
      form: 'project_brief',
      subject: 'New Contact: Website - from <b>Chidi</b>',
      who: '<b>Chidi</b>',
      email: 'chidi@example.com',
      rows: [
        { label: 'Message', value: '<script>x</script>\nnext & last' },
        { label: 'Portfolio', value: 'javascript:alert(1)', href: 'javascript:alert(1)' },
        { label: 'Email', value: 'chidi@example.com', href: 'mailto:chidi@example.com' },
      ],
      crm: ok,
    });
    expect(email.replyTo).toBe('chidi@example.com');
    expect(email.html).toContain('&lt;b&gt;Chidi&lt;/b&gt; sent a project brief');
    expect(email.html).toContain('They were told we reply within 24 hours.');
    expect(email.html).toContain('&lt;script&gt;x&lt;/script&gt;<br>next &amp; last');
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('href="javascript:');
    expect(email.html).toContain('href="mailto:chidi@example.com"');
    expect(email.html).toContain(`Saved in HubSpot: Marketing › Forms › ${HUBSPOT_FORMS.project_brief.name}.`);
    expect(email.html).toContain('href="mailto:chidi@example.com?subject=Re%3A%20New%20Contact%3A%20Website%20-%20from%20%3Cb%3EChidi%3C%2Fb%3E"');
    expect(email.html).toContain('>Reply by email</a>');
    expect(email.text).toContain('Message:\n<script>x</script>\nnext & last');
  });

  it('names the visitor on the reply button when the name is plainly one', () => {
    expect(inbox('bio_call_request').html).toContain('>Reply to Chidi</a>');
  });

  it('says plainly when HubSpot missed the entry, in the preview line too', () => {
    const email = inbox('referral', { ok: false, problem: 'HubSpot did not answer' });
    const line = 'Not saved in HubSpot: HubSpot did not answer. Add this entry to HubSpot by hand.';
    expect(email.text).toContain(line);
    expect(email.html).toContain(line);
    expect(email.html).toContain('Not saved in HubSpot.');
    expect(hubspotStatus('referral', ok).text).toBe('Saved in HubSpot: Marketing › Forms › Website: Referral.');
  });

  it('carries the resume to the inbox', () => {
    const attachments = [{ filename: 'cv.pdf', content: 'JVBERi0=', mimetype: 'application/pdf' }];
    expect(inboxEmail({ form: 'careers_application', subject: 's', who: 'Ada', email: 'a@b.co', rows: [], crm: ok, attachments }).attachments).toEqual(attachments);
  });
});
