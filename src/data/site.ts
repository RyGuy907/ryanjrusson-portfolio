/* Site-wide content. Everything a template renders lives here or in
   projects.ts — no copy hardcoded in .astro files (§12). */

export const site = {
  domain: 'ryanjrusson.com',
  url: 'https://ryanjrusson.com',
  name: 'Ryan Russon',
  title: 'Ryan Russon — Software Engineer',
  description:
    'CS senior at BYU with production software in daily use: document automation for a CPA firm, internal apps for a university, and a live site of my own. Graduating December 2026.',
  positioning:
    'CS senior at BYU with production software in daily use: document automation for a CPA firm, internal apps for a university, and a live site of my own. Graduating December 2026.',
};

/* Labeled, no icons-only (§5 Hero). TODO markers render visibly in the page
   until replaced — blocking TODO #7.

   GitHub is deliberately absent (Ryan's call, July 2026): the profile is
   mostly private school repos, and a link only earns its place once there
   are public repos with consistent commits behind it. Re-adding it later is
   appending one entry here. */
export const heroLinks: { label: string; href: string; todo?: boolean }[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ryanjrusson/' },
  { label: 'Resume (PDF)', href: '/ryanjrusson_resume.pdf' }, // stable URL, never renamed
  { label: 'Email', href: 'mailto:ryan.russon7@gmail.com' },
];

export type Role = {
  company: string;
  title: string;
  dates: string;
  line: string; // exactly one sentence — the PDF has the rest
};

export const experience: Role[] = [
  {
    company: 'Pension Assurance LLP',
    title: 'IT & Automation Intern',
    dates: 'June 2026 – present',
    line: 'Worked directly with staff to figure out which processes were worth automating, then built and shipped them.',
  },
  {
    company: 'BYU Law School',
    title: 'Frontend Web Developer',
    dates: 'May 2025 – present',
    line: 'Worked on a six-person team shipping to production — frontend development, AWS maintenance, and coordinating with backend developers.',
  },
  {
    company: 'BYU Continuing Education',
    title: 'QA & Course Support Specialist',
    dates: 'Sept 2024 – May 2025',
    line: 'Checked and corrected content across hundreds of live courses on monthly deadlines.',
  },
  {
    company: 'Panera Bread',
    title: 'Associate Team Lead',
    dates: 'Sept 2021 – Sept 2024',
    line: 'Trained new employees and led assembly during busy shifts and large catering orders.',
  },
];

/* First person, plain, Ryan's own words (July 2026). */
export const about =
  "I study computer science at BYU with a history minor — 3.98 GPA, graduating December 2026. I'm from Agoura Hills, California. What I enjoy most is taking something from a rough idea to a finished tool.";

export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++'] },
  { group: 'Frontend', items: ['React', 'Svelte', 'Astro'] },
  { group: 'Backend & data', items: ['Node/Express', 'MongoDB', 'openpyxl', 'pandas'] },
  {
    group: 'Infrastructure',
    items: [
      'AWS (EC2, ECS, S3, Route 53, CloudWatch, SSM, IAM)',
      'GitHub Actions',
      'Caddy',
      'Docker',
    ],
  },
  { group: 'AI tooling', items: ['Claude API', 'Claude Code'] },
];

/* Interests — same grouped-row treatment as skills: concrete over generic,
   one line each, no prose narrative (§2 bans the journey section). */
export const interests: {
  group: string;
  detail: string;
  /** Optional second line: book titles rendered as italicized <cite> elements. */
  favorites?: string[];
  link?: { label: string; href: string };
  todo?: string;
}[] = [
  {
    group: 'Music',
    detail: 'Piano, 14 years · Trumpet, 10 years',
  },
  {
    group: 'Astronomy',
    detail: 'Apertura AD8 · favorite targets: M7, M13, M27',
  },
  {
    group: 'Geography',
    detail: 'GeoGuessr Level 104 · A Community World, no-moving',
  },
  {
    group: 'History',
    detail: 'University minor and ~25 books a year',
    favorites: [
      'By the Spear',
      'Caesar: Life of a Colossus',
      'Mutiny on the Bounty',
      'American Prometheus',
    ],
    link: {
      label: 'Full reading list',
      href: 'https://docs.google.com/document/d/1-SXa3KFeZtYzSfP7Fe0vYhqZQtghdR24WLZcQXYk8fE/edit?usp=sharing',
    },
  },
];

