import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import JsonLd from '@/components/seo/JsonLd';
import { pageGraph } from '@/lib/schema';
import { absoluteUrl } from '@/config/routes';
import LegalDocument, { legalMailto, type LegalFact, type LegalSection } from '@/components/editorial/LegalDocument';

/**
 * /terms. The terms text is unchanged from the current terms (headings set in
 * sentence case); "The short version" only restates what the sections say,
 * each fact linked to its section. Layout: src/components/editorial/LegalDocument.
 */

const PATH = '/terms';
/** One subject and prompt for every email link on the page. */
const QUESTION_SUBJECT = 'Question about the terms of use';
const LAST_UPDATED = { iso: '2026-03-01', label: 'March 1, 2026' };
const DESCRIPTION =
  'The terms for using mapltech.com: website content, pricing guidance, project agreements, confidentiality, liability and Ontario law, summarised up front.';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    images: [OG_IMAGE],
    type: 'website',
    title: 'Terms of use | MAPL TECH',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    siteName: 'MAPL TECH',
  },
};

const FACTS: LegalFact[] = [
  {
    label: 'What these cover',
    text: 'Your use of mapltech.com. Project work is governed by its own project agreement or statement of work, which these terms do not replace.',
    section: 'project-engagements',
  },
  {
    label: 'Prices on this site',
    text: 'General guidance that may change. Final pricing is set through scoping and written into a proposal or agreement.',
    section: 'pricing',
  },
  {
    label: 'Website content',
    text: 'Belongs to MAPL TECH or its content suppliers. Do not reproduce or reuse it without written permission.',
    section: 'intellectual-property',
  },
  {
    label: 'Confidentiality',
    text: 'Project information follows the confidentiality terms of your project agreement. General inquiries sent through the website are not confidential.',
    section: 'confidentiality',
  },
  {
    label: 'Liability',
    text: 'Total liability for any claim is limited to what you paid MAPL TECH for the specific service behind it.',
    section: 'liability',
  },
  {
    label: 'Governing law',
    text: 'The laws of Ontario, Canada. Disputes go to the courts of Ontario.',
    section: 'governing-law',
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    content: (
      <p>
        By accessing and using the MAPL TECH website (mapltech.com) and our services, you agree to be bound by these
        Terms of Use. If you do not agree to these terms, please do not use our website or services.
      </p>
    ),
  },
  {
    id: 'services',
    title: 'Description of services',
    content: (
      <p>
        MAPL TECH provides web development, automation and AI workflow setup, custom internal tools, and related
        engineering services for agencies and businesses. Our services are described in detail on our website and in
        individual project agreements.
      </p>
    ),
  },
  {
    id: 'use-of-website',
    title: 'Use of website',
    content: (
      <>
        <p>You agree to use our website only for lawful purposes and in a manner that does not:</p>
        <ul>
          <li>Violate any applicable local, national, or international law</li>
          <li>Infringe on the rights of others</li>
          <li>Interfere with or disrupt the website or its servers</li>
          <li>Attempt to gain unauthorized access to any part of the website</li>
          <li>Transmit any malicious code, viruses, or harmful data</li>
          <li>Collect or harvest personal information of other users</li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    content: (
      <>
        <p>
          All content on the MAPL TECH website, including text, graphics, logos, images, designs, and software, is the
          property of MAPL TECH or its content suppliers and is protected by applicable intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any
          content from our website without prior written permission from MAPL TECH.
        </p>
      </>
    ),
  },
  {
    id: 'project-engagements',
    title: 'Project engagements',
    content: (
      <p>
        All project engagements between MAPL TECH and clients are governed by separate project agreements or statements
        of work. These Terms of Use apply to general website usage and do not replace or override specific contractual
        agreements.
      </p>
    ),
  },
  {
    id: 'pricing',
    title: 'Pricing and payment',
    content: (
      <p>
        Pricing information displayed on our website is for general guidance only and may be subject to change. Final
        pricing is determined through individual project scoping and will be outlined in a formal proposal or agreement.
        Payment terms are specified in individual project contracts.
      </p>
    ),
  },
  {
    id: 'third-party-links',
    title: 'Third-party links',
    content: (
      <p>
        Our website may contain links to third-party websites or services. MAPL TECH does not control and is not
        responsible for the content, privacy policies, or practices of third-party sites. Accessing third-party links is
        at your own risk.
      </p>
    ),
  },
  {
    id: 'warranties',
    title: 'Disclaimer of warranties',
    content: (
      <p>
        Our website and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without
        warranties of any kind, either express or implied. MAPL TECH does not warrant that the website will be
        uninterrupted, error-free, or free of viruses or other harmful components.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    content: (
      <p>
        To the fullest extent permitted by law, MAPL TECH shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising out of or related to your use of the website or services. Our total
        liability for any claim shall not exceed the amount you paid to MAPL TECH for the specific service giving rise to
        the claim.
      </p>
    ),
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    content: (
      <p>
        You agree to indemnify and hold harmless MAPL TECH, its directors, employees, and agents from any claims,
        damages, losses, or expenses (including reasonable legal fees) arising from your use of the website or violation
        of these Terms of Use.
      </p>
    ),
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality',
    content: (
      <p>
        Any confidential information shared during the course of a project engagement will be treated in accordance with
        the confidentiality provisions of the applicable project agreement. General inquiries submitted through our
        website are not considered confidential.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    content: (
      <p>
        MAPL TECH reserves the right to terminate or restrict your access to the website at any time, without notice, for
        conduct that we believe violates these Terms of Use or is harmful to other users, us, or third parties.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    content: (
      <p>
        These Terms of Use are governed by and construed in accordance with the laws of the Province of Ontario, Canada.
        Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Ontario,
        Canada.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to terms',
    content: (
      <p>
        MAPL TECH reserves the right to modify these Terms of Use at any time. Changes will be posted on this page with
        an updated &quot;Last updated&quot; date. Your continued use of the website after changes are posted constitutes
        acceptance of the revised terms.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    content: (
      <>
        <p>If you have any questions about these Terms of Use, please contact us at:</p>
        <p>
          <strong>MAPL TECH</strong>
          <br />
          Email: <a href={legalMailto(QUESTION_SUBJECT)}>contact@mapltech.com</a>
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          name: 'Terms of use',
          description: DESCRIPTION,
          dateModified: LAST_UPDATED.iso,
        })}
      />
      <LegalDocument
        title="Terms of use"
        intro="The terms for using mapltech.com. Project work is covered by its own agreement."
        lastUpdated={LAST_UPDATED}
        facts={FACTS}
        sections={SECTIONS}
        questions="Questions about these terms?"
        mailSubject={QUESTION_SUBJECT}
        sibling={{ label: 'Read the privacy policy', href: '/privacy' }}
      />
    </>
  );
}
