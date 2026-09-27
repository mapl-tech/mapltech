/**
 * One typed record per service line, for the four `/services/*` pages, the
 * homepage services rows, the pricing estimator and the JSON-LD builders.
 *
 * Every string here is existing copy: the four current service pages
 * (hero, capability cards, process phases, CTA band), the tier data in
 * `pricing` (site.ts) and the pricing page's FAQ array. Composed FAQ answers
 * interpolate tier names, prices and features from `pricing` at module load,
 * so they can never disagree with the tier tables. Nothing is invented; where
 * the current copy states no fact (a timeline, a stack, a case study) the
 * field is omitted or null.
 */
import type { EstimateService } from '@/lib/estimate';
import { pricing } from './site';

export type ServiceSlug =
  | 'web-development'
  | 'automation-ai-workflow-setup'
  | 'custom-internal-tools'
  | 'cloud-engineering';

export type ServicePricingKey = 'webDevelopment' | 'automation' | 'internalTools' | 'cloudEngineering';

export interface ServiceTier {
  name: string;
  description: string;
  price: string;
  features: string[];
}

export interface ServiceRecurringLine {
  name: string;
  price: string;
  description?: string;
}

export interface ServiceCapability {
  title: string;
  description: string;
}

export interface ServiceProcessStep {
  /** "Phase 01" … "Phase 04" as printed on the current pages. */
  phase: string;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface BuyerSituation {
  /** The tier description from site.ts, written as the buyer's situation. */
  situation: string;
  /** The tier that answers it (chip → tier anchor on the service page). */
  tierName: string;
  tierIndex: number;
}

export interface ServiceSectionCopy {
  label: string;
  title: string;
  subtitle: string;
}

export interface ServiceRecord {
  slug: ServiceSlug;
  path: string;
  /** "Web Development" — nav and chips. */
  shortName: string;
  /** Page title as published, e.g. "Custom Web Development for Agencies". */
  name: string;
  /** Eyebrow above the H1 on the current page. */
  heroLabel: string;
  pricingKey: ServicePricingKey;
  estimateKey: EstimateService;
  /** Current hero subtitle: one sentence on what the line does. */
  oneLiner: string;
  /** Current H1 text. */
  heroTitle: string;
  /** Section headings from the current page (capabilities, process, pricing). */
  sections: {
    capabilities: ServiceSectionCopy;
    process: ServiceSectionCopy;
    pricing: ServiceSectionCopy;
  };
  buyerSituations: BuyerSituation[];
  /** Union of tier features (minus "Everything in …" lines), source order. */
  deliverables: string[];
  /** Technologies named in the current copy. */
  stack: string[];
  /** The six capability cards (titles + descriptions, icons dropped). */
  capabilities: ServiceCapability[];
  processSteps: ServiceProcessStep[];
  faqs: ServiceFaq[];
  /** Only when the current copy states one. */
  typicalTimeline?: string;
  /** Only when the current copy states one. */
  postLaunchSupport?: string;
  /** The current CTA band above the contact form. */
  ctaBand: { heading: string; body: string; submitLabel: string };
  /** `portfolioProjects[].category` that proves this line, or null when none exists. */
  portfolioCategory: string | null;
}

/* ------------------------------------------------------------------ */
/* Helpers (read from `pricing` so the copy tracks the tables)          */
/* ------------------------------------------------------------------ */

function tiersFor(key: ServicePricingKey): readonly ServiceTier[] {
  return pricing[key].tiers;
}

function recurringFor(key: ServicePricingKey): readonly ServiceRecurringLine[] {
  return key === 'webDevelopment' ? pricing.webDevelopment.maintenance : pricing[key].retainers;
}

function situationsFrom(key: ServicePricingKey): BuyerSituation[] {
  return tiersFor(key)
    .slice(0, 3)
    .map((tier, index) => ({ situation: tier.description, tierName: tier.name, tierIndex: index }));
}

function deliverablesFrom(key: ServicePricingKey): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tier of tiersFor(key)) {
    for (const feature of tier.features) {
      if (/^everything in /i.test(feature) || seen.has(feature)) continue;
      seen.add(feature);
      out.push(feature);
    }
  }
  return out;
}

function listWords(items: readonly string[]): string {
  const lowered = items.map((item) => item.charAt(0).toLowerCase() + item.slice(1));
  if (lowered.length <= 1) return lowered.join('');
  return `${lowered.slice(0, -1).join(', ')}, and ${lowered[lowered.length - 1]}`;
}

function ownFeatures(tier: ServiceTier): string[] {
  return tier.features.filter((feature) => !/^everything in /i.test(feature));
}

/** "How much does … cost?" answer composed from the tier table (ranges, not starting prices). */
function costAnswer(key: ServicePricingKey): string {
  const tiers = tiersFor(key);
  const sentences = tiers.map((tier, index) => {
    const verb = index === 0 ? 'covers' : 'adds';
    return `${tier.name} (${tier.price}) ${verb} ${listWords(ownFeatures(tier))}.`;
  });
  return `${sentences.join(' ')} You get a fixed quote after a 20-min scoping call.`;
}

/** "What ongoing support is available?" answer composed from the recurring lines. */
function supportAnswer(key: ServicePricingKey, noun: string): string {
  const lines = recurringFor(key);
  const list = lines
    .map((line) => `${line.name} (${line.price}${line.description ? `: ${line.description.charAt(0).toLowerCase()}${line.description.slice(1)}` : ''})`)
    .join('; ');
  return `${lines.length === 1 ? 'One' : lines.length === 2 ? 'Two' : 'Three'} monthly ${noun} options: ${list}.`;
}

/** Shared answer from the pricing page's FAQ; the wording is not service-specific. */
const PAYMENT_PLANS_FAQ: ServiceFaq = {
  question: 'Do you offer payment plans?',
  answer:
    'Yes. We typically split projects into milestone-based payments - a deposit to start, a mid-project payment, and a final payment at launch. We will work out a structure that fits your cash flow.',
};

const web = pricing.webDevelopment.tiers;

/* ------------------------------------------------------------------ */
/* Records                                                              */
/* ------------------------------------------------------------------ */

export const services: readonly ServiceRecord[] = [
  {
    slug: 'web-development',
    path: '/services/web-development',
    shortName: 'Web Development',
    name: 'Custom Web Development for Agencies',
    heroLabel: 'Web Development',
    pricingKey: 'webDevelopment',
    estimateKey: 'web',
    heroTitle: 'Web Development That Actually Performs',
    oneLiner:
      'Custom-coded sites engineered for speed, accessibility, and long-term maintainability. We handle the complex builds so your agency can focus on design and client strategy.',
    sections: {
      capabilities: {
        label: 'What We Deliver',
        title: 'Every Layer of the Stack, Done Right',
        subtitle: 'From pixel-perfect frontends to bulletproof backends - we build what your agency project demands.',
      },
      process: {
        label: 'Our Process',
        title: 'From Brief to Browser, Step by Step',
        subtitle: 'A battle-tested workflow built around agency timelines and real client expectations.',
      },
      pricing: {
        label: 'Pricing',
        title: 'Transparent Pricing, No Surprises',
        subtitle: 'Pick the tier that matches your project scope. Every plan includes post-launch support.',
      },
    },
    buyerSituations: situationsFrom('webDevelopment'),
    deliverables: deliverablesFrom('webDevelopment'),
    stack: ['React', 'Next.js', 'WordPress (custom themes, not page builders)', 'Node.js', 'Python'],
    capabilities: [
      {
        title: 'Custom-Coded, Not Cobbled Together',
        description:
          'No templates, no page builders, no plugin Frankensteins. Every site is engineered from scratch - custom WordPress themes, headless CMS builds, or full-stack React.',
      },
      {
        title: 'Speed That Ranks',
        description:
          'Sub-second load times through code splitting, image optimization, lazy loading, and SSR. Fast sites convert better and rank higher.',
      },
      {
        title: 'Works Everywhere',
        description:
          "Tested across every major browser and device. Your clients' users get the same experience whether they're on Safari, Chrome, or a 5-year-old Android.",
      },
      {
        title: 'Accessible by Default',
        description:
          "WCAG 2.1 compliance isn't an add-on. ARIA attributes, keyboard navigation, and screen reader support are built in from day one.",
      },
      {
        title: 'Solid Backend Architecture',
        description:
          'APIs, databases, server logic, and caching layers - the invisible infrastructure that makes everything else work reliably.',
      },
      {
        title: 'Mobile-First Responsiveness',
        description:
          'Fluid layouts designed for mobile first, then scaled up. Every breakpoint is intentional, not an afterthought.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Discovery',
        description:
          'We map your goals, audience, and technical landscape. You walk away with a clear project spec, sitemap, and architecture plan before we write a single line of code.',
      },
      {
        phase: 'Phase 02',
        title: 'Design',
        description:
          'Your designers lead the creative vision. We validate every mockup for technical feasibility, responsive behavior, and performance so nothing gets lost in translation.',
      },
      {
        phase: 'Phase 03',
        title: 'Development',
        description:
          'Iterative sprints with weekly demos you can click through. Custom code, no shortcuts. Every component is built for speed, accessibility, and maintainability.',
      },
      {
        phase: 'Phase 04',
        title: 'Test & Launch',
        description:
          'Cross-browser QA, performance audits, and accessibility checks. We deploy with zero downtime and stay on for post-launch monitoring and support.',
      },
    ],
    faqs: [
      {
        question: 'How much does a headless WordPress build cost for an agency?',
        answer: `CMS integration (headless or WordPress) is included from the ${web[1].name} tier at ${web[1].price}. That tier covers ${listWords(ownFeatures(web[1]).filter((f) => !/^cms integration/i.test(f)))}. ${ownFeatures(web[2])[0]}s start at ${web[2].price} (${web[2].name}). You get a fixed quote after a 20-min scoping call.`,
      },
      {
        question: 'How long does a typical web development project take?',
        answer:
          'Starter sites typically ship in 3-4 weeks. Growth/E-Commerce projects run 5-8 weeks. Advanced and Enterprise builds are scoped individually, but most launch within 8-14 weeks. We give you a clear timeline during discovery and stick to it.',
      },
      {
        question: 'Do you work with our existing designs, or do you handle design too?',
        answer:
          'Both. Most agencies bring their own designs and we build pixel-perfect from Figma, Sketch, or XD files. If you need design support, we can collaborate with your team or connect you with a design partner.',
      },
      {
        question: 'What technologies do you build with?',
        answer:
          'We use the right tool for each project - React, Next.js, WordPress (custom themes, not page builders), Node.js, Python, and more. Every decision is based on your project requirements, not our preferences.',
      },
      {
        question: 'What happens after the site launches?',
        answer:
          'Every plan includes post-launch support (30-90 days depending on tier). After that, our monthly maintenance plans keep your site secure, fast, and updated. Most clients choose a maintenance plan because it costs far less than fixing problems later.',
      },
      {
        question: 'Can you rebuild our existing site without downtime?',
        answer:
          'Yes. We build the new site on a staging environment, migrate content, test everything, and do a zero-downtime cutover. Your visitors never see a broken page.',
      },
      PAYMENT_PLANS_FAQ,
    ],
    typicalTimeline: '3–4 weeks Starter · 5–8 weeks Growth / E-Commerce · 8–14 weeks Advanced and Enterprise',
    postLaunchSupport: '30–90 days depending on tier',
    ctaBand: {
      heading: 'Ready to Build Your Next Web Project?',
      body: "Tell us about your project requirements and let's discuss how we can help.",
      submitLabel: 'Get Started',
    },
    portfolioCategory: 'Web Development',
  },
  {
    slug: 'automation-ai-workflow-setup',
    path: '/services/automation-ai-workflow-setup',
    shortName: 'Automation & AI',
    name: 'Automation & AI Workflow Setup for Agencies',
    heroLabel: 'Automation & AI',
    pricingKey: 'automation',
    estimateKey: 'automation',
    heroTitle: 'Stop Doing Manually What Should Happen Automatically',
    oneLiner:
      'We connect your CRM, project tools, invoicing, and client intake into one seamless pipeline. From simple automations to custom AI agents.',
    sections: {
      capabilities: {
        label: 'Capabilities',
        title: 'Automation That Actually Saves Time',
        subtitle: 'Not just Zapier connections. Real engineering that connects your entire operational stack.',
      },
      process: {
        label: 'Our Process',
        title: 'From Manual Chaos to Automated Clarity',
        subtitle: 'A structured approach to replacing repetitive work with intelligent systems.',
      },
      pricing: {
        label: 'Pricing',
        title: 'Automation & AI Pricing Tiers',
        subtitle: 'Scalable solutions from foundation setup to enterprise-grade AI workflows.',
      },
    },
    buyerSituations: situationsFrom('automation'),
    deliverables: deliverablesFrom('automation'),
    stack: ['CRM setup & configuration', 'Custom API integrations', 'AI-powered intake forms', 'Custom AI agents', 'Predictive analytics pipelines'],
    capabilities: [
      {
        title: 'CRM That Works for You',
        description:
          'We configure your CRM to route leads, trigger follow-ups, and manage pipelines automatically - so your team focuses on closing, not data entry.',
      },
      {
        title: 'Multi-System Pipelines',
        description:
          "Your website, CRM, project tools, invoicing, and internal systems - all connected into one automated pipeline that doesn't break.",
      },
      {
        title: 'AI-Powered Intake & Assistants',
        description:
          'Intelligent forms that qualify leads before they hit your inbox. AI assistants that handle routine inquiries so your team handles the rest.',
      },
      {
        title: 'Custom API Integrations',
        description:
          'If two tools need to talk, we make it happen. Custom API bridges that keep data flowing across your entire tech stack.',
      },
      {
        title: 'AI Agents & Predictive Analytics',
        description:
          'Custom AI agents that take action, not just report data. Predictive analytics that surface what matters before you have to ask.',
      },
      {
        title: 'Enterprise Orchestration',
        description:
          'Cross-department automation with governance, compliance, and full audit trails. Built for agencies managing multiple teams and clients.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Discovery',
        description:
          "We audit your current tools, map every manual workflow, and identify where automation will have the highest impact on your team's time and revenue.",
      },
      {
        phase: 'Phase 02',
        title: 'Design',
        description:
          'We architect your automation blueprint: triggers, logic paths, data flows, and fallback scenarios. You approve the system design before we build anything.',
      },
      {
        phase: 'Phase 03',
        title: 'Development',
        description:
          'We wire your tools together with custom integrations, configure AI agents, and build the pipelines that turn hours of manual work into seconds of automation.',
      },
      {
        phase: 'Phase 04',
        title: 'Test & Launch',
        description:
          'Stress-tested with real data, edge cases, and failure scenarios. We deploy, monitor, train your team, and stay on to fine-tune performance.',
      },
    ],
    faqs: [
      {
        question: 'How much does automation and AI workflow setup cost for an agency?',
        answer: costAnswer('automation'),
      },
      {
        question: 'What ongoing support is available once the automations are live?',
        answer: supportAnswer('automation', 'retainer'),
      },
      PAYMENT_PLANS_FAQ,
    ],
    ctaBand: {
      heading: 'Ready to Stop Copy-Pasting Between Tools?',
      body: "Tell us what you're tired of doing manually. We'll build the automation that makes it disappear.",
      submitLabel: "Let's Automate",
    },
    portfolioCategory: 'Automation and AI Workflows',
  },
  {
    slug: 'custom-internal-tools',
    path: '/services/custom-internal-tools',
    shortName: 'Custom Internal Tools',
    name: 'Custom Internal Tools for Agencies',
    heroLabel: 'Internal Tools',
    pricingKey: 'internalTools',
    estimateKey: 'tools',
    heroTitle: 'Internal Tools Built Around Your Agency - Not the Other Way Around',
    oneLiner:
      'Dashboards, client portals, and reporting systems designed for how your team actually operates - not how a SaaS platform thinks you should.',
    sections: {
      capabilities: {
        label: 'What We Build',
        title: 'Your Agency Deserves Its Own Tools',
        subtitle: 'Off-the-shelf software forces you to adapt. We build tools that adapt to you.',
      },
      process: {
        label: 'Our Process',
        title: 'Built With Your Team, Not Just for Them',
        subtitle: 'A collaborative workflow that turns operational friction into purpose-built software.',
      },
      pricing: {
        label: 'Pricing',
        title: 'Internal Tools Pricing',
        subtitle: 'From dashboards to full operational platforms, we have a solution for every scale.',
      },
    },
    buyerSituations: situationsFrom('internalTools'),
    deliverables: deliverablesFrom('internalTools'),
    // Named technologies come from the pricing page's "What technologies do you build with?"
    // answer, which speaks for every project; the last two are this line's own feature terms.
    stack: ['React', 'Next.js', 'Node.js', 'Python', 'Role-based access control', 'API integrations'],
    capabilities: [
      {
        title: 'Internal Dashboards',
        description:
          'Real-time data visualization with role-based access. Your team sees exactly what they need - nothing more, nothing less.',
      },
      {
        title: 'Client Portals',
        description:
          'Branded, white-label portals where clients track projects, share documents, communicate with your team, and pay invoices.',
      },
      {
        title: 'Ops & Reporting Systems',
        description:
          'End-to-end operations platforms with automated reports, multi-team coordination, and analytics engines your leadership team actually uses.',
      },
      {
        title: 'Security Built In',
        description:
          'Encryption, authentication, role-based permissions, and compliance - baked into every tool from the start, not bolted on later.',
      },
      {
        title: 'Grows With You',
        description: 'Modern architecture that scales. Add features, users, and integrations without rewriting the foundation.',
      },
      {
        title: 'Plugs Into Your Stack',
        description:
          'Custom integrations with your existing platforms, APIs, and data sources. One unified operational experience.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Discovery',
        description:
          "We shadow your team's actual workflows, interview stakeholders, and document every pain point. The result is a requirements spec your whole team signs off on.",
      },
      {
        phase: 'Phase 02',
        title: 'Design',
        description:
          "Interactive wireframes and clickable prototypes built around your real data. Your team tests the tool's flow and layout before a single line of production code.",
      },
      {
        phase: 'Phase 03',
        title: 'Development',
        description:
          'Modular builds with biweekly demos. We integrate with your existing stack, lock down permissions, and ship features your team can start using immediately.',
      },
      {
        phase: 'Phase 04',
        title: 'Test & Launch',
        description:
          'User acceptance testing with your team, security audits, and load testing. We deploy, onboard your users, and provide hands-on training to drive adoption.',
      },
    ],
    faqs: [
      {
        question: 'How much does a custom internal tool cost for an agency?',
        answer: costAnswer('internalTools'),
      },
      {
        question: 'What ongoing support is available after the tool ships?',
        answer: supportAnswer('internalTools', 'retainer'),
      },
      PAYMENT_PLANS_FAQ,
    ],
    ctaBand: {
      heading: 'Tired of Workarounds and Spreadsheets?',
      body: "Tell us what's slowing your team down. We'll build the tool that fixes it - for good.",
      submitLabel: "Let's Build",
    },
    portfolioCategory: 'Custom Internal Tools',
  },
  {
    slug: 'cloud-engineering',
    path: '/services/cloud-engineering',
    shortName: 'Cloud Engineering',
    name: 'Cloud Engineering for Agencies',
    heroLabel: 'Cloud Engineering',
    pricingKey: 'cloudEngineering',
    estimateKey: 'cloud',
    heroTitle: 'Infrastructure That Scales When Your Clients Do',
    oneLiner:
      'We design, deploy, and manage cloud infrastructure so your agency never worries about uptime, scaling, or deployment again.',
    sections: {
      capabilities: {
        label: 'Capabilities',
        title: 'Cloud Done Right, From Day One',
        subtitle: 'Production-grade infrastructure engineering - not just spinning up servers and hoping for the best.',
      },
      process: {
        label: 'Our Process',
        title: 'From Audit to Always-On',
        subtitle: 'A methodical approach to building infrastructure you can trust.',
      },
      pricing: {
        label: 'Pricing',
        title: 'Cloud Engineering Pricing Tiers',
        subtitle: 'From first cloud setup to enterprise-grade multi-region platforms.',
      },
    },
    buyerSituations: situationsFrom('cloudEngineering'),
    deliverables: deliverablesFrom('cloudEngineering'),
    stack: ['AWS, GCP, or Azure', 'Terraform / Pulumi', 'CI/CD pipelines', 'Containerization', 'Logging, monitoring, and observability stack'],
    capabilities: [
      {
        title: 'Infrastructure as Code',
        description:
          'Every server, database, and network rule defined in version-controlled Terraform or Pulumi modules. Reproducible, auditable, and never configured by hand.',
      },
      {
        title: 'Cloud Architecture & Migration',
        description:
          'We design the right architecture for your workloads on AWS, GCP, or Azure - and migrate you there with zero downtime and zero data loss.',
      },
      {
        title: 'CI/CD Pipeline Engineering',
        description:
          'Automated build, test, and deploy pipelines that ship your code to production in minutes. No more manual deployments or broken releases.',
      },
      {
        title: 'Monitoring & Observability',
        description:
          "Full-stack observability with structured logging, distributed tracing, and alerting. Know exactly what's happening in your infrastructure before your clients do.",
      },
      {
        title: 'Security & Compliance',
        description:
          'IAM policies, network isolation, encryption at rest and in transit, and compliance readiness for SOC 2, HIPAA, and GDPR. Security built in, not bolted on.',
      },
      {
        title: 'Cost Optimization & Scaling',
        description:
          'Right-sized resources, reserved capacity planning, and auto-scaling policies that keep your cloud bill predictable while handling traffic spikes.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Audit',
        description:
          'We assess your current infrastructure, hosting environment, and deployment workflows. You get a clear report of risks, bottlenecks, and opportunities before we touch anything.',
      },
      {
        phase: 'Phase 02',
        title: 'Architecture',
        description:
          'We design your cloud architecture blueprint - provider selection, networking, security boundaries, and scaling strategy. You approve the plan before we provision a single resource.',
      },
      {
        phase: 'Phase 03',
        title: 'Build',
        description:
          'Infrastructure provisioned as code, CI/CD pipelines configured, monitoring deployed, and applications migrated. Every change is version-controlled and repeatable.',
      },
      {
        phase: 'Phase 04',
        title: 'Monitor & Optimize',
        description:
          'Post-launch monitoring, cost reviews, and performance tuning. We stay on to ensure your infrastructure runs reliably and your cloud spend stays under control.',
      },
    ],
    faqs: [
      {
        question: 'How much does cloud engineering cost for an agency?',
        answer: costAnswer('cloudEngineering'),
      },
      {
        question: 'What ongoing support is available after the infrastructure is live?',
        answer: supportAnswer('cloudEngineering', 'retainer'),
      },
      PAYMENT_PLANS_FAQ,
    ],
    ctaBand: {
      heading: 'Ready to Move to the Cloud?',
      body: "Tell us about your infrastructure challenges and let's build something that scales.",
      submitLabel: "Let's Build",
    },
    // No portfolioProjects entry is categorised as cloud work today.
    portfolioCategory: null,
  },
];

export const SERVICE_SLUGS: readonly ServiceSlug[] = services.map((service) => service.slug);

export function getService(slug: ServiceSlug): ServiceRecord {
  const record = services.find((service) => service.slug === slug);
  if (!record) throw new Error(`Unknown service slug "${slug}"`);
  return record;
}

export function getServiceByEstimateKey(key: EstimateService): ServiceRecord {
  const record = services.find((service) => service.estimateKey === key);
  if (!record) throw new Error(`No service record for estimate key "${key}"`);
  return record;
}

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === 'string' && (SERVICE_SLUGS as readonly string[]).includes(value);
}

/** Tier table for a service record, straight from `pricing`. */
export function serviceTiers(record: ServiceRecord): readonly ServiceTier[] {
  return tiersFor(record.pricingKey);
}

/** Monthly maintenance / retainer lines for a service record, straight from `pricing`. */
export function serviceRecurringLines(record: ServiceRecord): readonly ServiceRecurringLine[] {
  return recurringFor(record.pricingKey);
}
