/**
 * Per-service copy for the redesigned /services/* template that is not (yet)
 * part of `src/config/services.ts`: the 40–60-word lede, the three layers of
 * "The stack" (the page's signature interaction), the proof row and the
 * mini-scoper legends.
 *
 * Every sentence is composed from copy that already ships: the capability
 * cards, process phases and FAQ answers on the current service pages, the
 * tier features in `pricing` (site.ts) and the trust promises in the redesign
 * brief. No metric, date or client outcome is stated that the site does not
 * already state.
 */
import type { ServiceSlug } from '@/config/services';

export interface StackLayer {
  /** "01" … "03" */
  index: string;
  /** "What your client sees" · "What your team touches" · "What we run" */
  title: string;
  body: string;
  /** Short mono tags shown on the diagram plate. */
  tags: string[];
  /** The middle layer is branded "yours". */
  yours?: boolean;
}

export interface ScoperLegends {
  size: string;
  needs: string;
  support: string;
}

export interface ServicePageCopy {
  /** 40–60 words, names MAPL TECH, the audience and one real number. */
  lede: string;
  /** Key-facts "Typical timeline" value. Only web states durations today. */
  timelineFact: string;
  /** Copy for the right-rail CTA card under the price. */
  railNote: string;
  stack: { heading: string; layers: StackLayer[] };
  /** `portfolioProjects[].slug` that proves this line, or null. */
  proofSlug: string | null;
  scoper: ScoperLegends;
}

const OFFICES = 'Toronto (HQ) · Lagos · Kingston';
const TIMELINE_UNSTATED = 'Set in discovery — fixed quote after a 20-min scoping call';

export const SERVICE_COPY: Record<ServiceSlug, ServicePageCopy> = {
  'web-development': {
    lede:
      'MAPL TECH builds custom-coded sites for agencies — engineered for speed, accessibility, and long-term maintainability. We handle the complex builds (headless CMS, full-stack React, custom WordPress themes) so your agency can focus on design and client strategy. Starter sites ship in 3–4 weeks from $5,000.',
    timelineFact: '3–4 weeks Starter · 5–8 weeks Growth / E-Commerce · 8–14 weeks Advanced and Enterprise',
    railNote: 'Starter sites ship in 3–4 weeks. Every tier includes post-launch support (30–90 days).',
    stack: {
      heading: 'Three layers. The middle one is yours.',
      layers: [
        {
          index: '01',
          title: 'What your client sees',
          body:
            "Your agency's brand on every deliverable. Sub-second load times, WCAG 2.1 accessibility, and the same experience on Safari, Chrome, or a 5-year-old Android.",
          tags: ['brand', 'speed', 'WCAG 2.1'],
        },
        {
          index: '02',
          title: 'What your team touches',
          body:
            'Your designers lead the creative vision; we build pixel-perfect from Figma, Sketch, or XD. A CMS (headless or WordPress) your team can maintain. Weekly demos you can click through.',
          tags: ['Figma to code', 'CMS', 'weekly demos'],
          yours: true,
        },
        {
          index: '03',
          title: 'What we run',
          body:
            'APIs, databases, server logic, and caching layers. Staging builds, zero-downtime cutover, automated testing and CI/CD, and 30–90-day post-launch support.',
          tags: ['APIs', 'data', 'CI/CD', 'support'],
        },
      ],
    },
    proofSlug: 'chha-ncr',
    scoper: { size: 'How many pages?', needs: 'What does it need?', support: 'Ongoing support after launch?' },
  },

  'automation-ai-workflow-setup': {
    lede:
      "MAPL TECH connects your agency's CRM, project tools, invoicing, and client intake into one seamless pipeline — from simple automations to custom AI agents. Real engineering, not just Zapier connections, across your entire operational stack. Foundation Automation starts at $3,500–$5,000 and covers CRM setup and 3–5 core automations.",
    timelineFact: TIMELINE_UNSTATED,
    railNote: 'CRM setup, lead routing and 3–5 core automations in the Foundation tier. Documentation and training included.',
    stack: {
      heading: 'Three layers. The middle one is yours.',
      layers: [
        {
          index: '01',
          title: 'What your client sees',
          body:
            "Intake forms that qualify leads before they hit your inbox, AI assistants that handle routine inquiries, and follow-ups that trigger on time — all under your agency's name.",
          tags: ['intake', 'assistants', 'follow-ups'],
        },
        {
          index: '02',
          title: 'What your team touches',
          body:
            'Your CRM configured to route leads, trigger follow-ups, and manage pipelines automatically. Your website, project tools, and invoicing connected into one pipeline. Documentation and training so your team owns it.',
          tags: ['CRM', 'pipeline', 'training'],
          yours: true,
        },
        {
          index: '03',
          title: 'What we run',
          body:
            'Custom API bridges that keep data flowing across your stack, AI agents that take action, predictive analytics pipelines, and governance with full audit trails — monitored and fine-tuned after launch.',
          tags: ['APIs', 'AI agents', 'monitoring'],
        },
      ],
    },
    proofSlug: 'akuma-patterson-holdings',
    scoper: { size: 'How much are we automating?', needs: 'What does it need?', support: 'Ongoing support once it is live?' },
  },

  'custom-internal-tools': {
    lede:
      'MAPL TECH builds dashboards, client portals, and reporting systems for agencies — designed for how your team actually operates, not how a SaaS platform thinks you should. Off-the-shelf software forces you to adapt; we build tools that adapt to you. Internal Dashboards start at $5,000–$8,000 with role-based access control built in.',
    timelineFact: TIMELINE_UNSTATED,
    railNote: 'Dashboards, client portals and ops systems with role-based access. Biweekly demos your team can start using immediately.',
    stack: {
      heading: 'Three layers. The middle one is yours.',
      layers: [
        {
          index: '01',
          title: 'What your client sees',
          body:
            'Branded, white-label portals where clients track projects, share documents, communicate with your team, and pay invoices.',
          tags: ['portal', 'documents', 'payments'],
        },
        {
          index: '02',
          title: 'What your team touches',
          body:
            'Dashboards with real-time data and role-based access, so your team sees exactly what it needs. Interactive prototypes built around your real data, then biweekly demos of features you can start using immediately.',
          tags: ['dashboards', 'roles', 'biweekly demos'],
          yours: true,
        },
        {
          index: '03',
          title: 'What we run',
          body:
            'Encryption, authentication, and permissions baked in from the start. Custom integrations with your existing platforms, APIs, and data sources, on an architecture that scales without rewriting the foundation.',
          tags: ['security', 'integrations', 'scale'],
        },
      ],
    },
    proofSlug: 'lro-staffing',
    scoper: { size: 'Which tool are we building?', needs: 'What does it need?', support: 'Ongoing support after the tool ships?' },
  },

  'cloud-engineering': {
    lede:
      'MAPL TECH designs, deploys, and manages cloud infrastructure for agencies on AWS, GCP, or Azure — so you never worry about uptime, scaling, or deployment again. Production-grade infrastructure engineering, not just spinning up servers and hoping for the best. Starter Cloud Setup runs $5,000–$8,000, including CI/CD and uptime monitoring.',
    timelineFact: TIMELINE_UNSTATED,
    railNote: 'Cloud provider setup, CI/CD, containerized deployment and uptime monitoring in the Starter tier. Documentation and handoff included.',
    stack: {
      heading: 'Three layers. The middle one is yours.',
      layers: [
        {
          index: '01',
          title: 'What your client sees',
          body:
            'Uptime. Sites and applications that stay up through traffic spikes, migrated with zero downtime and zero data loss.',
          tags: ['uptime', 'zero downtime'],
        },
        {
          index: '02',
          title: 'What your team touches',
          body:
            'Automated build, test, and deploy pipelines that ship your code to production in minutes, across staging, production, and preview environments. Team training and documentation included.',
          tags: ['CI/CD', 'environments', 'training'],
          yours: true,
        },
        {
          index: '03',
          title: 'What we run',
          body:
            'Infrastructure as Code in Terraform or Pulumi; structured logging, tracing, and alerting; IAM policies and network isolation; cost reviews and right-sizing — monitored after launch so your cloud spend stays under control.',
          tags: ['IaC', 'observability', 'cost'],
        },
      ],
    },
    proofSlug: null,
    scoper: { size: 'What scale of infrastructure?', needs: 'What does it need?', support: 'Ongoing support after the infrastructure is live?' },
  },
};

export const SERVICE_OFFICES = OFFICES;

/** "$3,500-$5,000" → "$3,500–$5,000" (en dash between figures, as printed on the page). */
export function prettyPrice(label: string): string {
  return label.replace(/(\d)\s*-\s*(\$?\d)/g, '$1–$2');
}
