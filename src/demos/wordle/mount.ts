/* Wordle demo island — vanilla TS, no framework. Mounted lazily by the
   deep-dive page when the panel scrolls into view; all scoring happens in
   the worker. */

import { ALL_GREEN, patternOf, type ScoredGuess } from './engine';
import { ENTROPY_OPENER, MINIMAX_OPENER } from './openers';
import type { SolveResponse } from './worker';
import './demo.css';

type AgentId = 'entropy' | 'minimax';
/** manual: you score each guess by clicking tiles.
    typed: you supply the word and the demo scores every guess for you.
    auto: the demo picks a random word and solves it. */
type Mode = 'manual' | 'typed' | 'auto';

type AgentState = {
  history: { guess: string; pattern: number }[];
  /** Feedback rows already confirmed, for the board. */
  rows: { guess: string; pattern: number }[];
  proposal: string;
  topGuesses: ScoredGuess[];
  candidatesRemaining: number;
  /** Manual mode: feedback being composed on the proposal row. */
  pending: number[];
  searching: boolean;
  solved: boolean;
  /** Contradictory feedback emptied the candidate set. */
  dead: boolean;
};

const AGENT_META: Record<AgentId, { title: string; desc: string; opener: ScoredGuess[] }> = {
  entropy: {
    title: 'entropy',
    desc: 'Risk-neutral: maximizes expected information gain per guess — the best on average.',
    opener: ENTROPY_OPENER,
  },
  minimax: {
    title: 'minimax',
    desc: 'Risk-averse: minimizes the worst-case number of surviving candidates',
    opener: MINIMAX_OPENER,
  },
};

const ANSWER_COUNT = 2315;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

export function mount(root: HTMLElement): void {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  const pendingResolvers = new Map<AgentId, (r: SolveResponse) => void>();
  let readyResolve: ((word: string) => void) | null = null;
  let randomResolve: ((word: string) => void) | null = null;
  let checkResolve: ((valid: boolean) => void) | null = null;

  worker.onmessage = (event: MessageEvent<SolveResponse>) => {
    const msg = event.data;
    if (msg.type === 'ready') readyResolve?.(msg.randomAnswer);
    else if (msg.type === 'random') randomResolve?.(msg.word);
    else if (msg.type === 'checked') checkResolve?.(msg.valid);
    else if (msg.type === 'solved') {
      pendingResolvers.get(msg.agent)?.(msg);
      pendingResolvers.delete(msg.agent);
    }
  };

  const workerReady = new Promise<string>((resolve) => (readyResolve = resolve));
  worker.postMessage({ type: 'init' });

  function requestSolve(agent: AgentId, history: AgentState['history']): Promise<SolveResponse> {
    return new Promise((resolve) => {
      pendingResolvers.set(agent, resolve);
      worker.postMessage({ type: 'solve', agent, history });
    });
  }

  function requestRandomWord(): Promise<string> {
    return new Promise((resolve) => {
      randomResolve = resolve;
      worker.postMessage({ type: 'random' });
    });
  }

  /** Is this a word the agents know? Checked in the worker, which owns the lists. */
  function requestCheck(word: string): Promise<boolean> {
    return new Promise((resolve) => {
      checkResolve = resolve;
      worker.postMessage({ type: 'check', word });
    });
  }

  /* ---------- state ---------- */

  let mode: Mode = 'manual';
  let secret: string | null = null; // auto mode only
  let autoRun = 0; // invalidates in-flight auto loops on reset
  const agents: Record<AgentId, AgentState> = {
    entropy: freshAgent('entropy'),
    minimax: freshAgent('minimax'),
  };

  function freshAgent(id: AgentId): AgentState {
    return {
      history: [],
      rows: [],
      proposal: AGENT_META[id].opener[0].word,
      topGuesses: AGENT_META[id].opener,
      candidatesRemaining: ANSWER_COUNT,
      pending: [0, 0, 0, 0, 0],
      searching: false,
      solved: false,
      dead: false,
    };
  }

  /* ---------- skeleton ---------- */

  root.textContent = '';
  root.classList.add('wd');

  const typedBtn = el('button', { type: 'button', 'aria-pressed': 'true' }, 'Type a word');
  const manualBtn = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Score it myself');
  const autoBtn = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Random word');
  const resetBtn = el('button', { type: 'button' }, 'Reset');

  const wordInput = el('input', {
    class: 'wd-input',
    type: 'text',
    maxlength: '5',
    autocapitalize: 'off',
    autocomplete: 'off',
    spellcheck: 'false',
    placeholder: 'five letters',
    'aria-label': 'Secret word for the agents to solve',
  });
  const wordSubmit = el('button', { type: 'submit', class: 'wd-solve' }, 'Solve it');
  const wordForm = el('form', { class: 'wd-word-form' }, wordInput, wordSubmit);

  const status = el('p', { class: 'wd-status', 'aria-live': 'polite' });
  const agentsWrap = el('div', { class: 'wd-agents' });
  const panels: Record<AgentId, HTMLElement> = {
    entropy: el('section', { class: 'wd-agent', 'aria-label': 'Entropy agent' }),
    minimax: el('section', { class: 'wd-agent', 'aria-label': 'Minimax agent' }),
  };
  agentsWrap.append(panels.entropy, panels.minimax);

  root.append(
    el('div', { class: 'wd-controls' }, typedBtn, manualBtn, autoBtn, resetBtn),
    wordForm,
    status,
    agentsWrap
  );

  /* ---------- rendering ---------- */

  function feedbackName(fb: number): string {
    return ['gray', 'yellow', 'green'][fb] ?? 'gray';
  }

  function renderRow(guess: string, pattern: number): HTMLElement {
    const row = el('div', {
      class: 'wd-row',
      role: 'img',
      'aria-label': `${guess.toUpperCase()}: ${guess
        .split('')
        .map((ch, i) => `${ch} ${feedbackName(Math.floor(pattern / 3 ** i) % 3)}`)
        .join(', ')}`,
    });
    for (let i = 0; i < 5; i++) {
      row.append(
        el('span', { class: 'wd-tile', 'data-fb': String(Math.floor(pattern / 3 ** i) % 3), 'aria-hidden': 'true' }, guess[i])
      );
    }
    return row;
  }

  function renderAgent(id: AgentId): void {
    const state = agents[id];
    const meta = AGENT_META[id];
    const panel = panels[id];
    panel.textContent = '';

    const count = el(
      'span',
      { class: 'wd-count', 'aria-live': 'polite' },
      state.solved
        ? 'solved ✓'
        : state.dead
          ? 'no candidates'
          : `${state.candidatesRemaining.toLocaleString()} candidates`
    );
    if (state.solved) count.setAttribute('data-solved', '');

    panel.append(
      el('div', { class: 'wd-agent-head' }, el('span', { class: 'label' }, meta.title), count),
      el('p', { class: 'wd-agent-desc' }, meta.desc)
    );

    const board = el('div', { class: 'wd-board' });
    for (const row of state.rows) board.append(renderRow(row.guess, row.pattern));

    // Proposal row: clickable tiles in manual mode, static in auto mode.
    if (!state.solved && !state.dead) {
      if (state.searching) {
        board.append(el('span', { class: 'wd-searching' }, 'searching…'));
      } else if (mode === 'manual') {
        const row = el('div', { class: 'wd-row' });
        for (let i = 0; i < 5; i++) {
          const tile = el(
            'button',
            {
              class: 'wd-tile',
              'data-fb': String(state.pending[i]),
              type: 'button',
              'aria-label': `${state.proposal[i]}, position ${i + 1}, ${feedbackName(state.pending[i])}. Activate to cycle.`,
            },
            state.proposal[i]
          );
          tile.addEventListener('click', () => {
            state.pending[i] = (state.pending[i] + 1) % 3;
            renderAgent(id);
          });
          row.append(tile);
        }
        const submit = el('button', { type: 'button' }, 'Mark & continue');
        submit.addEventListener('click', () => submitFeedback(id));
        board.append(row, el('div', { class: 'wd-row-actions' }, submit));
      } else {
        board.append(renderProposalStatic(state));
      }
    }
    panel.append(board);

    if (state.dead) {
      panel.append(
        el(
          'p',
          { class: 'wd-agent-desc' },
          'No word matches that feedback — one of the marks is off. Reset and try again.'
        )
      );
    }

    // Show the top-ranked guesses and their scores, so it's clear why the
    // agent picked the word it did.
    if (!state.solved && !state.dead && state.topGuesses.length > 0) {
      const table = el('table', { class: 'wd-top' });
      table.append(
        el('caption', { class: 'label' }, id === 'entropy' ? 'top guesses by expected bits' : 'top guesses by worst case'),
        el(
          'thead',
          {},
          el('tr', {}, el('th', { scope: 'col' }, 'guess'), el('th', { scope: 'col' }, 'e[bits]'), el('th', { scope: 'col' }, 'worst case'))
        )
      );
      const tbody = el('tbody');
      for (const g of state.topGuesses.slice(0, 5)) {
        const tr = el(
          'tr',
          g.word === state.proposal ? { 'data-chosen': '' } : {},
          el('td', { class: 'wd-word' }, g.word),
          el('td', {}, g.bits.toFixed(3)),
          el('td', {}, String(g.worstCase))
        );
        tbody.append(tr);
      }
      table.append(tbody);
      panel.append(table);
    }
  }

  function renderProposalStatic(state: AgentState): HTMLElement {
    const row = el('div', { class: 'wd-row', 'aria-label': `Proposed guess ${state.proposal.toUpperCase()}` });
    for (let i = 0; i < 5; i++) {
      row.append(el('span', { class: 'wd-tile', 'aria-hidden': 'true' }, state.proposal[i]));
    }
    return row;
  }

  function renderAll(): void {
    renderAgent('entropy');
    renderAgent('minimax');
  }

  function setStatus(text: string | Node): void {
    status.textContent = '';
    status.append(text);
  }

  /* ---------- manual mode ---------- */

  async function submitFeedback(id: AgentId): Promise<void> {
    const state = agents[id];
    const pattern = state.pending.reduce((acc, fb, i) => acc + fb * 3 ** i, 0);
    state.rows.push({ guess: state.proposal, pattern });
    state.history.push({ guess: state.proposal, pattern });
    state.pending = [0, 0, 0, 0, 0];

    if (pattern === ALL_GREEN) {
      state.solved = true;
      state.candidatesRemaining = 1;
      renderAgent(id);
      return;
    }

    await advance(id);
  }

  /** Ask the worker for the next guess. The "searching…" state only appears
      if the search takes longer than 150ms, so fast searches don't flicker. */
  async function advance(id: AgentId): Promise<void> {
    const state = agents[id];
    const slow = setTimeout(() => {
      state.searching = true;
      renderAgent(id);
    }, 150);
    const response = await requestSolve(id, state.history);
    clearTimeout(slow);
    state.searching = false;
    if (response.type !== 'solved') return;

    state.candidatesRemaining = response.candidatesRemaining;
    state.topGuesses = response.topGuesses;
    if (response.candidatesRemaining === 0 || response.topGuesses.length === 0) {
      state.dead = true;
    } else {
      state.proposal = response.topGuesses[0].word;
    }
    renderAgent(id);
  }

  /* ---------- auto mode ---------- */

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Play both agents against a known word, scoring every guess automatically.
      Used by the typed and random modes. */
  async function runAuto(providedWord?: string): Promise<void> {
    const run = ++autoRun;
    secret = providedWord ?? (await requestRandomWord());
    if (run !== autoRun) return;
    resetAgents();
    renderAll();
    const secretEl = el('span', { class: 'wd-secret' }, secret);
    const line = el('span', {}, 'Solving ', secretEl, ' — watch the candidate counts collapse.');
    setStatus(line);

    await Promise.all(
      (['entropy', 'minimax'] as AgentId[]).map(async (id) => {
        const state = agents[id];
        for (let turn = 0; turn < 10 && run === autoRun; turn++) {
          await delay(turn === 0 ? 600 : 900);
          if (run !== autoRun) return;
          const pattern = patternOf(state.proposal, secret!);
          state.rows.push({ guess: state.proposal, pattern });
          state.history.push({ guess: state.proposal, pattern });
          if (pattern === ALL_GREEN) {
            state.solved = true;
            state.candidatesRemaining = 1;
            renderAgent(id);
            return;
          }
          await advance(id);
          if (state.dead) return;
        }
      })
    );

    if (run === autoRun) {
      const entropyTurns = agents.entropy.rows.length;
      const minimaxTurns = agents.minimax.rows.length;
      setStatus(
        `Done: entropy in ${entropyTurns}, minimax in ${minimaxTurns}. ` +
          (entropyTurns === minimaxTurns
            ? 'A tie this time.'
            : 'Run it again — the gap moves around.')
      );
    }
  }

  /* ---------- wiring ---------- */

  function resetAgents(): void {
    agents.entropy = freshAgent('entropy');
    agents.minimax = freshAgent('minimax');
  }

  function setMode(next: Mode): void {
    mode = next;
    autoRun++;
    typedBtn.setAttribute('aria-pressed', String(next === 'typed'));
    manualBtn.setAttribute('aria-pressed', String(next === 'manual'));
    autoBtn.setAttribute('aria-pressed', String(next === 'auto'));
    wordForm.hidden = next !== 'typed';
    resetAgents();

    if (next === 'typed') {
      wordInput.value = '';
      setStatus(
        'Type a word — it has to be one of the 2,315 possible Wordle answers — and the demo scores every guess for you.'
      );
      renderAll();
      wordInput.focus();
    } else if (next === 'manual') {
      setStatus(
        'Think of a five-letter word. Both agents guess independently: click each tile to mark it gray, yellow, or green, then continue.'
      );
      renderAll();
    } else {
      void runAuto();
    }
  }

  /** Flash the input red so a rejected word is unmistakable, not just a
      status-line change the eye may skip. */
  let invalidTimer: number | undefined;
  function flagInvalid(message: string): void {
    setStatus(message);
    wordInput.setAttribute('aria-invalid', 'true');
    wordInput.setAttribute('data-invalid', '');
    window.clearTimeout(invalidTimer);
    invalidTimer = window.setTimeout(() => wordInput.removeAttribute('data-invalid'), 1200);
    wordInput.focus();
  }

  wordInput.addEventListener('input', () => {
    wordInput.removeAttribute('data-invalid');
    wordInput.removeAttribute('aria-invalid');
  });

  wordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const word = wordInput.value.trim().toLowerCase();
    if (!/^[a-z]{5}$/.test(word)) {
      flagInvalid('Five letters, a–z.');
      return;
    }
    setStatus('Checking…');
    if (!(await requestCheck(word))) {
      flagInvalid(`“${word}” isn’t one of the 2,315 possible Wordle answers — try another.`);
      return;
    }
    void runAuto(word);
  });

  typedBtn.addEventListener('click', () => setMode('typed'));
  manualBtn.addEventListener('click', () => setMode('manual'));
  autoBtn.addEventListener('click', () => setMode('auto'));
  resetBtn.addEventListener('click', () => setMode(mode));

  setStatus('Loading word lists…');
  wordForm.hidden = true;
  renderAll();
  void workerReady.then(() => setMode('typed'));
}
