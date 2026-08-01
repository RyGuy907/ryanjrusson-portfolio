import type { ImageMetadata } from 'astro';
import byuLaw from '../assets/byu-law.png';
import cpeTracker from '../assets/cpe-tracker.png';
import norhog from '../assets/norhog.png';
import soc1Tool from '../assets/soc1.png';
import wordleAssist from '../assets/wordle-assist.png';

export type SplitSpec = {
  /* The reconciliation split: unstructured input → structured output (§6). */
  leftLabel: string;   // monospace stage label under the left panel, e.g. "EXTRACT"
  rightLabel: string;  // stage label under the right panel, e.g. "WRITE"
  leftAlt: string;     // description of the left artifact for alt/aria
  rightAlt: string;
};

export type MediaSpec = {
  /* Placeholder reconciliation split, rendered until real media exists. */
  split?: SplitSpec;
  /* Real screenshot/diagram — takes precedence over the split. `note`
     renders as a small caption below the image. */
  image?: { src: ImageMetadata; alt: string; note?: string };
};

export type Project = {
  id: string;
  order: number;
  title: string;
  context: string; // "Pension Assurance LLP · Professional"
  summary: string[]; // paragraphs
  tags: string[];
  links?: { label: string; href: string }[];
  media?: MediaSpec;
  deepDive?: string; // route path, if one exists
  hasDemo?: boolean; // drives the "interactive" badge on the card
  status?: 'shipped' | 'in-progress'; // maps to --matched / --pending
  /* Visible during development so nothing ships silently unresolved (§8.4).
     Remove entries as they land; the card renders them as warning chips. */
  todos?: string[];
  /* Card renders with a blocking banner and must not deploy until cleared. */
  blocked?: string;
};

export const projects: Project[] = [
  {
    id: 'soc1',
    order: 1,
    title: 'SOC 1 Automation Suite',
    context: 'Pension Assurance LLP · Professional',
    summary: [
      'An automation tool that reads a SOC 1 Type 2 report and produces the firm’s filled-in review workpapers, flagging uncertainties for review. A SOC 1 review can include up to 2 hours of manual reading and scanning; the tool removes much of the manual searching, with a reviewer still verifying the result.',
      'Uses an algorithmic, deterministic matching approach (no LLM layer), and accuracy is measured against existing completed reports. In testing, the tool exhibits zero high-confidence match errors. The suite continues in 02.',
    ],
    tags: ['Python', 'PyMuPDF', 'openpyxl', 'tesseract OCR', 'Flask'],
    media: {
      image: {
        src: soc1Tool,
        alt: 'The SOC 1 review tool with a sample report beside the generated workpaper rows',
        note: 'All report and workpaper content shown is fabricated sample data.',
      },
    },
    status: 'shipped',
  },
  {
    id: 'firm-tools',
    order: 2,
    title: 'CPE Tracker & Proposal Generator',
    context: 'Pension Assurance LLP · Professional',
    summary: [
      'The other two tools in the suite, built on the same architecture as the SOC 1 pipeline.',
      'The CPE tracker turns a folder of continuing-education certificates — different providers and layouts, some scanned — into the firm’s filled compliance spreadsheet, flagging anything uncertain for review.',
      'The proposal generator builds a complete engagement package — cover letter, marketing body, engagement letter, merged PDF — from internal templates and data sheets. Both were 10–20 minute manual processes, now made near-instant.',
    ],
    tags: ['Python', 'PyMuPDF', 'openpyxl', 'OOXML', 'tesseract OCR'],
    media: {
      image: {
        src: cpeTracker,
        alt: 'The CPE tracker reviewer showing a sample certificate beside the fields read from it',
        note: 'All certificates and personal details shown are fabricated sample data.',
      },
    },
    status: 'shipped',
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
    /* No repo link — GitHub is off the site by Ryan's decision (see site.ts). */
    links: [{ label: 'Live site', href: 'https://norhog.com' }],
    media: {
      image: {
        src: norhog,
        alt: 'norhog.com — the history trivia site live in production',
      },
    },
    status: 'shipped',
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
    media: {
      image: {
        src: byuLaw,
        alt: 'The BYU Law School public website — one of two production applications migrated from React to Svelte',
      },
    },
    status: 'shipped',
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
    media: {
      image: {
        src: wordleAssist,
        alt: 'Terminal running the Python Wordle assistant beside a solved Wordle board — candidates collapse from 2,315 to 1 and the puzzle is solved in four guesses',
      },
    },
    deepDive: '/work/wordle',
    hasDemo: true,
    status: 'shipped',
  },
  /*
   * 05 — Chess engine. CONDITIONAL (§5 card 05): include only if the AI
   * opponent is actually built; otherwise it stays in `alsoBuilt` below.
   * Blocking TODO #6 — Ryan decides. Card copy is drafted in the spec.
   */
];

/** "Also built" list — no cards, no screenshots (§5). Ordered least-common
    first, same scarcity logic as the main cards. */
export const alsoBuilt: string[] = [
  'CI/CD and observability for a Node/React app — OIDC deploys to AWS ECS, custom Grafana metrics, Playwright E2E suite',
  'AI agents — Reversi tournament agent with minimax and alpha-beta pruning, Bayes-filter robot localization, value-iteration planning under uncertainty',
  'Serverless social feed on AWS Lambda / DynamoDB / S3',
  'Datalog interpreter in C++ — lexer, parser, relational-algebra evaluator, graph-based rule optimizer',
  'Client/server chess in Java — MySQL persistence, WebSocket gameplay, terminal UI',
];
