export const siteConfig = {
  name: 'MAPL TECH',
  logo: 'MA|PL TECH',
  // The hero's brand line (flagship/content.ts), as the Organization slogan and the llms.txt tagline.
  tagline: 'The engineering backbone behind your agency',
  // Organization and WebSite JSON-LD, and the first line of llms.txt (which names the services next).
  description:
    "MAPL TECH is the white-label engineering team that works with digital agencies to build what they sell to their clients, under the agency's brand.",
  url: 'https://mapltech.com',
  email: 'contact@mapltech.com',
  social: {
    instagram: 'https://instagram.com/mapltech',
    x: 'https://x.com/mapltech',
    facebook: 'https://facebook.com/mapltech',
    linkedin: 'https://linkedin.com/company/mapltech',
    tiktok: 'https://tiktok.com/@mapltech',
  },
  // Five top-level items in the order a visitor asks (what, proof, cost, who,
  // how to reach you); the logo is the home link. Only Services and About open
  // a menu. The regional pages and the referral program live in the footer.
  nav: [
    { label: 'Services', href: '/services', children: [
      { label: 'Web Development', href: '/services/web-development' },
      { label: 'Automation & AI', href: '/services/automation-ai-workflow-setup' },
      { label: 'Custom Internal Tools', href: '/services/custom-internal-tools' },
      { label: 'Cloud Engineering', href: '/services/cloud-engineering' },
      { label: 'All services', href: '/services' },
    ]},
    { label: 'Work', href: '/our-work' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about-us', children: [
      { label: 'About MAPL TECH', href: '/about-us' },
      // How white-label work runs, for agency founders (Nov 5, 2026).
      { label: 'How we work', href: '/white-label' },
      { label: 'Team', href: '/team' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ]},
    { label: 'Contact', href: '/contact-us' },
  ],
};

/**
 * The Google Business Profile, as it showed on `checked` (Leshan, Nov 5, 2026:
 * the share link and a screenshot of the profile, 5.0 stars from 5 Google
 * reviews). Shown beside each page's first ask (TrustList `rating`) and in
 * llms.txt; never as AggregateRating markup. The rating only, never the number
 * of reviews (Leshan, Nov 5, 2026: "I do not want to say the number of
 * reviews"). Update the rating by hand when the profile changes.
 */
export const googleReviews = {
  url: 'https://share.google/jWt2RucfG1YCKUKvN',
  rating: '5.0',
  checked: '2026-11-05',
} as const;

export const pricing = {
  automation: {
    tiers: [
      {
        name: 'Foundation Automation',
        description: 'For agencies doing CRM work and follow-ups by hand',
        price: '$3,500-$5,000',
        features: [
          'CRM setup for your team',
          'New leads sent to the right person automatically',
          '3 to 5 key automations',
          'Connects to the tools you already use',
          'Written guides and training',
        ],
      },
      {
        name: 'Advanced Automation',
        description: 'For agencies ready to connect all their tools into one flow',
        price: '$6,000-$10,000',
        features: [
          'Automations that work across several tools',
          'Smart intake forms that use AI',
          'Virtual assistant setup',
          'Custom connections between your systems (APIs)',
          'Detailed reports and dashboards',
          'Team training and written guides',
        ],
      },
      {
        name: 'Enterprise AI Workflows',
        description: 'For agencies handling complex, high-volume work, with AI across their operations',
        price: '$10,000-$18,000',
        features: [
          'Custom AI agents built for your work',
          'Forecasts built from your data',
          'Rules and checks for safe, compliant AI',
          'Automation for large, busy teams',
          'Coordination across departments',
          'Dedicated support with agreed response times',
        ],
      },
    ],
    retainers: [
      { name: 'Light Monitoring & Tweaks', price: '$750/month' },
      { name: 'Ongoing Optimization', price: '$1,500-$2,500/month' },
      { name: 'Priority / Multi-Client', price: '$3,000-$5,000/month' },
    ],
  },
  internalTools: {
    tiers: [
      {
        name: 'Internal Dashboards',
        description: 'See the numbers that matter most, live, in one place',
        price: '$5,000-$8,000',
        features: [
          'Custom charts and graphs',
          'Live reports',
          'Access levels for each role',
          'Connections to your other systems',
        ],
      },
      {
        name: 'Client Portals',
        description: 'A branded place where clients see projects, documents and payments',
        price: '$8,000-$15,000',
        features: [
          'Your brand throughout',
          'Secure document sharing',
          'Project tracking and updates',
          'Communication tools',
          'Online payments',
        ],
      },
      {
        name: 'Ops & Reporting Systems',
        description: 'Run your whole agency from one system built around how you work',
        price: '$12,000-$25,000+',
        features: [
          'Manage operations from start to finish',
          'Reports that build themselves',
          'Coordination across teams',
          'Custom analytics',
          'Built to grow with you',
        ],
      },
    ],
    retainers: [
      { name: 'Feature Updates', price: '$1,000-$2,000/month' },
      { name: 'Dedicated Dev Time', price: '$3,000-$6,000/month' },
    ],
  },
  cloudEngineering: {
    tiers: [
      {
        name: 'Starter Cloud Setup',
        description: 'For agencies ready to move off shared hosting to reliable cloud hosting that can grow',
        price: '$5,000-$8,000',
        features: [
          'Cloud setup on AWS, Google Cloud or Azure',
          'Basic automatic testing and deployment',
          'Security certificate (SSL), DNS and domain setup',
          'Your app packaged in containers and put online',
          'Alerts if the site goes down',
          'Written guides and handover',
        ],
      },
      {
        name: 'Production Infrastructure',
        description: 'Separate test and live setups for agencies running important client sites and apps',
        price: '$10,000-$18,000',
        features: [
          'Cloud setup written as code, so it can be rebuilt at any time (Terraform or Pulumi)',
          'Test, preview and live environments',
          'Handles traffic spikes automatically',
          'Logs and monitoring that show problems early',
          'Security hardening and access rules',
          'Database setup and automatic backups',
          'Team training and written guides',
        ],
      },
      {
        name: 'Enterprise Cloud Platform',
        description: 'For agencies whose clients cannot afford downtime, with heavy traffic across several regions',
        price: '$20,000+',
        features: [
          'Runs across several regions and cloud providers',
          'Automatic recovery if a server or region fails',
          'Ready for compliance audits (SOC 2, HIPAA)',
          'Lower cloud bills by sizing resources correctly',
          'Custom networking between services',
          'Dedicated cloud engineering support',
          'Ongoing management with agreed response times',
        ],
      },
    ],
    retainers: [
      { name: 'Infrastructure Monitoring', price: '$1,000-$2,000/month' },
      { name: 'Managed Cloud Operations', price: '$3,000-$6,000/month' },
    ],
  },
  webDevelopment: {
    tiers: [
      {
        name: 'Starter',
        description: 'For clients who need a sharp, fast site without a heavy template',
        price: '$5,000',
        features: [
          'Custom-coded website that works on every screen (up to 7 pages)',
          'Built for phones first, matching your design exactly',
          'Basic SEO setup (page titles and descriptions)',
          'Contact form that sends to your email',
          'Speed tuning (Google Lighthouse score of 90 or more)',
          'Tested on major browsers and devices',
          '30 days of support after launch',
        ],
      },
      {
        name: 'Growth / E-Commerce',
        description: 'For clients who need a site that brings in sales or bookings, not just information',
        price: '$8,500',
        features: [
          'Everything in Starter',
          'Up to 12 pages with content you can update',
          'Easy content editing for your client (WordPress or a headless CMS)',
          'Online store or bookings',
          'Advanced SEO, so Google understands every page',
          'Analytics that track sales and sign-ups',
          'Connections to your CRM, email and payments',
          '60 days of support after launch',
        ],
      },
      {
        name: 'Advanced / AI-Powered',
        description: 'For complex, interactive web platforms that need to grow',
        price: '$12,000',
        features: [
          'Everything in Growth',
          'A custom web application, front end and back end',
          'AI features such as chatbots, recommendations and content',
          'User logins and access levels',
          'Custom connections to the other software your client uses',
          'Live data and content that updates in real time',
          'Automatic testing before every update goes live',
          '90 days of support after launch',
        ],
      },
      {
        name: 'Enterprise',
        description: 'For large platforms that cannot fail, with a dedicated team and careful planning',
        price: 'Custom',
        features: [
          'Everything in Advanced',
          'Dedicated project manager and engineering team',
          'Custom hosting and a safe way to release updates',
          'Several languages and regions',
          'Security audits and compliance checks',
          'Tested under heavy traffic and planned for growth',
          'Ongoing support with agreed response times',
          'Planning sessions every three months',
        ],
      },
    ],
    maintenance: [
      { name: 'Essential Care', price: '$500/month', description: 'Security updates, uptime monitoring, and monthly backups' },
      { name: 'Growth Support', price: '$1,000-$2,000/month', description: 'Bug fixes, content updates, speed tuning and small new features' },
      { name: 'Priority Retainer', price: '$2,500-$5,000/month', description: 'Set developer hours, new features and faster responses' },
    ],
  },
  hourlyRates: {
    standard: '$65-$120/hour',
    emergency: '$150+/hour',
  },
  bundles: [
    {
      name: 'Agency Automation Partner',
      description: 'Like an automation engineer on your team, without the cost of hiring one',
      price: '$4,000-$7,500/month',
      features: [
        'Automation & AI workflows',
        'Support for your internal tools',
        'Priority access and faster responses',
        'Monthly strategy calls',
      ],
    },
    {
      name: 'Full Systems Partner',
      description: 'An engineering team that works with yours on Automation & AI, Custom Internal Tools, Web Development and Cloud Engineering',
      price: '$7,500-$12,000/month',
      features: [
        'Automation & AI workflows',
        'Custom Internal Tools development',
        'Web Development support',
        'Cloud and hosting oversight',
        'One main contact for your team',
        'Planning sessions every three months',
      ],
    },
  ],
};

export const testimonials = [
  {
    // Her Google review (Leshan, Nov 5, 2026: "this is what Alita said"), with the brand set as
    // "MAPL TECH" (Leshan: "In Alita's testimonial it should be MAPL TECH").
    quote:
      'Working with MAPL TECH has been nothing short of incredible. They blew our expectations out of the water and delivered web development far beyond what we imagined. Their team is creative, responsive, and truly committed to bringing your vision to life. We are thrilled with the final product and would highly recommend MAPL TECH to anyone looking for top-tier web development and marketing support.',
    name: 'Alita Fabiano',
    company: 'LRO Staffing',
    role: 'Operations Director',
    kind: 'client',
    // Leshan, Nov 5, 2026: "Use Alita's real image and testimonial from Google", then "Alita's
    // image is in the download folder" (lro-staffing-alita-fabiano.jpg, cropped to her face, 224px).
    image: '/images/testimonials/alita-fabiano.jpg',
  },
  // Not a client quote: this is the verdict of the August 2026 post-launch
  // accessibility audit of chhancr.ca (see caseStudies on the redesign branch).
  // Swap in a signed-off quote from the CHHA-NCR board when one is available.
  {
    quote:
      'Skip links, real landmarks, complete alt text, visible focus states and reduced-motion support: accessibility engineering above what most agencies ship, with every audited colour pair meeting WCAG AA.',
    name: 'Post-launch accessibility audit',
    company: 'CHHA-NCR relaunch',
    role: 'August 2026',
    kind: 'audit',
    image: '',
  },
];

export const portfolioProjects = [
  {
    title: 'Loop',
    slug: 'loop',
    hidden: true, // not listed on /our-work (owner request, 2026-10-16)
    category: 'Web Development',
    description: 'A high-performance, custom-coded web platform engineered for speed, scale, and clean maintainability - built without the constraints of page builders or plugin stacks.',
    tags: ['Web Development', 'Custom Development', 'Performance'],
    image: '/images/mockup-web-dev.svg',
  },
  {
    title: 'LRO Staffing',
    slug: 'lro-staffing',
    order: 1, // listed first on /our-work (lower = earlier; unset = source order)
    category: 'Web Development',
    description: 'Complete website for an Ottawa and Toronto staffing agency: a custom WordPress theme built around job seekers and employers, with job search and alerts, resume submission, eight industry expertise hubs and recruitment insights.',
    tags: ['WordPress', 'Custom Theme', 'Job Search'],
    image: '/images/case-lro-website.jpg',
    url: 'https://www.lrostaffing.com/',
  },
  {
    title: 'Dodo Island Discoveries',
    slug: 'dodo-island-discoveries',
    order: 2, // second on /our-work, after LRO Staffing (owner request, 2026-11-04)
    category: 'Web Development',
    // From the live site (footer: "Website by MAPL TECH"): its own WordPress theme, a page and a
    // booking calendar per tour (dates, places left, "Request Booking"), prices in MUR, USD, EUR or CAD.
    description: 'Complete website for a Mauritius tour company: a custom WordPress theme with a page for each small-group tour, a booking calendar that shows the places left, and prices in four currencies.',
    tags: ['WordPress', 'Custom Theme', 'Tour Booking'],
    image: '/images/case-dodo-island-discoveries.jpg',
    url: 'https://dodoislanddiscoveries.com/',
  },
  {
    title: 'LRO Interactive Salary Guide',
    slug: 'lro-salary-guide',
    category: 'Custom Internal Tools',
    description: 'Interactive salary guide for recruiters and hiring managers: salary comparisons by role, with filters and charts that update as soon as a filter changes.',
    tags: ['Interactive Tool', 'Data Visualization', 'Custom Development'],
    image: '/images/case-lro.jpg',
    url: 'https://www.lrostaffing.com/lro-salary-guide/2026-interactive-salary-guide/',
  },
  {
    title: 'MAPL Tours',
    slug: 'mapl-tours',
    order: 4, // fourth on /our-work: the third project with published results
    category: 'Automation and AI Workflows',
    description: 'Our own product: a travel and tourism company fully managed by AI, from trip planning and booking to customer communication and itinerary generation. Built and run in-house by MAPL TECH.',
    tags: ['Own product', 'AI', 'Automation'],
    image: '/images/case-mapl-tours.jpg',
    url: 'https://mapltours.com/',
  },
  {
    title: 'Akuma Patterson Holdings',
    slug: 'akuma-patterson-holdings',
    hidden: true, // not listed on /our-work (owner request, 2026-10-16)
    category: 'Automation and AI Workflows',
    description: 'Automated the entire client lifecycle - from CRM lead capture to invoicing and project hand-off - eliminating manual data entry.',
    tags: ['Automation', 'CRM', 'AI Workflows'],
    image: '/images/project-akuma-patterson.png',
    url: 'https://akumapatterson.com/',
  },
  {
    title: 'FOCAS Canada',
    slug: 'focas-canada',
    category: 'Web Development',
    description: 'An events website with a member portal, online registration for events and tools for community engagement.',
    tags: ['WordPress', 'Member Portal', 'Events'],
    image: '/images/case-focas-canada.jpg',
    url: 'https://focascanada.org/',
  },
  {
    title: 'Crowned Spice',
    slug: 'crowned-spice',
    category: 'Automation and AI Workflows',
    description: 'Online store automation from start to finish: stock levels kept in sync, shipping that starts automatically and messages to customers after they buy.',
    tags: ['E-commerce', 'Automation', 'Inventory'],
    image: '/images/mockup-ecommerce.svg',
  },
  {
    title: 'Crowngate Business',
    slug: 'crowngate-business',
    hidden: true, // not listed on /our-work (owner request, 2026-10-16)
    category: 'Web Development',
    description: 'Corporate business platform with service showcase, client onboarding workflows, and professional brand presence.',
    tags: ['Corporate', 'Custom Development', 'Branding'],
    image: '/images/mockup-corporate.svg',
    url: 'https://crowngatestore.com/',
  },
  {
    title: 'Tricia Walters',
    slug: 'tricia-walters',
    hidden: true, // not listed on /our-work (owner request, 2026-10-16)
    category: 'Web Development',
    description: 'Personal brand site with CMS-powered content, integrated booking system, and optimized page speed.',
    tags: ['Portfolio', 'CMS', 'Booking'],
    image: '/images/case-tricia-walters.jpg',
    url: 'https://triciawalters.com/',
  },
  {
    title: 'UNSVCC',
    slug: 'unsvcc',
    // What we built is the internal dashboard (its public site is not ours).
    category: 'Custom Internal Tools',
    description: 'Internal operations dashboard with real-time organizational metrics, role-based access, and automated reporting.',
    tags: ['Dashboard', 'Analytics', 'Reporting'],
    image: '/images/case-unsvcc.jpg',
    url: 'https://www.unsvcc.org/',
  },
  {
    title: 'CHHA-NCR',
    slug: 'chha-ncr',
    order: 3, // third on /our-work, after LRO Staffing and Dodo Island Discoveries
    category: 'Web Development',
    description: 'Full relaunch for the Canadian Hard of Hearing Association\'s National Capital Region branch: a guide in five stages, a searchable hearing-clinic directory and WCAG accessibility on every page, on a site volunteers can update themselves.',
    tags: ['Non-Profit', 'Accessibility', 'Web Development'],
    image: '/images/case-chha-ncr.jpg',
    url: 'https://www.chhancr.ca/',
  },
];

/**
 * Projects shown publicly, in display order: `hidden` entries are dropped and
 * `order` pins come first (lower = earlier); the rest keep config order. Use
 * this, not `portfolioProjects`, anywhere a visitor or crawler can see the list.
 */
export function listedProjects() {
  return portfolioProjects
    .filter((p) => !('hidden' in p && p.hidden))
    .map((p, i) => ({ p, i, rank: 'order' in p && typeof p.order === 'number' ? p.order : Infinity }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map(({ p }) => p);
}

// Products MAPL TECH builds and runs in-house (each has a case study on
// /our-work). Proof that the team ships and runs real production systems.
// "Coming soon" entries stay off the site until there is something to show.
export const labsProjects = [
  {
    name: 'MAPL Tours',
    slug: 'mapl-tours',
    status: 'Live',
    tagline: 'A travel company run end-to-end by AI',
    description:
      'A full travel and tourism business where AI handles the entire journey - trip planning, booking, itinerary generation, and customer communication. Our proving ground for production AI: the same agents, pipelines, and infrastructure we build for clients, running a live company 24/7.',
    capabilities: [
      'Autonomous trip planning & booking',
      'AI-generated itineraries',
      'Automated customer communication',
      'Self-operating booking pipeline',
    ],
    image: '/images/project-mapl-tours.jpg',
    url: 'https://mapltours.com',
  },
];

export const careers = [
  // Canada
  {
    title: 'Full-Stack Developer',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Build and maintain custom web applications, internal tools and automation pipelines for agency clients.',
  },
  {
    title: 'Cloud / DevOps Engineer',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Design, deploy and manage cloud infrastructure on AWS, GCP or Azure. Build CI/CD pipelines, IaC modules and observability stacks for agency clients.',
  },
  // Nigeria
  {
    title: 'Full-Stack Developer',
    type: 'Contract',
    location: 'Lagos / Remote',
    country: 'Nigeria',
    description: 'Build and maintain custom web applications, internal tools and automation pipelines for agency clients across West Africa.',
  },
  {
    title: 'Cloud / DevOps Engineer',
    type: 'Contract',
    location: 'Lagos / Remote',
    country: 'Nigeria',
    description: 'Build and maintain cloud infrastructure, CI/CD pipelines and monitoring systems for agency clients across Africa.',
  },
  {
    title: 'Project Coordinator',
    type: 'Contract',
    location: 'Lagos / Abuja',
    country: 'Nigeria',
    description: 'Keep projects on schedule for our Nigeria branch, and keep our partner agencies up to date.',
  },
  // Jamaica
  {
    title: 'Web Developer',
    type: 'Contract',
    location: 'Kingston / Remote',
    country: 'Jamaica',
    description: 'Develop custom-coded websites and web applications built for Caribbean audiences and local infrastructure.',
  },
  {
    title: 'Client Success Manager',
    type: 'Contract',
    location: 'Kingston / Montego Bay',
    country: 'Jamaica',
    description: 'Look after our partner agencies across the Caribbean for our Jamaica branch: onboarding, ongoing support and keeping projects on track.',
  },
];

// Case-study depth for /our-work/[slug]. Only facts MAPL TECH can stand behind:
// each entry is sourced from delivered work and the August 2026 independent
// audit of the live site. No metrics are invented; where a number is not
// verifiable it is described qualitatively. Add entries as write-ups are approved.
export interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  services: string[];
  stack: string[];
  delivered: string;
  challenge: string;
  solution: string[];
  results: string[];
  sourceNote: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'chha-ncr',
    client: 'CHHA-NCR (Canadian Hard of Hearing Association, National Capital Region)',
    industry: 'Non-profit / accessibility',
    services: ['Web Development', 'Accessibility', 'CMS'],
    stack: ['WordPress', 'Elementor (Hello theme)', 'Rank Math SEO', 'LiteSpeed Cache', 'CanadaHelps donations'],
    delivered: 'Relaunched July 2026',
    challenge:
      'A volunteer-run charity serving people with hearing loss, most of them 55 and over, needed a site its non-technical volunteers could maintain. Its visitors had to be able to read and navigate it, with no information hidden behind clicks or motion.',
    solution: [
      'A five-stage visitor journey as the information architecture: Noticing, Finding Out, Choosing, Living with it, Giving back, each stage a plain-language page with a forward path.',
      'Accessibility engineered in, not bolted on: skip links, real landmarks, complete alt text, visible focus states, reduced-motion support, and an in-house accessibility panel for text size, motion and link underlining.',
      'A directory of local hearing clinics with addresses, tap-to-call numbers and map links, plus an Accessible Ottawa guide to venues with hearing loops.',
      'Volunteer self-service editing on WordPress with performance caching and structured data (Organization, WebSite, WebPage) so the branch stays independent of an agency.',
    ],
    results: [
      'Every audited colour pair meets WCAG AA; an independent August 2026 audit rated the accessibility engineering above what most agencies ship.',
      'Governance transparency the audit called rare at this size: full board bios and published AGM reports.',
      'The journey-stage architecture was noted as ahead of the US national counterpart site.',
    ],
    sourceNote: 'Independent four-track audit of the live site, August 2026 (content, design and accessibility, technical/SEO, peer landscape).',
  },
];
