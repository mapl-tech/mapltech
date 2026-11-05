export type Country = 'Canada' | 'Nigeria' | 'Jamaica';
export type Department = 'Engineering' | 'Product' | 'Design' | 'Operations' | 'Leadership';

export interface TeamMember {
  name: string;
  /** Left out until the person approves one; the directory then shows the LinkedIn link alone. */
  title?: string;
  country: Country;
  department?: Department;
  bio?: string;
  linkedin?: string;
  /** A real photo in public/images/team; placeholder.jpg means none (initials are shown). */
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
  // Canada (the founders are in executives). The three placeholder names listed here before
  // were removed (Nov 5, 2026). Names, titles and LinkedIn as Leshan gave them; add photos and
  // bios once they are approved.
  // Leshan (Nov 5, 2026): "Sahil is a Cloud Engineer".
  {
    name: 'Sahil Banati',
    title: 'Cloud Engineer',
    country: 'Canada',
    department: 'Engineering',
    linkedin: 'https://www.linkedin.com/in/sahil-banati-a4172029b/',
  },
  // Leshan (Nov 5, 2026): "Add Cristina Marin as a project manager on Canada".
  {
    name: 'Cristina Marin',
    title: 'Project Manager',
    country: 'Canada',
    department: 'Operations',
  },

  // Nigeria. Leshan (Nov 5, 2026): "This is our only team member in Nigeria", so the three
  // placeholder names listed here before were removed; then "Use Obong's image": set `image`
  // to '/images/team/obong-uko.jpg' once that file is in public/images/team. Add a bio once
  // one is approved.
  // Leshan (Nov 5, 2026): "Obong is a WordPress developer".
  {
    name: 'Obong Uko',
    title: 'WordPress Developer',
    country: 'Nigeria',
    department: 'Engineering',
    linkedin: 'https://www.linkedin.com/in/obong-uko/',
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
