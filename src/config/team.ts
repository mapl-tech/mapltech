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
  /** The name without a title: the key every map and the /team anchor (#mercy-akuma) use. */
  name: string;
  /** Said before the name wherever it is shown ("Dr."); JSON-LD honorificPrefix. */
  honorific?: string;
  /** The degree, for JSON-LD honorificSuffix ("PhD"); never shown beside "Dr.". */
  credentials?: string;
  title: string;
  bio: string;
  linkedin: string;
  image?: string;
}

export const executives: Executive[] = [
  {
    name: 'Leshan Patterson',
    // "Co-founder": a prefixed compound keeps its second part lower case, as in "Co-founders, MAPL TECH".
    title: 'Co-founder & Director',
    bio: 'Leshan Patterson is Co-founder and Director of MAPL TECH. He leads how our systems are designed and built, including automation and performance. He specializes in web platforms, AI-powered applications and large business systems. Leshan sets the technical direction in every country we work in.',
    linkedin: 'https://www.linkedin.com/in/lpattersonn/',
    image: '/images/team/leshan-patterson.jpg',
  },
  {
    name: 'Mercy Akuma',
    // Leshan, Nov 5, 2026: "Mercy is a doctor", "Phd".
    honorific: 'Dr.',
    credentials: 'PhD',
    title: 'Co-founder & Director',
    bio: 'Dr. Mercy Akuma is Co-founder and Director of MAPL TECH. She leads our growth in new countries, our partnerships and the expansion of our operations. She makes sure the work in every country follows the company’s long-term plan.',
    linkedin: 'https://www.linkedin.com/in/mercyakuma/',
    image: '/images/team/mercy-akuma.jpg',
  },
];

/** The name as shown: with its title where there is one ("Dr. Mercy Akuma"). */
export function displayName(member: { name: string; honorific?: string }): string {
  return member.honorific ? `${member.honorific} ${member.name}` : member.name;
}

export const teamMembers: TeamMember[] = [
  // Canada
  {
    name: 'Daniel Okafor',
    title: 'Senior Full-Stack Engineer',
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

  // Nigeria. Leshan (Nov 5, 2026): Obong Uko (linkedin.com/in/obong-uko) is our only team
  // member in Nigeria, so the three names listed here before were removed. Add Obong with the
  // title, city, photo and bio he approves; until then the directory and llms.txt skip Nigeria.

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
