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
    ]},
    { label: 'Pricing', href: '/pricing' },
    { label: 'About Us', href: '/about', children: [
      { label: 'About MAPL TECH', href: '/about' },
      { label: 'MAPL TECH Nigeria', href: '/nigeria' },
      { label: 'MAPL TECH Jamaica', href: '/jamaica' },
    ]},
    { label: 'Our Work', href: '/our-work' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Referral', href: '/referral' },
  ],
};

export const pricing = {
  automation: {
    tiers: [
      {
        name: 'Foundation Automation',
        description: 'CRM setup, lead routing and 3–5 automations',
        price: '$3,500–$5,000',
        features: [
          'CRM setup & configuration',
          'Lead routing workflows',
          '3–5 core automations',
          'Integration with existing tools',
          'Documentation & training',
        ],
      },
      {
        name: 'Advanced Automation',
        description: 'Multi-system workflows and AI intake/assistants',
        price: '$6,000–$10,000',
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
        description: 'AI agents, analytics and governance',
        price: '$10,000–$18,000',
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
      { name: 'Ongoing Optimization', price: '$1,500–$2,500/month' },
      { name: 'Priority / Multi-Client', price: '$3,000–$5,000/month' },
    ],
  },
  internalTools: {
    tiers: [
      {
        name: 'Internal Dashboards',
        description: 'Team-facing dashboards with real-time data and role-based views',
        price: '$5,000–$8,000',
        features: [
          'Custom data visualization',
          'Real-time reporting',
          'Role-based access control',
          'API integrations',
        ],
      },
      {
        name: 'Client Portals',
        description: 'Branded portals with project tracking, docs, and payments',
        price: '$8,000–$15,000',
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
        description: 'Full operational platforms with multi-team coordination',
        price: '$12,000–$25,000+',
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
      { name: 'Feature Updates', price: '$1,000–$2,000/month' },
      { name: 'Dedicated Dev Time', price: '$3,000–$6,000/month' },
    ],
  },
  hourlyRates: {
    standard: '$75–$120/hour',
    emergency: '$150+/hour',
  },
  bundles: [
    {
      name: 'Agency Automation Partner',
      description: 'Ongoing automation and AI support for growing agencies',
      price: '$4,000–$7,500/month',
      features: [
        'Automation & AI workflows',
        'Internal tooling support',
        'Priority access & response',
        'Monthly strategy calls',
      ],
    },
    {
      name: 'Full Systems Partner',
      description: 'Complete engineering partnership — automation, tools, web, and infrastructure',
      price: '$7,500–$12,000/month',
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
      'MAPL TECH rebuilt our entire client onboarding pipeline. What used to take our team hours now happens automatically — and our clients notice the difference.',
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
    category: 'Web Development',
    description: 'Full site rebuild with a custom job board, applicant tracking integration, and recruiter-facing dashboards.',
    tags: ['WordPress', 'Custom Development', 'API Integration'],
    image: '/images/mockup-corporate.svg',
  },
  {
    title: 'Akuma Patterson Holdings',
    category: 'Automation and AI Workflows',
    description: 'Automated the entire client lifecycle — from CRM lead capture to invoicing and project hand-off — eliminating manual data entry.',
    tags: ['Automation', 'CRM', 'AI Workflows'],
    image: '/images/mockup-automation.svg',
  },
  {
    title: 'FOCAS Canada',
    category: 'Web Development',
    description: 'Event-driven web platform with member portal, registration workflows, and community engagement tools.',
    tags: ['WordPress', 'Member Portal', 'Events'],
    image: '/images/mockup-event-platform.svg',
  },
  {
    title: 'Tricia Walters',
    category: 'Web Development',
    description: 'Personal brand site with CMS-powered content, integrated booking system, and optimized page speed.',
    tags: ['Portfolio', 'CMS', 'Booking'],
    image: '/images/mockup-web-dev.svg',
  },
  {
    title: 'UNSVCC',
    category: 'Custom Internal Tools',
    description: 'Internal operations dashboard with real-time organizational metrics, role-based access, and automated reporting.',
    tags: ['Dashboard', 'Analytics', 'Reporting'],
    image: '/images/mockup-dashboard.svg',
  },
  {
    title: 'Namaste Tibetan Kitchen',
    category: 'Web Development',
    description: 'Custom restaurant site with online ordering, real-time menu management, and SEO-optimized local search presence.',
    tags: ['Restaurant', 'E-commerce', 'CMS'],
    image: '/images/mockup-restaurant.svg',
  },
  {
    title: 'TDot Jerk',
    category: 'Web Development',
    description: 'Food service site with catering request workflow, multi-location finder, and mobile-first design.',
    tags: ['Restaurant', 'Custom Development', 'Maps'],
    image: '/images/mockup-catering.svg',
  },
  {
    title: 'Crowned Spice',
    category: 'Automation and AI Workflows',
    description: 'End-to-end e-commerce automation — inventory syncing, shipping triggers, and post-purchase communication flows.',
    tags: ['E-commerce', 'Automation', 'Inventory'],
    image: '/images/mockup-ecommerce.svg',
  },
  {
    title: 'colLabb',
    category: 'Custom Internal Tools',
    description: 'Collaborative workspace platform with task management, client reporting dashboards, and team coordination tools.',
    tags: ['Platform', 'Collaboration', 'Reporting'],
    image: '/images/mockup-collab.svg',
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
    description: 'Shape brand identity systems — from visual guidelines to messaging frameworks — for agencies and their clients.',
  },
  {
    title: 'Social Media Manager',
    type: 'Contract',
    location: 'Remote',
    country: 'Canada',
    description: 'Manage and grow social media presence for multiple agency clients.',
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
    description: 'Own client relationships for our Jamaica branch — onboarding, ongoing support, and ensuring project success across the Caribbean.',
  },
];
