export const siteConfig = {
  name: 'MAPL TECH',
  logo: 'MA|PL TECH',
  tagline: 'The Engineering Backbone Behind Leading Agencies',
  description:
    'MAPL TECH is the engineering partner agencies call when projects demand real systems, intelligent automation, and scalable infrastructure.',
  url: 'https://mapltech.com',
  email: 'contact@mapltech.com',
  phone: '+1 (647) 375-6724',
  social: {
    instagram: 'https://instagram.com/mapltech',
    x: 'https://x.com/mapltech',
    facebook: 'https://facebook.com/mapltech',
    linkedin: 'https://linkedin.com/company/mapltech',
    tiktok: 'https://tiktok.com/@mapltech',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services/web-development', children: [
      { label: 'Web Development', href: '/services/web-development' },
      { label: 'Automation & AI', href: '/services/automation-ai-workflow-setup' },
      { label: 'Custom Internal Tools', href: '/services/custom-internal-tools' },
      { label: 'Cloud Engineering', href: '/services/cloud-engineering' },
    ]},
    { label: 'Pricing', href: '/pricing' },
    { label: 'About Us', href: '/about-us', children: [
      { label: 'About MAPL TECH', href: '/about-us' },
      { label: 'MAPL TECH Nigeria', href: '/nigeria' },
      { label: 'MAPL TECH Jamaica', href: '/jamaica' },
    ]},
    { label: 'Our Work', href: '/our-work' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Referral', href: '/referral' },
  ],
};

export const pricing = {
  automation: {
    tiers: [
      {
        name: 'Foundation Automation',
        description: 'Perfect for agencies drowning in manual CRM work and follow-ups',
        price: '$3,500-$5,000',
        features: [
          'CRM setup & configuration',
          'Lead routing workflows',
          '3-5 core automations',
          'Integration with existing tools',
          'Documentation & training',
        ],
      },
      {
        name: 'Advanced Automation',
        description: 'For agencies ready to connect every tool into one seamless pipeline',
        price: '$6,000-$10,000',
        features: [
          'Multi-system workflow automation',
          'AI-powered intake forms',
          'Virtual assistant setup',
          'Custom API integrations',
          'Advanced analytics & reporting',
          'Team training & documentation',
        ],
      },
      {
        name: 'Enterprise AI Workflows',
        description: 'Full AI-powered operations for agencies handling complex, high-volume work',
        price: '$10,000-$18,000',
        features: [
          'Custom AI agent development',
          'Predictive analytics pipelines',
          'AI governance & compliance',
          'Enterprise-scale automation',
          'Multi-department orchestration',
          'Dedicated support & SLA',
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
        description: 'Give your team instant visibility into the numbers that matter most',
        price: '$5,000-$8,000',
        features: [
          'Custom data visualization',
          'Real-time reporting',
          'Role-based access control',
          'API integrations',
        ],
      },
      {
        name: 'Client Portals',
        description: 'Impress clients with a branded hub for projects, docs, and payments',
        price: '$8,000-$15,000',
        features: [
          'Branded client experience',
          'Secure document sharing',
          'Project tracking & updates',
          'Communication tools',
          'Payment integration',
        ],
      },
      {
        name: 'Ops & Reporting Systems',
        description: 'Run your entire agency from one platform built around your workflow',
        price: '$12,000-$25,000+',
        features: [
          'End-to-end operations management',
          'Automated reporting pipelines',
          'Multi-team coordination',
          'Custom analytics engine',
          'Scalable architecture',
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
        description: 'For agencies ready to move off shared hosting and into reliable, scalable infrastructure',
        price: '$5,000-$8,000',
        features: [
          'Cloud provider setup (AWS, GCP, or Azure)',
          'Basic CI/CD pipeline configuration',
          'SSL, DNS, and domain management',
          'Application deployment & containerization',
          'Uptime monitoring & alerting',
          'Documentation & handoff',
        ],
      },
      {
        name: 'Production Infrastructure',
        description: 'Multi-environment cloud architecture for agencies running serious client workloads',
        price: '$10,000-$18,000',
        features: [
          'Infrastructure as Code (Terraform / Pulumi)',
          'Staging, production, and preview environments',
          'Auto-scaling & load balancing',
          'Logging, monitoring, and observability stack',
          'Security hardening & IAM policies',
          'Database provisioning & backup automation',
          'Team training & documentation',
        ],
      },
      {
        name: 'Enterprise Cloud Platform',
        description: 'Mission-critical infrastructure for agencies managing high-traffic, multi-region deployments',
        price: '$20,000+',
        features: [
          'Multi-region & multi-cloud architecture',
          'Disaster recovery & failover automation',
          'Compliance & audit readiness (SOC 2, HIPAA)',
          'Cost optimization & resource right-sizing',
          'Custom service mesh & networking',
          'Dedicated DevOps engineering support',
          'SLA-backed ongoing management',
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
        description: 'For agencies that need a sharp, fast site without the bloat of page builders',
        price: '$5,000',
        features: [
          'Custom-coded responsive website (up to 7 pages)',
          'Mobile-first, pixel-perfect build',
          'Basic SEO setup and meta optimization',
          'Contact form with email integration',
          'Performance optimization (90+ Lighthouse)',
          'Cross-browser and device testing',
          '30-day post-launch support',
        ],
      },
      {
        name: 'Growth / E-Commerce',
        description: 'Your clients need more than a brochure site - they need a site that drives revenue',
        price: '$8,500',
        features: [
          'Everything in Starter',
          'Up to 12 pages with dynamic content',
          'CMS integration (headless or WordPress)',
          'E-commerce or booking functionality',
          'Advanced SEO architecture and schema markup',
          'Analytics and conversion tracking setup',
          'API integrations (CRM, email, payments)',
          '60-day post-launch support',
        ],
      },
      {
        name: 'Advanced / AI-Powered',
        description: 'For agencies building complex, interactive web platforms that need to scale',
        price: '$12,000',
        features: [
          'Everything in Growth',
          'Full-stack custom web application',
          'AI-powered features (chatbots, recommendations, content)',
          'User authentication and role-based access',
          'Custom API development and third-party integrations',
          'Real-time data processing and dynamic content',
          'Automated testing and CI/CD pipeline',
          '90-day post-launch support',
        ],
      },
      {
        name: 'Enterprise',
        description: 'Large-scale, mission-critical platforms that need dedicated engineering and architecture planning',
        price: 'Custom',
        features: [
          'Everything in Advanced',
          'Dedicated project manager and engineering team',
          'Custom infrastructure and deployment architecture',
          'Multi-language and multi-region support',
          'Enterprise security audits and compliance',
          'Load testing and scalability planning',
          'SLA-backed ongoing support and maintenance',
          'Quarterly roadmap and strategy sessions',
        ],
      },
    ],
    maintenance: [
      { name: 'Essential Care', price: '$500/month', description: 'Security updates, uptime monitoring, and monthly backups' },
      { name: 'Growth Support', price: '$1,000-$2,000/month', description: 'Bug fixes, content updates, performance tuning, and minor feature additions' },
      { name: 'Priority Retainer', price: '$2,500-$5,000/month', description: 'Dedicated dev hours, feature development, and priority response times' },
    ],
  },
  hourlyRates: {
    standard: '$65-$120/hour',
    emergency: '$150+/hour',
  },
  bundles: [
    {
      name: 'Agency Automation Partner',
      description: 'Like having a senior automation engineer on staff for a fraction of the cost',
      price: '$4,000-$7,500/month',
      features: [
        'Automation & AI workflows',
        'Internal tooling support',
        'Priority access & response',
        'Monthly strategy calls',
      ],
    },
    {
      name: 'Full Systems Partner',
      description: 'Your dedicated engineering department - automation, tools, web, and infrastructure all handled',
      price: '$7,500-$12,000/month',
      features: [
        'Automation & AI workflows',
        'Internal tools development',
        'Web development support',
        'Infrastructure oversight',
        'Dedicated team liaison',
        'Quarterly roadmap planning',
      ],
    },
  ],
};

export const testimonials = [
  {
    quote:
      'MAPL TECH rebuilt our entire client onboarding pipeline. What used to take our team hours now happens automatically - and our clients notice the difference.',
    name: 'Mimi Akuma',
    company: 'Akuma Patterson Holdings',
    role: 'CEO',
    image: '/images/headshot-mimi.jpg',
  },
  {
    quote:
      'They don\'t feel like an outside vendor. MAPL TECH embedded into our workflow, learned our tools, and shipped production-ready code that our own devs could maintain.',
    name: 'Alita Fabiano',
    company: 'LRO Staffing',
    role: 'Operations Director',
    image: '/images/headshot-alita.jpg',
  },
  {
    quote:
      'We stopped wasting time patching together fragile WordPress plugins. MAPL TECH gave us a clean, fast, custom-coded site that actually performs.',
    name: 'James Chen',
    company: 'Digital Partners Co.',
    role: 'Technical Director',
    image: '/images/headshot-james.jpg',
  },
];

export const portfolioProjects = [
  {
    title: 'LRO Staffing',
    category: 'Custom Internal Tools',
    description: 'Interactive salary guide tool with dynamic filtering, real-time data visualization, and role-based salary benchmarking for recruiters and hiring managers.',
    tags: ['Interactive Tool', 'Data Visualization', 'Custom Development'],
    image: '/images/project-lro-staffing.jpg',
    url: 'https://www.lrostaffing.com/lro-salary-guide/2026-interactive-salary-guide/',
  },
  {
    title: 'Akuma Patterson Holdings',
    category: 'Automation and AI Workflows',
    description: 'Automated the entire client lifecycle - from CRM lead capture to invoicing and project hand-off - eliminating manual data entry.',
    tags: ['Automation', 'CRM', 'AI Workflows'],
    image: '/images/project-akuma-patterson.png',
    url: 'https://akumapatterson.com/',
  },
  {
    title: 'FOCAS Canada',
    category: 'Web Development',
    description: 'Event-driven web platform with member portal, registration workflows, and community engagement tools.',
    tags: ['WordPress', 'Member Portal', 'Events'],
    image: '/images/mockup-event-platform.svg',
  },
  {
    title: 'TDot Jerk',
    category: 'Web Development',
    description: 'Food service site with catering request workflow, multi-location finder, and mobile-first design.',
    tags: ['Restaurant', 'Custom Development', 'Maps'],
    image: '/images/mockup-catering.svg',
    url: 'https://tdotjerk.ca/',
  },
  {
    title: 'Crowned Spice',
    category: 'Automation and AI Workflows',
    description: 'End-to-end e-commerce automation - inventory syncing, shipping triggers, and post-purchase communication flows.',
    tags: ['E-commerce', 'Automation', 'Inventory'],
    image: '/images/mockup-ecommerce.svg',
  },
  {
    title: 'Crowngate Business',
    category: 'Web Development',
    description: 'Corporate business platform with service showcase, client onboarding workflows, and professional brand presence.',
    tags: ['Corporate', 'Custom Development', 'Branding'],
    image: '/images/mockup-corporate.svg',
    url: 'https://crowngatestore.com/',
  },
  {
    title: 'Tashi Delek',
    category: 'Web Development',
    description: 'Restaurant website with cultural storytelling, menu showcase, and location-driven local SEO for Tibetan cuisine.',
    tags: ['Restaurant', 'CMS', 'Local SEO'],
    image: '/images/mockup-restaurant.svg',
    url: 'https://tdcafe.com/',
  },
  {
    title: 'Tricia Walters',
    category: 'Web Development',
    description: 'Personal brand site with CMS-powered content, integrated booking system, and optimized page speed.',
    tags: ['Portfolio', 'CMS', 'Booking'],
    image: '/images/project-trisha-walters.webp',
  },
  {
    title: 'UNSVCC',
    category: 'Web Development',
    description: 'Internal operations dashboard with real-time organizational metrics, role-based access, and automated reporting.',
    tags: ['Dashboard', 'Analytics', 'Reporting'],
    image: '/images/unsvcc.webp',
    url: 'https://www.unsvcc.org/',
  },
  {
    title: 'Namaste Tibetan Kitchen',
    category: 'Web Development',
    description: 'Custom restaurant site with online ordering, real-time menu management, and SEO-optimized local search presence.',
    tags: ['Restaurant', 'E-commerce', 'CMS'],
    image: '/images/mockup-portal.svg',
    url: 'https://namastekitchen.ca/',
  },
];

export const careers = [
  // Canada
  {
    title: 'SEO Expert',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Drive organic growth for agency clients through technical SEO audits, keyword strategy, and measurable ranking improvements.',
  },
  {
    title: 'Copywriter',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Write conversion-focused copy for landing pages, email sequences, and campaigns across our agency client portfolio.',
  },
  {
    title: 'Brand Specialist',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Shape brand identity systems - from visual guidelines to messaging frameworks - for agencies and their clients.',
  },
  {
    title: 'Social Media Manager',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Manage and grow social media presence for multiple agency clients.',
  },
  {
    title: 'Cloud Engineer',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Design, deploy, and manage cloud infrastructure on AWS, GCP, or Azure. Build CI/CD pipelines, IaC modules, and observability stacks for agency clients.',
  },
  {
    title: 'Coding Instructor',
    type: 'Contract',
    location: 'Ottawa, ON',
    country: 'Canada',
    description: 'Teach coding fundamentals and web development to aspiring developers.',
  },
  {
    title: 'Coding Instructor',
    type: 'Contract',
    location: 'Toronto, ON',
    country: 'Canada',
    description: 'Teach coding fundamentals and web development to aspiring developers.',
  },
  // Nigeria
  {
    title: 'Full-Stack Developer',
    type: 'Contract',
    location: 'Lagos / Remote',
    country: 'Nigeria',
    description: 'Build and maintain custom web applications, internal tools, and automation pipelines for agency clients across West Africa.',
  },
  {
    title: 'Cloud / DevOps Engineer',
    type: 'Contract',
    location: 'Lagos / Remote',
    country: 'Nigeria',
    description: 'Build and maintain cloud infrastructure, CI/CD pipelines, and monitoring systems for agency clients across Africa.',
  },
  {
    title: 'Project Coordinator',
    type: 'Contract',
    location: 'Lagos / Abuja',
    country: 'Nigeria',
    description: 'Manage project timelines, client communication, and deliverables for our Nigeria branch operations.',
  },
  // Jamaica
  {
    title: 'Web Developer',
    type: 'Contract',
    location: 'Kingston / Remote',
    country: 'Jamaica',
    description: 'Develop custom-coded websites and web applications optimized for Caribbean audiences and local infrastructure.',
  },
  {
    title: 'Client Success Manager',
    type: 'Contract',
    location: 'Kingston / Montego Bay',
    country: 'Jamaica',
    description: 'Own client relationships for our Jamaica branch - onboarding, ongoing support, and ensuring project success across the Caribbean.',
  },
];
