export type Country = 'Canada' | 'Nigeria' | 'Jamaica';
export type Department = 'Engineering' | 'Product' | 'Design' | 'Operations' | 'Leadership';

export interface TeamMember {
  name: string;
  title: string;
  country: Country;
  department: Department;
  bio: string;
  linkedin?: string;
  image?: string;
}

export interface Executive {
  name: string;
  title: string;
  bio: string;
  linkedin: string;
  image?: string;
}

export const executives: Executive[] = [
  {
    name: 'Leshan Patterson',
    title: 'Co-Founder & Director',
    bio: 'Leshan Patterson is Co-Founder and Director of MAPL TECH. He leads how our systems are designed and built, including automation and speed. He specializes in fast web platforms, AI-powered applications and large business systems built to grow. Leshan sets the technical direction in every country we work in, so everything we build is fast, secure and ready to scale.',
    linkedin: 'https://www.linkedin.com/in/lpattersonn/',
    image: '/images/team/leshan-patterson.jpg',
  },
  {
    name: 'Mercy Akuma',
    title: 'Co-Founder & Director',
    bio: 'Mercy Akuma is Co-Founder and Director of MAPL TECH. She leads our growth in new countries, our partnerships and the expansion of our operations. She makes sure the work in every country follows the company’s long-term plan, so MAPL TECH runs with precision and discipline as it grows.',
    linkedin: 'https://www.linkedin.com/in/mercyakuma/',
    image: '/images/team/mercy-akuma.jpg',
  },
];

export const teamMembers: TeamMember[] = [
  // Canada
  {
    name: 'Daniel Okafor',
    title: 'Senior Full Stack Engineer',
    country: 'Canada',
    department: 'Engineering',
    bio: 'Leads AI integration and SaaS platform development, building scalable systems that power complex agency operations.',
    image: '/images/team/placeholder.jpg',
  },
  {
    name: 'Sarah Chen',
    title: 'UX & Conversion Strategist',
    country: 'Canada',
    department: 'Design',
    bio: 'Architects performance-driven design systems that translate business objectives into measurable conversion outcomes.',
    image: '/images/team/placeholder.jpg',
  },
  {
    name: 'Dwight Patterson',
    title: 'AI Engineer',
    country: 'Canada',
    department: 'Engineering',
    bio: 'Designs and implements AI-powered systems, intelligent automation workflows, and machine learning solutions that drive operational efficiency for agency clients.',
    image: '/images/team/placeholder.jpg',
  },

  // Nigeria
  {
    name: 'Adebayo Oluwaseun',
    title: 'E-Commerce Systems Engineer',
    country: 'Nigeria',
    department: 'Engineering',
    bio: 'Specializes in payment system integrations and scalable e-commerce storefronts built for high-volume African markets.',
    image: '/images/team/placeholder.jpg',
  },
  {
    name: 'Chioma Eze',
    title: 'Backend Developer',
    country: 'Nigeria',
    department: 'Engineering',
    bio: 'Designs robust API architectures and database systems that support enterprise-grade applications across West Africa.',
    image: '/images/team/placeholder.jpg',
  },
  {
    name: 'Emeka Nwosu',
    title: 'Product Implementation Lead',
    country: 'Nigeria',
    department: 'Product',
    bio: 'Drives regional enterprise solution delivery, coordinating between engineering teams and local business requirements.',
    image: '/images/team/placeholder.jpg',
  },

  // Jamaica
  {
    name: 'Andre Williams',
    title: 'Tourism Platform Specialist',
    country: 'Jamaica',
    department: 'Engineering',
    bio: 'Builds booking systems and hospitality technology platforms optimized for Caribbean tourism and travel industries.',
    image: '/images/team/placeholder.jpg',
  },
  {
    name: 'Keisha Brown',
    title: 'Frontend Developer',
    country: 'Jamaica',
    department: 'Engineering',
    bio: 'Crafts high-performance marketing sites and interactive web experiences with a focus on speed and accessibility.',
    image: '/images/team/placeholder.jpg',
  },
  {
    name: 'Michael Thompson',
    title: 'Technical Project Coordinator',
    country: 'Jamaica',
    department: 'Operations',
    bio: 'Manages client execution and delivery timelines, ensuring projects ship on schedule with consistent quality standards.',
    image: '/images/team/placeholder.jpg',
  },
];

export const countries: Country[] = ['Canada', 'Nigeria', 'Jamaica'];
export const departments: Department[] = ['Engineering', 'Product', 'Design', 'Operations', 'Leadership'];
