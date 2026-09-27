import type { FaqItem } from '@/lib/schema';

/**
 * The six pricing FAQs as published on /pricing today. Rendered by the native
 * <details> accordion and emitted verbatim as FAQPage JSON-LD, so the DOM and
 * the structured data can never disagree.
 */
export const pricingFaq: FaqItem[] = [
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
  {
    question: 'Do you offer payment plans?',
    answer:
      'Yes. We typically split projects into milestone-based payments - a deposit to start, a mid-project payment, and a final payment at launch. We will work out a structure that fits your cash flow.',
  },
];
