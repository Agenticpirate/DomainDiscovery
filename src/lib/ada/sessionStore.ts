/**
 * In-memory ADA chat session store (server).
 * Survives hot reloads via globalThis; multi-instance deploys need Redis later.
 */

import type { ChatClientMessage, ChatResponse } from './chatTypes';
import type { IntakeState } from './intakeSession';

export type AdaChatSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatClientMessage[];
  intake: IntakeState | null;
  maxBudgetUsd?: number;
  lastEngine?: string;
  lastShortlist?: string[];
  turnCount: number;
};

type Store = Map<string, AdaChatSession>;

declare global {
  // eslint-disable-next-line no-var
  var __adaChatSessions: Store | undefined;
}

const MAX_SESSIONS = 500;
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

function store(): Store {
  if (!globalThis.__adaChatSessions) {
    globalThis.__adaChatSessions = new Map();
  }
  return globalThis.__adaChatSessions;
}

export function newSessionId(): string {
  return `ada_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSession(id: string): AdaChatSession | null {
  const s = store().get(id);
  if (!s) return null;
  if (Date.now() - new Date(s.updatedAt).getTime() > MAX_AGE_MS) {
    store().delete(id);
    return null;
  }
  return s;
}

export function createSession(partial?: {
  maxBudgetUsd?: number;
  intake?: IntakeState | null;
}): AdaChatSession {
  prune();
  const id = newSessionId();
  const now = new Date().toISOString();
  const session: AdaChatSession = {
    id,
    createdAt: now,
    updatedAt: now,
    messages: [],
    intake: partial?.intake ?? null,
    maxBudgetUsd: partial?.maxBudgetUsd,
    turnCount: 0,
  };
  store().set(id, session);
  return session;
}

export function upsertSession(
  id: string | undefined,
  update: {
    messages?: ChatClientMessage[];
    intake?: IntakeState | null;
    maxBudgetUsd?: number;
    lastResponse?: ChatResponse;
  }
): AdaChatSession {
  prune();
  let session = id ? getSession(id) : null;
  if (!session) {
    session = createSession({ maxBudgetUsd: update.maxBudgetUsd, intake: update.intake });
  }

  if (update.messages) {
    // Keep last 40 turns
    session.messages = update.messages.slice(-40);
  }
  if (update.intake !== undefined) session.intake = update.intake;
  if (update.maxBudgetUsd != null) session.maxBudgetUsd = update.maxBudgetUsd;
  if (update.lastResponse) {
    session.lastEngine = update.lastResponse.engine;
    session.lastShortlist = update.lastResponse.domains?.shortlist?.map((d) => d.domain);
    session.turnCount += 1;
  }
  session.updatedAt = new Date().toISOString();
  store().set(session.id, session);
  return session;
}

function prune() {
  const s = store();
  if (s.size <= MAX_SESSIONS) return;
  const entries = Array.from(s.entries()).sort(
    (a, b) => new Date(a[1].updatedAt).getTime() - new Date(b[1].updatedAt).getTime()
  );
  const drop = entries.length - MAX_SESSIONS;
  for (let i = 0; i < drop; i++) s.delete(entries[i][0]);
}

export function sessionStats() {
  return { count: store().size, max: MAX_SESSIONS, maxAgeHours: 24 };
}
