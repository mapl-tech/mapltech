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
 *
 * Simplify pass (Nov 2026): pricing questions only, in plain words. The three
 * build questions (your designs, technologies, rebuilding without downtime)
 * live on the Web Development page's FAQ (services.ts).
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
    answer: `It uses the same prices as this page. Each answer matches a published package, and an add-on moves you to the package that includes it. ${web.name} prices are starting prices, so a ${web.name} range runs from one package’s price to the next. You get a fixed quote after a 20-minute call.`,
  },
  {
    question: `How long does a typical ${web.name} project take?`,
    answer:
      'Starter sites usually take 3 to 4 weeks. Growth / E-Commerce projects take 5 to 8 weeks. Advanced and Enterprise builds are planned one by one, and most launch within 8 to 14 weeks. We agree a clear timeline with you at the start and stick to it.',
  },
  {
    question: 'Do you offer payment plans?',
    answer:
      'Yes. We usually split a project into milestone payments: a deposit to start, a payment mid-project and a final payment at launch. We can agree a schedule that fits your cash flow.',
  },
  {
    question: 'Can we pay monthly instead of per project?',
    answer: `Yes. Every service has monthly plans, starting at ${formatMoney(web.monthlyFrom)} a month for ${web.name} maintenance. Two bundles cover several services for one monthly price: ${bundles}.`,
  },
  {
    question: 'What happens after the site launches?',
    answer: `Every ${web.name} package includes support after launch, for 30 to 90 days depending on the package. After that, monthly maintenance from ${formatMoney(web.monthlyFrom)} a month keeps the site secure, fast and up to date.`,
  },
  {
    question: 'What does urgent work cost?',
    answer: `Urgent fixes and AI specialist work are billed at our emergency rate, ${priceText(pricing.hourlyRates.emergency)} an hour. Standard work is ${priceText(pricing.hourlyRates.standard)} an hour. Choosing Rush in the estimator adds the emergency rate on top of the range.`,
  },
];
