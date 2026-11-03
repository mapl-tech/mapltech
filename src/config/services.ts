/**
 * One typed record per service line, for the four `/services/*` pages, the
 * homepage services rows, the pricing estimator and the JSON-LD builders.
 *
 * Every fact here comes from the live service pages (hero, capability cards,
 * process phases, CTA band), the tier data in `pricing` (site.ts) and the
 * pricing page's FAQ array, rewritten in plain words (Nov 2026 simplify pass:
 * short sentences, no jargon). Composed FAQ answers interpolate tier names,
 * prices and features from `pricing` at module load, so they can never
 * disagree with the tier tables. Nothing is invented; where the live copy
 * states no fact (a timeline, a stack, a case study) the field is omitted or
 * null.
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

/** Lower-cases a leading capital mid-sentence, but leaves acronyms alone ("CRM setup", "AI-powered", "SSL"). */
function midSentence(text: string): string {
  // "Custom design" and "E-commerce" lower their first letter; "CRM setup" does not.
  return /^[A-Z](?:[a-z]|-[a-z])/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function listWords(items: readonly string[]): string {
  const lowered = items.map(midSentence);
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
  return `${sentences.join(' ')} You get a fixed quote after a 20-minute call.`;
}

/** "What support do you offer after launch?" answer composed from the recurring lines. */
function supportAnswer(key: ServicePricingKey): string {
  const lines = recurringFor(key);
  const list = lines
    .map((line) => `${line.name} (${line.price}${line.description ? `: ${midSentence(line.description)}` : ''})`)
    .join('; ');
  const count = lines.length === 1 ? 'One monthly plan' : `${lines.length === 2 ? 'Two' : 'Three'} monthly plans`;
  return `${count}: ${list}.`;
}

/** Shared answer from the pricing page's FAQ; the wording is not service-specific. */
const PAYMENT_PLANS_FAQ: ServiceFaq = {
  question: 'Do you offer payment plans?',
  answer:
    'Yes. We usually split a project into three payments: a deposit to start, one in the middle and one at launch. We can shape the plan around your cash flow.',
};

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
    // Plain-language pass (Nov 2026): the live pages' facts, in everyday words. The H1 is a promise of
    // eight words or fewer; the service's name is the eyebrow above it.
    heroTitle: 'Fast, accessible websites under your brand',
    oneLiner:
      'Fast, accessible websites built from your designs. We handle the build, so your agency can focus on design and your clients.',
    sections: {
      capabilities: {
        label: 'What we build',
        title: 'What every site gets',
        // Starter: "Custom-coded website ... (up to 7 pages)"; Advanced: "A custom web application, front end and back end".
        subtitle: 'We build everything from small sites to full web apps.',
      },
      process: {
        label: 'How it works',
        title: 'From plan to launch, in four steps',
        subtitle: 'A simple process built around agency deadlines.',
      },
      pricing: {
        label: 'What it costs',
        title: 'Four tiers, every price public',
        subtitle: 'Pick the tier closest to your project. Every plan includes support after launch.',
      },
    },
    buyerSituations: situationsFrom('webDevelopment'),
    deliverables: deliverablesFrom('webDevelopment'),
    stack: ['React', 'Next.js', 'WordPress', 'Node.js', 'Python'],
    capabilities: [
      {
        // Not "no page builders": CHHA-NCR, shown as proof, runs on Elementor so
        // its volunteers can edit it. The build is chosen for who runs the site.
        title: 'Built for the people who run it',
        description:
          'No template forced into shape. We build for the team that will run the site, on WordPress or fully custom code.',
      },
      {
        title: 'Fast pages',
        description: 'We keep pages light so they load quickly. Fast sites win more customers and rank higher on Google.',
      },
      {
        title: 'Works on every device',
        description:
          'Tested on every major browser and device. It works the same on Safari, Chrome or a five-year-old Android phone.',
      },
      {
        title: 'Accessible to everyone',
        description:
          'Built to accessibility standards (WCAG 2.1) from day one, so people who use a keyboard or a screen reader can use it too.',
      },
      {
        title: 'Solid behind the scenes',
        description:
          'The parts visitors never see, like databases and connections to other tools, are built to work reliably.',
      },
      {
        title: 'Phones first',
        description: 'We design for phones first, then scale up to tablets and desktops, so every screen size looks right.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Plan',
        description: 'We learn your goals and agree a written plan before we write any code.',
      },
      {
        phase: 'Phase 02',
        title: 'Design',
        description: 'Your designers lead. We check that every design works on all screens and loads fast.',
      },
      {
        phase: 'Phase 03',
        title: 'Build',
        description: 'We build in short cycles and show you working pages every week.',
      },
      {
        phase: 'Phase 04',
        title: 'Test and launch',
        description: 'We test speed, accessibility and every browser, launch without downtime, then support you.',
      },
    ],
    faqs: [
      {
        question: 'How much does a website cost?',
        answer: costAnswer('webDevelopment'),
      },
      {
        question: 'How long does a website take?',
        answer:
          'Starter sites usually take 3–4 weeks. Growth / E-Commerce projects take 5–8 weeks. Advanced and Enterprise builds usually launch within 8–14 weeks. We agree a timeline with you at the start and keep to it.',
      },
      {
        question: 'Can you build from our designs?',
        answer:
          'Yes. Most agencies bring their own designs, and we build them exactly from Figma, Sketch or XD files. If you need design help, we can work with your team or introduce you to a design partner.',
      },
      {
        question: 'What happens after launch?',
        answer:
          'Every plan includes 30–90 days of support after launch, depending on the tier. After that, a monthly plan keeps your site secure, fast and up to date.',
      },
      PAYMENT_PLANS_FAQ,
    ],
    typicalTimeline: '3–4 weeks Starter · 5–8 weeks Growth / E-Commerce · 8–14 weeks Advanced and Enterprise',
    postLaunchSupport: '30–90 days depending on tier',
    ctaBand: {
      heading: 'Ready to build your next website?',
      body: 'Tell us about the project, and we will show you how we can help.',
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
    heroTitle: 'Let automation handle the repetitive work',
    oneLiner:
      'We connect your CRM, project tools, invoicing and client intake so they work as one. From simple automations to custom AI agents.',
    sections: {
      capabilities: {
        label: 'What we build',
        title: 'What we automate',
        // The tiers in order: Foundation (CRM, key automations), then AI intake, then custom AI agents.
        subtitle: 'Start with the basics, then add AI when you are ready.',
      },
      process: {
        label: 'How it works',
        title: 'From manual to automatic, in four steps',
        subtitle: 'A clear plan for handing repetitive work to software.',
      },
      pricing: {
        label: 'What it costs',
        title: 'Three tiers, every price public',
        subtitle: 'From a first CRM setup to AI that runs whole workflows.',
      },
    },
    buyerSituations: situationsFrom('automation'),
    deliverables: deliverablesFrom('automation'),
    stack: ['CRM setup & configuration', 'Custom API integrations', 'AI-powered intake forms', 'Custom AI agents', 'Predictive analytics pipelines'],
    capabilities: [
      {
        title: 'A CRM that does the follow-up',
        description:
          'Your CRM routes new leads and sends follow-ups by itself, so your team spends its time closing deals, not typing data.',
      },
      {
        title: 'All your tools, connected',
        description: 'Your website, CRM, project tools and invoicing work as one system that keeps running.',
      },
      {
        title: 'AI that sorts new enquiries',
        description:
          'Smart forms check leads before they reach your inbox. AI assistants answer routine questions, so your team handles the rest.',
      },
      {
        title: 'Custom connections',
        description: 'If two tools need to share information, we connect them, so data moves between them automatically.',
      },
      {
        title: 'AI agents that act',
        description: 'Custom AI agents that do tasks, not just report on them. Forecasts that flag what matters before you ask.',
      },
      {
        title: 'Built for bigger teams',
        description: 'Automation across departments, with permissions, compliance rules and a full record of every action.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Review',
        description: 'We review your tools and find the manual work most worth automating first.',
      },
      {
        phase: 'Phase 02',
        title: 'Plan',
        description: 'We map out each automation. You approve the plan before we build anything.',
      },
      {
        phase: 'Phase 03',
        title: 'Build',
        description: 'We connect your tools, set up the AI agents and build the automations.',
      },
      {
        phase: 'Phase 04',
        title: 'Test and launch',
        description: 'We test with real data, launch, train your team, then keep improving it.',
      },
    ],
    faqs: [
      {
        question: 'How much does automation cost?',
        answer: costAnswer('automation'),
      },
      {
        question: 'What support do you offer after launch?',
        answer: supportAnswer('automation'),
      },
      PAYMENT_PLANS_FAQ,
    ],
    ctaBand: {
      heading: 'Tired of copying data between tools?',
      body: 'Tell us what your team does by hand. We will build the automation that does it for you.',
      submitLabel: "Let's Automate",
    },
    portfolioCategory: 'Automation and AI Workflows',
  },
  {
    slug: 'custom-internal-tools',
    path: '/services/custom-internal-tools',
    shortName: 'Custom Internal Tools',
    name: 'Custom Internal Tools for Agencies',
    heroLabel: 'Custom Internal Tools',
    pricingKey: 'internalTools',
    estimateKey: 'tools',
    heroTitle: 'Internal tools that fit how you work',
    oneLiner:
      'Dashboards, client portals and reporting tools built around how your team works, not how a software company thinks you should work.',
    sections: {
      capabilities: {
        label: 'What we build',
        title: 'Tools for your team and your clients',
        // Capabilities "Secure from the start" (built in from day one) and "Grows with you" (add later, without
        // starting over), said once here so the points below can show the tools themselves.
        subtitle: 'Each one is secure from day one, and you can add to it later without starting over.',
      },
      process: {
        label: 'How it works',
        title: 'Built with your team, in four steps',
        subtitle: 'Your team shapes the tool at every step.',
      },
      pricing: {
        label: 'What it costs',
        title: 'Three tiers, every price public',
        subtitle: 'From one dashboard to a system that runs your whole agency.',
      },
    },
    buyerSituations: situationsFrom('internalTools'),
    deliverables: deliverablesFrom('internalTools'),
    // Named technologies from the pricing page's "What technologies do you build with?"
    // answer, which speaks for every project.
    stack: ['React', 'Next.js', 'Node.js', 'Python'],
    capabilities: [
      {
        title: 'Dashboards',
        description: 'Live numbers on one screen. Each person sees exactly what their role needs, nothing more.',
      },
      {
        title: 'Client portals',
        description:
          'A portal under your brand where clients follow projects, share files, message your team and pay invoices.',
      },
      {
        title: 'Operations and reporting',
        description: 'One system to run daily operations, with automatic reports your leadership team will actually use.',
      },
      {
        title: 'Secure from the start',
        description: 'Encryption, logins, permissions and compliance are built in from day one, not added later.',
      },
      {
        title: 'Grows with you',
        description: 'Add features, users and connections later, without starting over.',
      },
      {
        title: 'Works with your tools',
        description: 'Connects to the platforms and data you already use, so your team works in one place.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Learn',
        description: 'We study how your team works and agree in writing what the tool must do.',
      },
      {
        phase: 'Phase 02',
        title: 'Design',
        description: 'Your team tries a clickable prototype with your real data before we build it.',
      },
      {
        phase: 'Phase 03',
        title: 'Build',
        description: 'We build it in stages, with a demo for your team every two weeks.',
      },
      {
        phase: 'Phase 04',
        title: 'Test and launch',
        description: 'Your team tests it, we check security and load, then we launch and train everyone.',
      },
    ],
    faqs: [
      {
        question: 'How much does a custom internal tool cost?',
        answer: costAnswer('internalTools'),
      },
      {
        question: 'What support do you offer after launch?',
        answer: supportAnswer('internalTools'),
      },
      PAYMENT_PLANS_FAQ,
    ],
    ctaBand: {
      heading: 'Tired of workarounds and spreadsheets?',
      body: 'Tell us what slows your team down. We will build the tool that fixes it, for good.',
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
    heroTitle: 'Cloud hosting that grows with your clients',
    oneLiner:
      'We set up and look after cloud hosting, so your agency stops worrying about downtime, traffic spikes or broken releases.',
    sections: {
      capabilities: {
        label: 'What we build',
        title: 'What we set up and look after',
        subtitle: 'We do more than switch on a server and hope for the best.',
      },
      process: {
        label: 'How it works',
        title: 'Four steps to reliable hosting',
        subtitle: 'A careful process, so nothing breaks along the way.',
      },
      pricing: {
        label: 'What it costs',
        title: 'Three tiers, every price public',
        subtitle: 'From a first cloud setup to platforms that run in several regions.',
      },
    },
    buyerSituations: situationsFrom('cloudEngineering'),
    deliverables: deliverablesFrom('cloudEngineering'),
    stack: ['AWS, Google Cloud or Azure', 'Terraform or Pulumi', 'Automatic testing and release (CI/CD)', 'Containers', 'Logging and monitoring'],
    capabilities: [
      {
        title: 'Written down as code',
        description:
          'Your whole cloud setup is written down as code, so it can be checked, repeated and rebuilt at any time.',
      },
      {
        title: 'Moving to the cloud',
        description:
          'We plan the right setup on AWS, Google Cloud or Azure, then move you there with no downtime and no lost data.',
      },
      {
        title: 'Tested updates',
        description: 'Every update is built, tested and released automatically. No more manual releases or broken updates.',
      },
      {
        title: 'Monitoring',
        description: 'Logs, tracing and alerts show what is happening, so problems are found before your clients notice.',
      },
      {
        title: 'Security and compliance',
        description: 'Access controls, private networks and encryption, ready for standards like SOC 2, HIPAA and GDPR.',
      },
      {
        title: 'Predictable costs',
        description: 'Servers sized to what you need, which grow for traffic spikes and keep your cloud bill predictable.',
      },
    ],
    processSteps: [
      {
        phase: 'Phase 01',
        title: 'Review',
        description: 'We review your current hosting and report the risks before we change anything.',
      },
      {
        phase: 'Phase 02',
        title: 'Plan',
        description: 'We plan the provider, security and growth. You approve before we set anything up.',
      },
      {
        phase: 'Phase 03',
        title: 'Build',
        description: 'We set everything up as code, add tested releases and monitoring, then move your apps.',
      },
      {
        phase: 'Phase 04',
        title: 'Monitor',
        description: 'We keep watching, tune performance and review costs, so it stays reliable and affordable.',
      },
    ],
    faqs: [
      {
        question: 'How much does cloud engineering cost?',
        answer: costAnswer('cloudEngineering'),
      },
      {
        question: 'What support do you offer after launch?',
        answer: supportAnswer('cloudEngineering'),
      },
      PAYMENT_PLANS_FAQ,
    ],
    ctaBand: {
      heading: 'Ready to move to the cloud?',
      body: 'Tell us about your hosting today, and we will plan a setup that can grow with your clients.',
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
