import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import JsonLd from '@/components/seo/JsonLd';
import { pageGraph } from '@/lib/schema';
import { absoluteUrl } from '@/config/routes';
import LegalDocument, { legalMailto, type LegalFact, type LegalSection } from '@/components/editorial/LegalDocument';

/**
 * /privacy. The policy text is unchanged from the current policy (headings set
 * in sentence case); "The short version" only restates what the sections say,
 * each fact linked to its section. Layout: src/components/editorial/LegalDocument.
 */

const PATH = '/privacy';
/** The page's task (using a right) and its general questions: one subject and prompt each, for every link. */
const REQUEST = {
  label: 'Email a privacy request',
  subject: 'Privacy request',
  section: 'your-rights',
  rights: 'access, correction, deletion, opting out of marketing or withdrawing consent',
};
const QUESTION_SUBJECT = 'Privacy question';
const LAST_UPDATED = { iso: '2026-03-01', label: 'March 1, 2026' };
const DESCRIPTION =
  'How MAPL TECH collects, uses, shares and protects personal information from mapltech.com and our services, with a plain summary of your rights up front.';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    images: [OG_IMAGE],
    type: 'website',
    title: 'Privacy policy | MAPL TECH',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    siteName: 'MAPL TECH',
  },
};

const FACTS: LegalFact[] = [
  {
    label: 'What we collect',
    text: 'What you give us through forms, email or phone (such as your name, email, phone number and company), plus usage data like your IP address, browser and the pages you view.',
    section: 'information-we-collect',
  },
  {
    label: 'How we use it',
    text: 'To answer your inquiries and provide services, send newsletters if you consent, improve the site, process job applications and meet legal obligations.',
    section: 'how-we-use-your-information',
  },
  {
    label: 'Selling and sharing',
    text: 'We do not sell, trade or rent your personal information. We may share it with service providers who help run our business, when the law requires it, or in a merger, acquisition or sale of assets.',
    section: 'information-sharing',
  },
  {
    label: 'Your rights',
    text: 'Depending on where you live, you can ask to access, correct or delete your information, opt out of marketing and withdraw consent, by emailing contact@mapltech.com.',
    section: 'your-rights',
  },
  {
    label: 'Where it is processed',
    text: 'We operate across Canada, Nigeria and Jamaica, so your information may be processed outside your country of residence.',
    section: 'international-transfers',
  },
  {
    label: 'Cookies',
    text: 'The site uses cookies and similar tracking technologies. You control cookie preferences in your browser settings.',
    section: 'cookies',
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <p>
        MAPL TECH (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This
        Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
        at mapltech.com or engage with our services.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    content: (
      <>
        <h3>Personal information</h3>
        <p>We may collect personal information that you voluntarily provide when you:</p>
        <ul>
          <li>Fill out a contact form or request a consultation</li>
          <li>Subscribe to our newsletter</li>
          <li>Apply for a career opportunity</li>
          <li>Communicate with us via email or phone</li>
        </ul>
        <p>
          This may include your name, email address, phone number, company name, job title, and any other information
          you choose to provide.
        </p>
        <h3>Automatically collected information</h3>
        <p>
          When you visit our website, we may automatically collect certain information, including your IP address,
          browser type, operating system, referring URLs, pages viewed, and the dates and times of your visits. We use
          analytics tools such as Google Analytics and Hotjar to understand how visitors interact with our site.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-your-information',
    title: 'How we use your information',
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to your inquiries and provide requested services</li>
          <li>Send newsletters and marketing communications (with your consent)</li>
          <li>Improve our website, services, and user experience</li>
          <li>Process job applications</li>
          <li>Comply with legal obligations</li>
          <li>Protect against fraudulent or unauthorized activity</li>
        </ul>
      </>
    ),
  },
  {
    id: 'information-sharing',
    title: 'Information sharing',
    content: (
      <>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
        <ul>
          <li>
            <strong>Service providers:</strong> Third-party vendors who assist us in operating our website, conducting
            our business, or servicing you (e.g., email delivery, analytics, hosting)
          </li>
          <li>
            <strong>Legal requirements:</strong> When required by law, regulation, or legal process
          </li>
          <li>
            <strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and tracking technologies',
    content: (
      <p>
        Our website uses cookies and similar tracking technologies to enhance your experience. Cookies are small data
        files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies
        may affect certain website functionality.
      </p>
    ),
  },
  {
    id: 'data-security',
    title: 'Data security',
    content: (
      <p>
        We implement reasonable technical and organizational measures to protect your personal information from
        unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet
        or electronic storage is 100% secure.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data retention',
    content: (
      <p>
        We retain your personal information only for as long as necessary to fulfill the purposes for which it was
        collected, comply with legal obligations, resolve disputes, and enforce our agreements.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    content: (
      <>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal information</li>
          <li>Opt out of marketing communications</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{' '}
          <a href={legalMailto(REQUEST.subject, REQUEST.rights)}>contact@mapltech.com</a>.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-links',
    title: 'Third-party links',
    content: (
      <p>
        Our website may contain links to third-party websites. We are not responsible for the privacy practices or
        content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.
      </p>
    ),
  },
  {
    id: 'childrens-privacy',
    title: 'Children’s privacy',
    content: (
      <p>
        Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal
        information from children. If we become aware that we have collected information from a child, we will take
        steps to delete it promptly.
      </p>
    ),
  },
  {
    id: 'international-transfers',
    title: 'International data transfers',
    content: (
      <p>
        MAPL TECH operates across Canada, Nigeria, and Jamaica. Your information may be transferred to and processed in
        countries other than your country of residence. We take appropriate measures to ensure your data is protected in
        accordance with this Privacy Policy.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
        &quot;Last updated&quot; date. We encourage you to review this policy periodically.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    content: (
      <>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p>
          <strong>MAPL TECH</strong>
          <br />
          Email: <a href={legalMailto(QUESTION_SUBJECT)}>contact@mapltech.com</a>
          <br />
          Phone: <a href="tel:+16473756724">+1 (647) 375-6724</a>
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          name: 'Privacy policy',
          description: DESCRIPTION,
          dateModified: LAST_UPDATED.iso,
        })}
      />
      <LegalDocument
        title="Privacy policy"
        intro="How MAPL TECH collects, uses and protects personal information when you visit mapltech.com or work with us."
        lastUpdated={LAST_UPDATED}
        facts={FACTS}
        sections={SECTIONS}
        questions="Questions about your data?"
        mailSubject={QUESTION_SUBJECT}
        action={REQUEST}
        sibling={{ label: 'Read the terms of use', href: '/terms' }}
      />
    </>
  );
}
