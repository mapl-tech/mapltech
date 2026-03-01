import type { Metadata } from 'next';
import BlurReveal from '@/components/ui/BlurReveal';
import styles from '@/styles/page-common.module.scss';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'MAPL TECH Terms of Use. Review the terms and conditions governing your use of our website and services.',
};

export default function TermsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Terms of Use</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>Terms of Use</h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              Last updated: March 1, 2026
            </p>
          </BlurReveal>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.sectionInner}>
          <div className={styles.textContent}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the MAPL TECH website (mapltech.com) and our services,
              you agree to be bound by these Terms of Use. If you do not agree to these
              terms, please do not use our website or services.
            </p>

            <h2>2. Description of Services</h2>
            <p>
              MAPL TECH provides web development, automation and AI workflow setup, custom
              internal tools, and related engineering services for agencies and businesses.
              Our services are described in detail on our website and in individual project
              agreements.
            </p>

            <h2>3. Use of Website</h2>
            <p>You agree to use our website only for lawful purposes and in a manner that does not:</p>
            <ul>
              <li>Violate any applicable local, national, or international law</li>
              <li>Infringe on the rights of others</li>
              <li>Interfere with or disrupt the website or its servers</li>
              <li>Attempt to gain unauthorized access to any part of the website</li>
              <li>Transmit any malicious code, viruses, or harmful data</li>
              <li>Collect or harvest personal information of other users</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              All content on the MAPL TECH website — including text, graphics, logos, images,
              designs, and software — is the property of MAPL TECH or its content suppliers
              and is protected by applicable intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of,
              publicly display, or otherwise use any content from our website without
              prior written permission from MAPL TECH.
            </p>

            <h2>5. Project Engagements</h2>
            <p>
              All project engagements between MAPL TECH and clients are governed by
              separate project agreements or statements of work. These Terms of Use apply
              to general website usage and do not replace or override specific contractual
              agreements.
            </p>

            <h2>6. Pricing and Payment</h2>
            <p>
              Pricing information displayed on our website is for general guidance only
              and may be subject to change. Final pricing is determined through individual
              project scoping and will be outlined in a formal proposal or agreement.
              Payment terms are specified in individual project contracts.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or services. MAPL TECH
              does not control and is not responsible for the content, privacy policies,
              or practices of third-party sites. Accessing third-party links is at your
              own risk.
            </p>

            <h2>8. Disclaimer of Warranties</h2>
            <p>
              Our website and its content are provided on an &quot;as is&quot; and &quot;as
              available&quot; basis without warranties of any kind, either express or implied.
              MAPL TECH does not warrant that the website will be uninterrupted, error-free,
              or free of viruses or other harmful components.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, MAPL TECH shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising out
              of or related to your use of the website or services. Our total liability for
              any claim shall not exceed the amount you paid to MAPL TECH for the specific
              service giving rise to the claim.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MAPL TECH, its directors, employees,
              and agents from any claims, damages, losses, or expenses (including reasonable
              legal fees) arising from your use of the website or violation of these Terms
              of Use.
            </p>

            <h2>11. Confidentiality</h2>
            <p>
              Any confidential information shared during the course of a project engagement
              will be treated in accordance with the confidentiality provisions of the
              applicable project agreement. General inquiries submitted through our website
              are not considered confidential.
            </p>

            <h2>12. Termination</h2>
            <p>
              MAPL TECH reserves the right to terminate or restrict your access to the
              website at any time, without notice, for conduct that we believe violates
              these Terms of Use or is harmful to other users, us, or third parties.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms of Use are governed by and construed in accordance with the laws
              of the Province of Ontario, Canada. Any disputes arising from these terms
              shall be subject to the exclusive jurisdiction of the courts of Ontario, Canada.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              MAPL TECH reserves the right to modify these Terms of Use at any time. Changes
              will be posted on this page with an updated &quot;Last updated&quot; date.
              Your continued use of the website after changes are posted constitutes
              acceptance of the revised terms.
            </p>

            <h2>15. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <p>
              <strong>MAPL TECH</strong>
              <br />
              Email: <a href="mailto:contact@mapltech.com">contact@mapltech.com</a>
              <br />
              Phone: +1 (647) 375-6724
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
