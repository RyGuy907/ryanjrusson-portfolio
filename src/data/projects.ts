import type { ImageMetadata } from 'astro';
import byuLaw from '../assets/byu-law.png';
import cpeTracker from '../assets/cpe-tracker.png';
import norhog from '../assets/norhog.png';
import soc1Tool from '../assets/soc1.png';
import wordleAssist from '../assets/wordle-assist.png';

export type Project = {
  id: string; // also the card's anchor, so a deep dive can link back to it
  order: number;
  title: string;
  context: string; // "Pension Assurance LLP · Professional"
  summary: string[]; // paragraphs
  tags: string[];
  links?: { label: string; href: string }[];
  /* `note` renders as a small caption below the image. */
  image?: { src: ImageMetadata; alt: string; note?: string };
  deepDive?: string; // route path, if one exists
  hasDemo?: boolean; // shows the "interactive" badge on the card
};

export const projects: Project[] = [
  {
    id: 'soc1',
    order: 1,
    title: 'SOC 1 Automation Suite',
    context: 'Pension Assurance LLP · Professional',
    summary: [
      'An automation tool that reads a SOC 1 Type 2 report and produces the firm’s filled-in review workpapers, flagging uncertainties for review. A SOC 1 review can include up to 2 hours of manual reading and scanning; the tool removes much of the manual searching, with a reviewer still verifying the result. A companion Excel add-in lets reviewers run the tool and work the flagged items without leaving the workpaper.',
      'Uses an algorithmic, deterministic matching approach (no LLM layer), and accuracy is measured against existing completed reports. In testing, the tool exhibits zero high-confidence match errors. The suite continues in 02.',
    ],
    tags: ['Python', 'PyMuPDF', 'openpyxl', 'Excel add-in', 'Flask'],
    image: {
      src: soc1Tool,
      alt: 'The SOC 1 review tool with a sample report beside the generated workpaper rows',
      note: 'All report and workpaper content shown is fabricated sample data.',
    },
  },
  {
    id: 'firm-tools',
    order: 2,
    title: 'CPE Tracker & Proposal Generator',
    context: 'Pension Assurance LLP · Professional',
    summary: [
      'The other two tools in the suite, built on the same architecture as the SOC 1 pipeline.',
      'The CPE tracker turns a folder of continuing-education certificates — different providers and layouts, some scanned — into the firm’s filled compliance spreadsheet, flagging anything uncertain for review.',
      'The proposal generator builds a complete engagement package — cover letter, marketing body, engagement letter, merged PDF — from internal templates and request data pulled via the Smartsheet API. Both were 10–20 minute manual processes, now made near-instant.',
    ],
    tags: [
      'Python',
      'Smartsheet API',
      'pdfplumber',
      'pypdf',
      'openpyxl',
      'OOXML',
      'tesseract OCR',
    ],
    image: {
      src: cpeTracker,
      alt: 'The CPE tracker reviewer showing a sample certificate beside the fields read from it',
      note: 'All certificates and personal details shown are fabricated sample data.',
    },
  },
  {
    id: 'norhog',
    order: 3,
    title: 'norhog.com',
    context: 'Personal · Live',
    summary: [
      'A history trivia quiz app — React frontend, Node/Express service, MongoDB Atlas, live scoring over WebSocket. Runs on EC2 under pm2 behind Caddy for TLS.',
      'CI/CD pipeline: GitHub Actions runs frontend and service test suites in parallel; both must pass before a deploy job that activates on a push to main. GitHub OIDC authenticates with IAM role assumption — removing the need for AWS keys in repository secrets — and the build produces a tarball and pushes it to S3, triggering deployment through AWS SSM. If a deploy fails, the server automatically rolls back to the previous release.',
    ],
    tags: ['React', 'Node/Express', 'MongoDB', 'GitHub Actions', 'OIDC', 'EC2', 'SSM', 'Caddy'],
    links: [
      { label: 'Live site', href: 'https://norhog.com' },
      { label: 'Source', href: 'https://github.com/RyGuy907/norhog' },
    ],
    image: {
      src: norhog,
      alt: 'norhog.com — the history trivia site live in production',
    },
  },
  {
    id: 'byu-law',
    order: 4,
    title: 'BYU Law School',
    context: 'Professional',
    summary: [
      'Frontend developer on a 6-person team maintaining two production applications for BYU Law School — the school’s public website and an internal data-management app — serving 500+ users. Migrated both from React to Svelte using AI-assisted tooling, keeping feature parity throughout, and maintained on AWS (ECS, S3, Route 53, CloudWatch) in coordination with backend developers.',
      'Built user lookup and input validation into the internal app to cut manual data entry, and enhanced search capabilities and site layouts among other updates to the public site — linked below.',
    ],
    links: [{ label: 'Public site', href: 'https://law.byu.edu' }],
    tags: ['React', 'Svelte', 'AWS ECS', 'S3', 'Route 53', 'CloudWatch'],
    image: {
      src: byuLaw,
      alt: 'The BYU Law School public website — one of two production applications migrated from React to Svelte',
    },
  },
  {
    id: 'wordle',
    order: 5,
    title: 'Wordle Solver',
    context: 'Self-directed final project · Academic',
    summary: [
      'Two agents solving Wordle from a shared belief state — a Bayes filter that prunes the 2,315 possible answers after every guess. One picks guesses risk-neutrally, maximizing expected information gain; the other is risk-averse, minimizing the worst case. Benchmarked over every possible answer, and against a human player.',
    ],
    tags: ['Python', 'TypeScript', 'POMDP', 'entropy', 'minimax', 'Web Workers'],
    links: [{ label: 'Source', href: 'https://github.com/RyGuy907/wordle-solver' }],
    image: {
      src: wordleAssist,
      alt: 'Terminal running the Python Wordle assistant beside a solved Wordle board — candidates collapse from 2,315 to 1 and the puzzle is solved in four guesses',
    },
    deepDive: '/work/wordle',
    hasDemo: true,
  },
];

/** Smaller projects, listed without cards or screenshots. Ordered by how
    uncommon the work is, same as the cards above. */
export const alsoBuilt: string[] = [
  'CI/CD and observability for a Node/React app — OIDC deploys to AWS ECS, custom Grafana metrics, Playwright E2E suite',
  'AI agents — Reversi tournament agent with minimax and alpha-beta pruning, Bayes-filter robot localization, value-iteration planning under uncertainty',
  'Serverless social feed on AWS Lambda / DynamoDB / S3',
  'Datalog interpreter in C++ — lexer, parser, relational-algebra evaluator, graph-based rule optimizer',
  'Client/server chess in Java — MySQL persistence, WebSocket gameplay, terminal UI',
];
