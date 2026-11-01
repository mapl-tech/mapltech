import type { FaqItem } from '@/lib/schema';
import { pricing } from '@/config/site';
import { formatMoney, formatRange, parsePriceLabel } from '@/lib/estimate';
import { factsOf, priceText } from './content';

/**
 * The pricing FAQ. Rendered by the native <details> accordion and emitted
 * verbatim as FAQPage JSON-LD, so the DOM and the structured data can never
 * disagree. Answers come from the live site's published FAQ (dashes removed,
 * two unsourced claims cut: "most clients choose a maintenance plan" and
 * "your visitors never see a broken page") and from the price list itself,
 * read from site.ts so a price change updates the answers too.
 */

const web = factsOf('web');
const bundles = pricing.bundles
  .map((bundle) => {
    const parsed = parsePriceLabel(bundle.price);
    return `${bundle.name} at ${formatRange(parsed.low, parsed.high)} a month`;
  })
  .join(' and ');

export const pricingFaq: FaqItem[] = [
  {
    question: 'How accurate is the estimator?',
    answer:
      `It reads the same price list this page publishes. Each answer maps to a published tier, add-ons move a line to the tier that includes them, and support maps to a published monthly line. ${web.name} tiers are starting prices, so a ${web.name} range runs from one tier’s price to the next. The fixed quote comes after a 20-minute scoping call.`,
  },
  {
    question: `How long does a typical ${web.name} project take?`,
    answer:
      'Starter sites typically ship in 3–4 weeks. Growth / E-Commerce projects run 5–8 weeks. Advanced and Enterprise builds are scoped individually, but most launch within 8–14 weeks. We give you a clear timeline during discovery and stick to it.',
  },
  {
    question: 'Do you offer payment plans?',
    answer:
      'Yes. We typically split projects into milestone payments: a deposit to start, a mid-project payment and a final payment at launch. We will work out a structure that fits your cash flow.',
  },
  {
    question: 'Do you offer monthly retainers instead of project pricing?',
    answer: `Yes. Every service line has monthly maintenance or retainer lines, starting at ${formatMoney(web.monthlyFrom)} a month for ${web.name} maintenance. Two partner bundles cover several lines as one monthly partnership: ${bundles}.`,
  },
  {
    question: 'What happens after the site launches?',
    answer: `Every ${web.name} plan includes post-launch support, 30 to 90 days depending on the tier. After that, monthly maintenance from ${formatMoney(web.monthlyFrom)} a month keeps the site secure, fast and up to date.`,
  },
  {
    question: 'What does urgent work cost?',
    answer: `Urgent fixes and AI specialist work are billed at the emergency rate, ${priceText(pricing.hourlyRates.emergency)} an hour; standard work is ${priceText(pricing.hourlyRates.standard)} an hour. The estimator’s Rush option adds the emergency rate on top of the range.`,
  },
  {
    question: 'Do you work with our existing designs, or do you handle design too?',
    answer:
      'Both. Most agencies bring their own designs and we build pixel-perfect from Figma, Sketch or XD files. If you need design support, we can collaborate with your team or connect you with a design partner.',
  },
  {
    question: 'What technologies do you build with?',
    answer:
      'We use the right tool for each project: React, Next.js, WordPress (custom themes, not page builders), Node.js, Python and more. Every decision is based on your project’s requirements, not our preferences.',
  },
  {
    question: 'Can you rebuild our existing site without downtime?',
    answer:
      'Yes. We build the new site on a staging environment, migrate the content, test everything, then switch over with no downtime.',
  },
];
