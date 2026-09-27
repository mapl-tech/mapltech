import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import Accordion, { type AccordionItem } from '@/components/ui/Accordion';
import { pageGraph } from '@/lib/schema';
import Breadcrumbs from '@/components/convert/Breadcrumbs';
import shared from '@/app/convert.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: 'https://mapltech.com/privacy' },
  description:
    'MAPL TECH Privacy Policy. Learn how we collect, use, and protect your personal information.',
};

const PATH = '/privacy';
const LAST_UPDATED = { iso: '2026-03-01', label: 'March 1, 2026' };

// Section text is the current policy, unchanged; each section is a native <details>.
const sections: AccordionItem[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: (
      <div className={shared.legalBody}>
        <p>
          MAPL TECH (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
          website at mapltech.com or engage with our services.
        </p>
      </div>
    ),
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    content: (
      <div className={shared.legalBody}>
        <h3>Personal Information</h3>
        <p>We may collect personal information that you voluntarily provide when you:</p>
        <ul>
          <li>Fill out a contact form or request a consultation</li>
          <li>Subscribe to our newsletter</li>
          <li>Apply for a career opportunity</li>
          <li>Communicate with us via email or phone</li>
        </ul>
        <p>
          This may include your name, email address, phone number, company name, job title, and any other
          information you choose to provide.
        </p>
        <h3>Automatically Collected Information</h3>
        <p>
          When you visit our website, we may automatically collect certain information, including your IP address,
          browser type, operating system, referring URLs, pages viewed, and the dates and times of your visits. We
          use analytics tools such as Google Analytics and Hotjar to understand how visitors interact with our site.
        </p>
      </div>
    ),
  },
  {
    id: 'how-we-use-your-information',
    title: '3. How We Use Your Information',
    content: (
      <div className={shared.legalBody}>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to your inquiries and provide requested services</li>
          <li>Send newsletters and marketing communications (with your consent)</li>
          <li>Improve our website, services, and user experience</li>
          <li>Process job applications</li>
          <li>Comply with legal obligations</li>
          <li>Protect against fraudulent or unauthorized activity</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'information-sharing',
    title: '4. Information Sharing',
    content: (
      <div className={shared.legalBody}>
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
      </div>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies and Tracking Technologies',
    content: (
      <div className={shared.legalBody}>
        <p>
          Our website uses cookies and similar tracking technologies to enhance your experience. Cookies are small
          data files stored on your device. You can control cookie preferences through your browser settings.
          Disabling cookies may affect certain website functionality.
        </p>
      </div>
    ),
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    content: (
      <div className={shared.legalBody}>
        <p>
          We implement reasonable technical and organizational measures to protect your personal information from
          unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the
          internet or electronic storage is 100% secure.
        </p>
      </div>
    ),
  },
  {
    id: 'data-retention',
    title: '7. Data Retention',
    content: (
      <div className={shared.legalBody}>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes for which it was
          collected, comply with legal obligations, resolve disputes, and enforce our agreements.
        </p>
      </div>
    ),
  },
  {
    id: 'your-rights',
    title: '8. Your Rights',
    content: (
      <div className={shared.legalBody}>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal information</li>
          <li>Opt out of marketing communications</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at <a href="mailto:contact@mapltech.com">contact@mapltech.com</a>.
        </p>
      </div>
    ),
  },
  {
    id: 'third-party-links',
    title: '9. Third-Party Links',
    content: (
      <div className={shared.legalBody}>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the privacy practices or
          content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.
        </p>
      </div>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "10. Children's Privacy",
    content: (
      <div className={shared.legalBody}>
        <p>
          Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal
          information from children. If we become aware that we have collected information from a child, we will
          take steps to delete it promptly.
        </p>
      </div>
    ),
  },
  {
    id: 'international-transfers',
    title: '11. International Data Transfers',
    content: (
      <div className={shared.legalBody}>
        <p>
          MAPL TECH operates across Canada, Nigeria, and Jamaica. Your information may be transferred to and processed
          in countries other than your country of residence. We take appropriate measures to ensure your data is
          protected in accordance with this Privacy Policy.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    title: '12. Changes to This Policy',
    content: (
      <div className={shared.legalBody}>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
          updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: '13. Contact Us',
    content: (
      <div className={shared.legalBody}>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p>
          <strong>MAPL TECH</strong>
          <br />
          Email: <a href="mailto:contact@mapltech.com">contact@mapltech.com</a>
          <br />
          Phone: <a href="tel:+16473756724">+1 (647) 375-6724</a>
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={pageGraph({ path: PATH, name: 'Privacy Policy', description: metadata.description ?? undefined })} />

      <header className={shared.hero}>
        <div className={shared.heroInner}>
          <Breadcrumbs items={[{ name: 'Privacy Policy' }]} />
          <p className="eyebrow">Privacy Policy</p>
          <h1 className={shared.heroTitle}>Privacy Policy</h1>
          <p className={shared.legalIntro}>
            Last updated: <time dateTime={LAST_UPDATED.iso}>{LAST_UPDATED.label}</time>
          </p>
        </div>
      </header>

      <section className={shared.sectionTight} aria-label="Privacy policy sections">
        <div className={shared.innerProse}>
          <Accordion items={sections} multiple defaultOpen={0} />
        </div>
      </section>
    </>
  );
}
