# ryanjrusson.com

Personal portfolio. Astro 5, static output, plain CSS, no client framework.

## Principles

- **The landing page ships under 15 KB of JavaScript** (currently under 1 KB —
  two tiny progressive-enhancement scripts). No hydration, no client routing.
- **Demos are islands, not dependencies.** Each demo owns its directory under
  `src/demos/<name>/` — engine, worker, UI, styles. It mounts lazily when
  scrolled into view, fetches its data on demand, and the page it lives on is
  complete without it. JavaScript disabled ⇒ full write-up, one-line note where
  the demo was.
- **Content lives in data.** `src/data/projects.ts` is a typed array; adding a
  project is appending an object. No copy is hardcoded in templates.
- **Compute runs in a Web Worker.** The Wordle solver scores guesses off the
  main thread; searches longer than 150 ms show a progress state.

## Stack

Astro 5 · TypeScript · plain CSS custom properties · self-hosted subset fonts
(Bricolage Grotesque, Public Sans, Martian Mono) · Cloudflare Pages.

## Develop

```sh
npm install
npm run dev      # localhost:4321
npm run build    # static output in dist/
```

## Scripts

| Script | Purpose |
|---|---|
| `scripts/og-image.mjs` | Regenerates the Open Graph image (`public/og.png`) |
| `scripts/compute-openers.mjs` | Recomputes both Wordle agents' opening guesses (committed as constants in `src/demos/wordle/openers.ts`) |
| `scripts/benchmark.mjs` | Benchmarks both agents over all 2,315 answers; feeds `src/data/wordleBenchmark.ts` |
| `scripts/find-divergence.mjs` | Finds games where the two agents' paths diverge (used to pick the walkthrough) |
| `scripts/set-pdf-title.mjs` | Sets the resume PDF's Title metadata to match its public filename |

Word lists in `public/data/wordle/` are the standard public Wordle answer and
allowed-guess lists. The resume is served at the stable path
`/ryanjrusson_resume.pdf` — never rename it; it's the URL printed on the
resume and LinkedIn.
