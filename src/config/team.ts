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
  // placeholder names listed here before were removed; then "Use Obong's image": his photo
  // (from Leshan, Nov 7, 2026: an 800px studio portrait, cropped at its own pixels to a 340px
  // square on his face for the 44-56px circle). Add a bio once one is approved.
  // Leshan (Nov 5, 2026): "Obong is a WordPress developer"; then (Nov 6, 2026): "change Obong
  // to Web Developer".
  {
    name: 'Obong Uko',
    title: 'Web Developer',
    country: 'Nigeria',
    department: 'Engineering',
    image: '/images/team/obong-uko.jpg',
    linkedin: 'https://www.linkedin.com/in/obong-uko/',
  },

  // Jamaica
  // Leshan (Nov 5, 2026): "Make Andre williams a Full-stack Developer" (the old tourism bio no
  // longer fits, so it went).
  {
    name: 'Andre Williams',
    title: 'Full-stack Developer',
    country: 'Jamaica',
    department: 'Engineering',
    image: '/images/team/placeholder.jpg',
  },
  // Leshan (Nov 5, 2026): "Make Keisha Brown a Project Manager" (the old frontend bio no longer
  // fits, so it went) and "Remove Michael Thompson".
  {
    name: 'Keisha Brown',
    title: 'Project Manager',
    country: 'Jamaica',
    department: 'Operations',
    image: '/images/team/placeholder.jpg',
  },
];

export const countries: Country[] = ['Canada', 'Nigeria', 'Jamaica'];
export const departments: Department[] = ['Engineering', 'Product', 'Design', 'Operations', 'Leadership'];
