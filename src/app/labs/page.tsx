import type { Metadata } from 'next';
import Image from 'next/image';
import { HiArrowRight, HiArrowUpRight, HiCheck } from 'react-icons/hi2';
import BlurReveal from '@/components/ui/BlurReveal';
import SectionHeading from '@/components/ui/SectionHeading';
import MagneticButton from '@/components/ui/MagneticButton';
import { labsProjects } from '@/config/site';
import pageStyles from '@/styles/page-common.module.scss';
import styles from './labs.module.scss';

export const metadata: Metadata = {
  title: 'Labs',
  description:
    'MAPL Labs is where MAPL TECH builds and operates its own products - starting with MAPL Tours, a travel company run end-to-end by AI. Proof we ship and run real production systems, not just client work.',
  openGraph: {
    title: 'MAPL Labs | MAPL TECH',
    description:
      'Proprietary products MAPL TECH builds and operates in-house. The proving ground for the systems, automation, and infrastructure we bring to every client.',
  },
  alternates: { canonical: 'https://mapltech.com/labs' },
};

const ethos = [
  {
    title: 'We ship it',
    desc: 'Real, production-grade products - not prototypes or slide decks. Same engineering discipline we apply to every client build.',
  },
  {
    title: 'We run it',
    desc: 'These products are live and operating 24/7 with real users, real infrastructure, and real uptime on the line.',
  },
  {
    title: 'We prove it',
    desc: 'The AI agents, automations, and cloud systems we sell are the exact stack we trust to run our own companies.',
  },
];

export default function LabsPage() {
  return (
    <>
      {/* Hero */}
      <section className={pageStyles.hero}>
        <div className={pageStyles.heroInner}>
          <BlurReveal>
            <span className={styles.eyebrow}>MAPL Labs</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={pageStyles.heroTitle}>
              We don&apos;t just build for clients. We build for ourselves.
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={pageStyles.heroSubtitle}>
              MAPL Labs is where we engineer and operate our own products - the proving
              ground for the systems, automation, and infrastructure we bring to every
              client engagement.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.3}>
            <div className={styles.heroActions}>
              <MagneticButton href="/contact-us" size="large">
                Build Something With Us <HiArrowRight aria-hidden="true" style={{ marginLeft: 8 }} />
              </MagneticButton>
              <MagneticButton href="/our-work" variant="secondary" size="large">
                See Client Work
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* Ethos strip */}
      <section className={`${pageStyles.section} ${pageStyles.navy}`}>
        <div className={pageStyles.sectionInner}>
          <div className={styles.ethos}>
            {ethos.map((item, i) => (
              <BlurReveal key={item.title} delay={i * 0.1}>
                <div className={styles.ethosItem}>
                  <span className={styles.ethosNum}>0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase */}
      <section className={`${pageStyles.section} ${pageStyles.dark}`}>
        <div className={pageStyles.sectionInner}>
          <SectionHeading
            label="Inside the Lab"
            title="Products We Build & Operate"
            subtitle="Owned, engineered, and run by MAPL TECH."
          />

          <div className={styles.showcase}>
            {labsProjects.map((project, i) => {
              const isLive = project.status === 'Live';
              const reversed = i % 2 === 1;

              const image = (
                <Image
                  src={project.image}
                  alt={`${project.name} preview`}
                  width={720}
                  height={450}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              );

              return (
                <BlurReveal key={project.name} delay={0.05}>
                  <div className={`${styles.showcaseRow} ${reversed ? styles.reverse : ''}`}>
                    <div
                      className={`${styles.showcaseMedia} ${isLive ? '' : styles.comingSoonMedia}`}
                    >
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${project.name}`}
                        >
                          {image}
                        </a>
                      ) : (
                        image
                      )}
                      {!isLive && <span className={styles.comingSoonStamp}>In Development</span>}
                    </div>

                    <div className={styles.showcaseBody}>
                      <span
                        className={`${styles.statusBadge} ${isLive ? styles.live : styles.soon}`}
                      >
                        <span className={styles.dot} />
                        {project.status}
                      </span>
                      <h3 className={styles.showcaseName}>{project.name}</h3>
                      <p className={styles.tagline}>{project.tagline}</p>
                      <p className={styles.showcaseDesc}>{project.description}</p>

                      <ul className={styles.capabilities}>
                        {project.capabilities.map((cap) => (
                          <li key={cap}>
                            <HiCheck size={18} aria-hidden="true" />
                            {cap}
                          </li>
                        ))}
                      </ul>

                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.visitLink}
                        >
                          Visit {project.name}
                          <HiArrowUpRight aria-hidden="true" />
                        </a>
                      ) : (
                        <span className={styles.soonNote}>Announcing soon</span>
                      )}
                    </div>
                  </div>
                </BlurReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className={pageStyles.cta}>
        <div className={pageStyles.ctaInner}>
          <div className={pageStyles.ctaContent}>
            <BlurReveal>
              <h2>Your Product Could Be Next</h2>
              <p>
                The engineering that runs our own companies is the same engineering we bring
                to yours. Tell us what you&apos;re building.
              </p>
              <div style={{ marginTop: 30 }}>
                <MagneticButton href="/contact-us" size="large">
                  Start a Project <HiArrowRight aria-hidden="true" style={{ marginLeft: 8 }} />
                </MagneticButton>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>
    </>
  );
}
