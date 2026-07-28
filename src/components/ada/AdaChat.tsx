'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ADA_BRAND } from '@/lib/adaConfig';
import type { RankedDomain } from '@/lib/agent/types';
import { DomainRankCard } from '@/components/assistant/DomainRankCard';
import { DOMAIN_STRATEGIES } from '@/lib/agent/domainStrategies';
import type { IntakeState } from '@/lib/ada/intakeSession';

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  domains?: RankedDomain[];
  engine?: string;
  streaming?: boolean;
};

const SESSION_KEY = 'ada_chat_session_v1';

/** Ready-made examples first-time users can tap */
const EXAMPLE_BRIEFS = [
  {
    label: 'Fitness gym',
    blurb: 'Local gym for busy professionals',
    prompt: 'Fitness gym for busy professionals who want short workouts',
  },
  {
    label: 'Yoga studio',
    blurb: 'Calm yoga for beginners',
    prompt: 'Modern yoga studio for beginners and busy professionals',
  },
  {
    label: 'SaaS product',
    blurb: 'Analytics tool for online stores',
    prompt: 'B2B SaaS analytics platform for ecommerce brands',
  },
  {
    label: 'Pet business',
    blurb: 'Dog grooming shop',
    prompt: 'Pet grooming brand for dogs in the city',
  },
];

/** Plain-English “what we need from you” */
const WHAT_TO_SHARE = [
  {
    step: '1',
    title: 'What is the business?',
    example: '“Fitness gym for busy professionals”',
    tip: 'Industry + who it is for',
  },
  {
    step: '2',
    title: 'Domain endings you like',
    example: '“.com” or “.com .io .ai”',
    tip: 'Or type skip for defaults',
  },
  {
    step: '3',
    title: 'Words to include',
    example: '“fit, strength” or “none”',
    tip: 'Optional brand words',
  },
  {
    step: '4',
    title: 'Words to avoid',
    example: '“cheap, free” or “none”',
    tip: 'Optional block list',
  },
  {
    step: '5',
    title: 'Naming style',
    example: '“radio test, brandable, short”',
    tip: 'Or type skip for smart defaults',
  },
  {
    step: '6',
    title: 'Budget (optional)',
    example: '“20” for about $20/year research',
    tip: 'Not a charge — research only',
  },
];

const STEP_HELP: Record<
  string,
  { title: string; ask: string; examples: { label: string; value: string }[] }
> = {
  business: {
    title: 'Step 1 · Business',
    ask: 'In one sentence: what do you sell and who is it for?',
    examples: [
      { label: 'Gym', value: 'Fitness gym for busy professionals' },
      { label: 'App', value: 'Mobile app for meal planning families' },
      { label: 'Shop', value: 'Online shop for handmade jewelry' },
    ],
  },
  extensions: {
    title: 'Step 2 · Domain endings',
    ask: 'Which endings do you prefer? (most brands start with .com)',
    examples: [
      { label: '.com only', value: '.com' },
      { label: '.com + .io', value: '.com .io' },
      { label: 'Use defaults', value: 'skip' },
    ],
  },
  include: {
    title: 'Step 3 · Words to include',
    ask: 'Any words that should appear in the domain? (optional)',
    examples: [
      { label: 'fit, strength', value: 'fit, strength' },
      { label: 'No preference', value: 'none' },
    ],
  },
  avoid: {
    title: 'Step 4 · Words to avoid',
    ask: 'Any words you never want in the name?',
    examples: [
      { label: 'cheap, free', value: 'cheap, free' },
      { label: 'Nothing to avoid', value: 'none' },
    ],
  },
  strategies: {
    title: 'Step 5 · Naming style',
    ask: 'How should names feel? Pick styles or skip for defaults.',
    examples: [
      { label: 'Easy to say (radio)', value: 'radio test, brandable, short' },
      { label: 'Keyword / SEO', value: 'keyword, available first, .com priority' },
      { label: 'Smart defaults', value: 'skip' },
    ],
  },
  budget: {
    title: 'Step 6 · Budget',
    ask: 'Max registration research budget in USD? (not a payment)',
    examples: [
      { label: '$15', value: '15' },
      { label: '$20', value: '20' },
      { label: 'Skip', value: 'skip' },
    ],
  },
  ready: {
    title: 'Ready · Get names',
    ask: 'Type rank to generate your shortlist, or change a preference above.',
    examples: [
      { label: 'Rank domains now', value: 'rank' },
      { label: 'Change endings', value: 'change extensions' },
    ],
  },
};

const INTAKE_STEPS = [
  { id: 'business', label: 'Business' },
  { id: 'extensions', label: 'Endings' },
  { id: 'include', label: 'Include' },
  { id: 'avoid', label: 'Avoid' },
  { id: 'strategies', label: 'Style' },
  { id: 'budget', label: 'Budget' },
  { id: 'ready', label: 'Rank' },
] as const;

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadLocalSession(): {
  sessionId?: string;
  messages?: UiMessage[];
  intake?: IntakeState | null;
  budget?: string;
} {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as {
      sessionId?: string;
      messages?: UiMessage[];
      intake?: IntakeState | null;
      budget?: string;
    };
  } catch {
    return {};
  }
}

function saveLocalSession(data: {
  sessionId: string | null;
  messages: UiMessage[];
  intake: IntakeState | null;
  budget: string;
}) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        sessionId: data.sessionId,
        messages: data.messages.slice(-30).map((m, i, arr) =>
          i < arr.length - 4 ? { ...m, domains: undefined } : m
        ),
        intake: data.intake,
        budget: data.budget,
      })
    );
  } catch {
    /* quota */
  }
}

async function consumeSse(
  res: Response,
  handlers: {
    onStatus?: (phase: string, detail?: string) => void;
    onToken?: (text: string) => void;
    onResult?: (data: Record<string, unknown>) => void;
    onError?: (message: string) => void;
  }
) {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const block of parts) {
      const lines = block.split('\n');
      let event = 'message';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        if (event === 'status') {
          handlers.onStatus?.(String(parsed.phase || ''), parsed.detail as string | undefined);
        } else if (event === 'token') {
          handlers.onToken?.(String(parsed.text || ''));
        } else if (event === 'result') {
          handlers.onResult?.(parsed);
        } else if (event === 'error') {
          handlers.onError?.(String(parsed.message || 'Stream error'));
        }
      } catch {
        /* ignore partial */
      }
    }
  }
}

function stepIndex(step?: string | null): number {
  if (!step) return -1;
  const i = INTAKE_STEPS.findIndex((s) => s.id === step);
  return i;
}

function formatMessage(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '$1');
}

export function AdaChat() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<UiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome. Finding a domain is easier if you share a few simple details.\n\nStart with one sentence about your business (example: “Fitness gym for busy professionals”).\n\nI will then ask — one step at a time — about domain endings, words to include or avoid, and naming style. You can always tap an example answer.`,
    },
  ]);
  const [input, setInput] = React.useState('');
  const [budget, setBudget] = React.useState('20');
  const [easyBiz, setEasyBiz] = React.useState('');
  const [easyAudience, setEasyAudience] = React.useState('');
  const [intake, setIntake] = React.useState<IntakeState | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [statusLine, setStatusLine] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const messagesListRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [savedDomains, setSavedDomains] = React.useState<Set<string>>(new Set());
  const skipNextPanelScroll = React.useRef(true);

  function loadSavedDomains(): Set<string> {
    try {
      const raw = localStorage.getItem('ada_saved_domains') || localStorage.getItem('saved_domains');
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as Array<{ domain: string } | string>;
      return new Set(
        arr.map((x) => (typeof x === 'string' ? x : x.domain).toLowerCase()).filter(Boolean)
      );
    } catch {
      return new Set();
    }
  }

  function toggleSaveDomain(domain: string) {
    const key = 'ada_saved_domains';
    const d = domain.toLowerCase();
    try {
      const raw = localStorage.getItem(key);
      let list: Array<{ domain: string; savedAt: number }> = raw ? JSON.parse(raw) : [];
      if (list.some((x) => x.domain.toLowerCase() === d)) {
        list = list.filter((x) => x.domain.toLowerCase() !== d);
      } else {
        list.unshift({ domain: d, savedAt: Date.now() });
        list = list.slice(0, 200);
      }
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* quota */
    }
    setSavedDomains(loadSavedDomains());
  }

  React.useEffect(() => {
    setMounted(true);
    const local = loadLocalSession();
    if (local.sessionId) setSessionId(local.sessionId);
    if (local.budget) setBudget(local.budget);
    if (local.intake) setIntake(local.intake);
    if (local.messages?.length) setMessages(local.messages);
    setSavedDomains(loadSavedDomains());
    // Never drag the window to the chat bottom / footer on first paint
    skipNextPanelScroll.current = true;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  // Keep the latest message visible *inside the chat panel only* — not the page footer
  React.useEffect(() => {
    if (skipNextPanelScroll.current) {
      skipNextPanelScroll.current = false;
      return;
    }
    const list = messagesListRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, statusLine]);

  React.useEffect(() => {
    if (!mounted) return;
    saveLocalSession({ sessionId, messages, intake, budget });
  }, [mounted, sessionId, messages, intake, budget]);

  const isLight = mounted ? theme === 'light' : false;
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/55';
  const faint = isLight ? 'text-slate-500' : 'text-white/40';
  const border = isLight ? 'border-slate-200' : 'border-white/[0.09]';
  // Solid surfaces so hero bubble dots stay behind panels, not inside them
  const surface = isLight
    ? 'bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)] border-slate-200'
    : 'bg-[#0a0a0c]';
  const activeStep = stepIndex(intake?.step);
  const showWelcomeOnly = messages.length <= 1 && !loading;

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    setStatusLine(null);
    setInput('');
    const userMsg: UiMessage = { id: uid(), role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    const assistantId = uid();
    setMessages((m) => [
      ...m,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ]);

    try {
      const history = next
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.id !== 'welcome'))
        .map((m) => ({ role: m.role, content: m.content }));

      const payloadMessages =
        history[0]?.role === 'user'
          ? [{ role: 'assistant' as const, content: 'Ready.' }, ...history]
          : history;

      const maxBudgetUsd = budget.trim() ? Number(budget) : undefined;

      const res = await fetch('/api/ada/chat?stream=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: payloadMessages.slice(-20),
          maxBudgetUsd:
            maxBudgetUsd != null && !Number.isNaN(maxBudgetUsd) && maxBudgetUsd > 0
              ? maxBudgetUsd
              : undefined,
          client: 'web',
          intake,
          sessionId,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string; message?: string }).error ||
            (errBody as { message?: string }).message ||
            `HTTP ${res.status}`
        );
      }

      let streamed = '';
      await consumeSse(res, {
        onStatus: (phase, detail) => {
          setStatusLine(detail || phase);
        },
        onToken: (t) => {
          streamed += t;
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === assistantId ? { ...m, content: streamed, streaming: true } : m
            )
          );
        },
        onResult: (data) => {
          if (data.sessionId) setSessionId(String(data.sessionId));
          if (data.intake) setIntake(data.intake as IntakeState);
          else if (data.awaitingIntake === false) setIntake(null);

          const shortlist = (data.domains as { shortlist?: RankedDomain[] } | undefined)
            ?.shortlist;
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: String(data.message || streamed || 'Done.'),
                    domains: shortlist,
                    engine: data.engine as string | undefined,
                    streaming: false,
                  }
                : m
            )
          );
        },
        onError: (message) => {
          setError(message);
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
      setMessages((m) =>
        m.map((msg) =>
          msg.streaming
            ? {
                ...msg,
                content: 'Something went wrong. Try again or open the structured App form.',
                streaming: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      setStatusLine(null);
      // Focus without scrolling the page (prevents jump to footer)
      try {
        inputRef.current?.focus({ preventScroll: true });
      } catch {
        inputRef.current?.focus();
      }
    }
  }

  function resetSession() {
    setIntake(null);
    setSessionId(null);
    localStorage.removeItem(SESSION_KEY);
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: 'Session cleared. Describe your business to start a new brief.',
      },
    ]);
    setError(null);
  }

  const stepHelp = intake?.step ? STEP_HELP[intake.step] : null;

  function startFromEasyForm() {
    const biz = easyBiz.trim();
    const aud = easyAudience.trim();
    if (biz.length < 3) {
      setError('Write what the business is (at least a few words).');
      return;
    }
    const sentence = aud
      ? `${biz} for ${aud}`
      : biz;
    void send(sentence);
  }

  const progressPct =
    activeStep < 0 ? 0 : Math.min(100, Math.round(((activeStep + (intake?.step === 'ready' ? 1 : 0)) / INTAKE_STEPS.length) * 100));

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden px-3 sm:px-6 py-4 sm:py-8 lg:py-10">
      {/* Page-level bubble ambient comes from AdaShell; panels stay solid */}
      <div className="relative mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* ── Sidebar ── */}
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[280px] space-y-2 sm:space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`relative isolate overflow-hidden rounded-2xl sm:rounded-[1.35rem] border p-3 sm:p-5 ${border} ${surface}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
            />
            <div className="relative z-[1]">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
              <span
                className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border ${
                  isLight
                    ? 'border-slate-200 bg-slate-900 text-white'
                    : 'border-white/12 bg-white text-black'
                }`}
                aria-hidden
              >
                <svg className="h-[18px] w-[18px] sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] ${faint}`}>
                  {ADA_BRAND.domain}
                </p>
                <h1 className={`text-[15px] sm:text-base font-black tracking-tight leading-tight ${ink}`}>
                  Domain chat
                </h1>
              </div>
              <div className="flex lg:hidden items-center gap-1.5 shrink-0">
                <Link
                  href="/ada/app"
                  className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${border} ${muted}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#121214' }}
                >
                  App
                </Link>
                <button
                  type="button"
                  onClick={resetSession}
                  className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${border} ${faint}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#121214' }}
                >
                  Reset
                </button>
              </div>
            </div>
            <p className={`text-[11px] sm:text-xs leading-snug sm:leading-relaxed ${muted}`}>
              Plain-English brand brief → guided questions → ranked domain shortlist. Research only.
            </p>

            {/* Desktop: full checklist. Mobile: compact chips */}
            <div
              className={`mt-2.5 sm:mt-3.5 rounded-xl border p-2 sm:p-3 overflow-hidden ${border}`}
              style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
            >
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5 sm:mb-2.5 ${faint}`}>
                You only need to share
              </p>
              <ul className="hidden sm:block space-y-2">
                {[
                  {
                    label: 'What the business does',
                    icon: (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                        <path strokeLinecap="round" d="M4 7h16M4 12h10M4 17h7" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Who it is for (optional)',
                    icon: (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                        <circle cx="12" cy="9" r="3.25" />
                        <path strokeLinecap="round" d="M5.5 19.25c1.2-2.7 3.4-4 6.5-4s5.3 1.3 6.5 4" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Domain endings (.com…)',
                    icon: (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                        <circle cx="12" cy="12" r="8.25" />
                        <path strokeLinecap="round" d="M3 12h18M12 3.75c2.4 2.5 3.6 5.3 3.6 8.25S14.4 17.75 12 20.25C9.6 17.75 8.4 14.95 8.4 12S9.6 6.25 12 3.75Z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Words to include / avoid',
                    icon: (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                        <path strokeLinecap="round" d="M7 8h10M7 12h6M7 16h8" />
                        <path strokeLinecap="round" d="m16 14 2 2 3-3" />
                      </svg>
                    ),
                  },
                  {
                    label: 'How names should feel',
                    icon: (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 14.2 9h5.8l-4.7 3.4 1.8 5.6L12 14.8 6.9 18l1.8-5.6L4 9h5.8L12 3.5Z" />
                      </svg>
                    ),
                  },
                ].map((row) => (
                  <li key={row.label} className={`flex items-center gap-2.5 text-[11px] ${muted}`}>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                        isLight
                          ? 'border-slate-200 bg-white text-slate-700'
                          : 'border-white/10 bg-[#0a0a0c] text-white/70'
                      }`}
                    >
                      {row.icon}
                    </span>
                    <span className="min-w-0 leading-snug">{row.label}</span>
                  </li>
                ))}
              </ul>
              <div className="sm:hidden flex flex-wrap gap-1">
                {['Business', 'Audience', 'Endings', 'Include/avoid', 'Style', 'Budget'].map((chip) => (
                  <span
                    key={chip}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${border} ${muted}`}
                    style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            </div>
          </motion.div>

          {/* Progress — horizontal on mobile, full list on sm+ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={`relative isolate overflow-hidden rounded-2xl sm:rounded-[1.35rem] border p-3 sm:p-4 ${border} ${surface}`}
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 ${
                isLight ? 'bg-white' : 'bg-[#0a0a0c]'
              }`}
            />
            <div className="relative z-[1]">
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] ${faint}`}>
                Brief progress
              </p>
              <span className={`text-[10px] font-bold tabular-nums ${muted}`}>
                {activeStep < 0 ? '—' : `${Math.min(activeStep + 1, INTAKE_STEPS.length)}/${INTAKE_STEPS.length}`}
              </span>
            </div>
            {/* Mobile progress bar + dots */}
            <div className="sm:hidden">
              <div
                className={`h-1.5 w-full overflow-hidden rounded-full ${
                  isLight ? 'bg-slate-100' : 'bg-[#121214]'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isLight ? 'bg-slate-900' : 'bg-white'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <ol className="mt-2 flex items-center justify-between gap-0.5">
                {INTAKE_STEPS.map((s, i) => {
                  const done = activeStep > i;
                  const current = activeStep === i;
                  return (
                    <li key={s.id} className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black ${
                          current
                            ? isLight
                              ? 'bg-slate-900 text-white ring-2 ring-slate-900/20'
                              : 'bg-white text-black ring-2 ring-white/25'
                            : done
                              ? isLight
                                ? 'bg-slate-900 text-white'
                                : 'bg-white/90 text-black'
                              : isLight
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-[#121214] text-white/35'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={`text-[8px] font-semibold truncate max-w-full ${current ? ink : faint}`}>
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            {/* Desktop vertical list */}
            <ol className="hidden sm:block space-y-1.5">
              {INTAKE_STEPS.map((s, i) => {
                const done = activeStep > i;
                const current = activeStep === i;
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition ${
                      current
                        ? isLight
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-black'
                        : ''
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-black ${
                        current
                          ? isLight
                            ? 'bg-white/20 text-white'
                            : 'bg-black/10 text-black'
                          : done
                            ? isLight
                              ? 'bg-slate-900 text-white'
                              : 'bg-white/90 text-black'
                            : isLight
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-white/[0.06] text-white/35'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        current ? '' : done ? ink : faint
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            {sessionId && (
              <p className={`mt-2 sm:mt-3 text-[9px] font-mono truncate ${faint}`} title={sessionId}>
                session · {sessionId.slice(0, 18)}…
              </p>
            )}
            </div>
          </motion.div>

          {/* Strategies */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`relative isolate hidden sm:block overflow-hidden rounded-[1.35rem] border p-4 ${border} ${surface}`}
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 ${
                isLight ? 'bg-white' : 'bg-[#0a0a0c]'
              }`}
            />
            <div className="relative z-[1]">
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-2.5 ${faint}`}>
              Ranking strategies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_STRATEGIES.slice(0, 8).map((s) => (
                <span
                  key={s.id}
                  title={s.description}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${border} ${
                    isLight ? 'bg-slate-50' : 'bg-[#111114]'
                  } ${muted}`}
                >
                  {s.short}
                </span>
              ))}
            </div>
            </div>
          </motion.div>

          <div className="hidden lg:flex flex-wrap gap-2">
            <Link
              href="/ada/app"
              className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition ${border} ${muted} ${
                isLight ? 'bg-white' : 'bg-[#0a0a0c]'
              }`}
            >
              Structured app
            </Link>
            <Link
              href="/ada/docs"
              className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition ${border} ${muted} ${
                isLight ? 'bg-white' : 'bg-[#0a0a0c]'
              }`}
            >
              Agent docs
            </Link>
            <button
              type="button"
              onClick={resetSession}
              className={`rounded-xl border px-3 py-2 text-[11px] font-bold ${border} ${faint} ${
                isLight ? 'bg-white' : 'bg-[#0a0a0c]'
              }`}
            >
              Reset
            </button>
          </div>
        </aside>

        {/* ── Main chat ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className={`shine-border relative isolate flex min-h-[28rem] sm:min-h-[32rem] lg:min-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden rounded-2xl sm:rounded-[1.5rem] border ${border} ${surface} ${
            isLight
              ? 'shadow-[0_16px_48px_-24px_rgba(15,23,42,0.18)]'
              : 'shadow-2xl shadow-black/50'
          }`}
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-0 ${
              isLight ? 'bg-white' : 'bg-[#0a0a0c]'
            }`}
          />
          {/* Top hairline + bar */}
          <div
            aria-hidden
            className={`absolute inset-x-6 sm:inset-x-8 top-0 z-10 h-px ${
              isLight
                ? 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'
                : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
            }`}
          />
          <div
            className={`relative z-[1] flex items-center justify-between gap-2 sm:gap-3 border-b px-3 sm:px-5 py-2.5 sm:py-3 ${border} ${
              isLight ? 'bg-white' : 'bg-[#0a0a0c]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`relative flex h-2 w-2 shrink-0 rounded-full ${
                  loading ? (isLight ? 'bg-amber-500' : 'bg-amber-400') : isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                }`}
              >
                {loading && (
                  <span
                    className={`absolute inset-0 animate-ping rounded-full opacity-60 ${
                      isLight ? 'bg-amber-400' : 'bg-amber-300'
                    }`}
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className={`text-[12px] sm:text-xs font-bold truncate ${ink}`}>
                  {loading
                    ? statusLine || 'Working…'
                    : intake?.step
                      ? `Step · ${intake.step.replace(/_/g, ' ')}`
                      : 'Ready for your brief'}
                </p>
                <p className={`hidden sm:block text-[10px] ${faint}`}>
                  {loading ? 'Streaming response' : 'Research only · not a registrar'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${border} ${faint}`}
                style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
              >
                <span
                  className={`h-1 w-1 rounded-full ${
                    loading ? 'bg-amber-400' : isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                  }`}
                />
                Live
              </span>
              <Link
                href="/ada/docs"
                className={`hidden sm:inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold ${border} ${muted}`}
                style={{ backgroundColor: isLight ? '#ffffff' : '#121214' }}
              >
                Docs
              </Link>
            </div>
          </div>

          {/* Messages — panel-local scroll only (do not use scrollIntoView; it jumps the page footer) */}
          <div
            ref={messagesListRef}
            className="relative z-[1] flex-1 overflow-y-auto px-2.5 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-3.5 scroll-smooth overscroll-contain"
          >
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[94%] sm:max-w-[88%] ${
                      m.role === 'assistant' ? 'w-full sm:w-auto sm:min-w-[min(100%,20rem)]' : ''
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2 px-0.5 sm:px-1">
                        <span
                          className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black ${
                            isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                          }`}
                        >
                          AI
                        </span>
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${faint}`}>
                          Assistant
                          {m.engine && !m.streaming ? ` · ${m.engine}` : ''}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3.5 text-[12.5px] sm:text-[13px] leading-snug sm:leading-relaxed ${
                        m.role === 'user'
                          ? isLight
                            ? 'bg-slate-900 text-white rounded-br-md shadow-lg shadow-slate-900/15'
                            : 'bg-white text-black rounded-br-md shadow-lg shadow-white/5'
                          : isLight
                            ? 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-md'
                            : 'bg-[#121214] border border-white/[0.08] text-white/88 rounded-tl-md'
                      }`}
                      style={
                        m.role === 'assistant'
                          ? { backgroundColor: isLight ? undefined : '#121214' }
                          : undefined
                      }
                    >
                      <div className="whitespace-pre-wrap">
                        {formatMessage(m.content)}
                        {m.streaming && !m.content ? (
                          <span className="inline-flex gap-1 items-center py-1">
                            {[0, 1, 2].map((d) => (
                              <motion.span
                                key={d}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isLight ? 'bg-slate-400' : 'bg-white/40'
                                }`}
                                animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                                transition={{
                                  duration: 0.9,
                                  repeat: Infinity,
                                  delay: d * 0.15,
                                }}
                              />
                            ))}
                          </span>
                        ) : m.streaming ? (
                          <span
                            className={`ml-0.5 inline-block h-3.5 w-0.5 animate-pulse align-middle ${
                              isLight ? 'bg-slate-500' : 'bg-white/50'
                            }`}
                          />
                        ) : null}
                      </div>

                      {m.domains && m.domains.length > 0 && (
                        <div className="mt-3.5 space-y-2">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-2 ${
                              m.role === 'user' ? 'opacity-60' : faint
                            }`}
                          >
                            Ranked shortlist · {m.domains.length}
                          </p>
                          {m.domains.map((d, di) => (
                            <motion.div
                              key={d.domain}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: di * 0.04 }}
                            >
                              <DomainRankCard
                                item={d}
                                isLight={isLight}
                                isSaved={savedDomains.has(d.domain.toLowerCase())}
                                onSave={toggleSaveDomain}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    {m.role === 'user' && idx === messages.length - 1 && !loading && (
                      <p className={`mt-1 text-right text-[9px] ${faint}`}>You</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* First-time: super clear onboarding */}
            {showWelcomeOnly && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="space-y-2.5 sm:space-y-4 pt-0.5 sm:pt-1"
              >
                {/* What to share */}
                <div
                  className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-5 ${border}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                >
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] mb-0.5 sm:mb-1 ${faint}`}>
                    First time here?
                  </p>
                  <h2 className={`text-sm sm:text-lg font-black tracking-tight mb-0.5 sm:mb-1 ${ink}`}>
                    Share these details (one step at a time)
                  </h2>
                  <p className={`text-[11px] sm:text-xs mb-2.5 sm:mb-4 leading-snug ${muted}`}>
                    Short answers are fine. Tap an example anytime.
                  </p>
                  {/* Mobile: compact 2-col grid of steps only */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {WHAT_TO_SHARE.map((item) => (
                      <div
                        key={item.step}
                        className={`rounded-lg sm:rounded-xl border p-2 sm:p-3 ${border}`}
                        style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
                      >
                        <div className="flex items-start gap-1.5 sm:gap-2.5">
                          <span
                            className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black ${
                              isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                            }`}
                          >
                            {item.step}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-[11px] sm:text-xs font-black leading-tight ${ink}`}>
                              {item.title}
                            </p>
                            <p className={`mt-0.5 text-[10px] sm:text-[11px] font-medium leading-snug line-clamp-2 sm:line-clamp-none ${muted}`}>
                              {item.example}
                            </p>
                            <p className={`mt-0.5 hidden sm:block text-[10px] ${faint}`}>{item.tip}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Easy start form */}
                <div
                  className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-5 ${border}`}
                  style={{ backgroundColor: isLight ? '#f8fafc' : '#0a0a0c' }}
                >
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] mb-0.5 sm:mb-1 ${faint}`}>
                    Easiest start
                  </p>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 ${ink}`}>
                    Fill this in — we start the guided chat for you
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className={`block text-[10px] sm:text-[11px] font-bold mb-1 ${ink}`}>
                        What is the business? <span className={faint}>(required)</span>
                      </label>
                      <input
                        value={easyBiz}
                        onChange={(e) => setEasyBiz(e.target.value)}
                        placeholder="e.g. Fitness gym / meal kit delivery"
                        className={`w-full rounded-lg sm:rounded-xl border px-2.5 sm:px-3 py-2 sm:py-2.5 text-[13px] sm:text-sm outline-none transition focus:ring-1 ${border} ${
                          isLight
                            ? 'bg-white text-slate-900 focus:ring-slate-200'
                            : 'bg-[#121214] text-white focus:ring-white/15'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] sm:text-[11px] font-bold mb-1 ${ink}`}>
                        Who is it for? <span className={faint}>(optional)</span>
                      </label>
                      <input
                        value={easyAudience}
                        onChange={(e) => setEasyAudience(e.target.value)}
                        placeholder="e.g. busy professionals / families"
                        className={`w-full rounded-lg sm:rounded-xl border px-2.5 sm:px-3 py-2 sm:py-2.5 text-[13px] sm:text-sm outline-none transition focus:ring-1 ${border} ${
                          isLight
                            ? 'bg-white text-slate-900 focus:ring-slate-200'
                            : 'bg-[#121214] text-white focus:ring-white/15'
                        }`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <label
                        className={`inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border px-2 sm:px-2.5 py-1.5 sm:py-2 ${border}`}
                        style={{ backgroundColor: isLight ? '#ffffff' : '#121214' }}
                      >
                        <span className={`text-[9px] sm:text-[10px] font-bold ${faint}`}>Budget ~$</span>
                        <input
                          type="number"
                          min={1}
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className={`w-12 sm:w-14 bg-transparent text-[13px] sm:text-sm font-bold outline-none ${ink}`}
                        />
                        <span className={`text-[9px] sm:text-[10px] ${faint}`}>/ yr</span>
                      </label>
                      <button
                        type="button"
                        disabled={loading || easyBiz.trim().length < 3}
                        onClick={startFromEasyForm}
                        className={`cta-mobile-tap rounded-lg sm:rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition disabled:opacity-40 ${
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-white text-black hover:bg-white/90'
                        }`}
                      >
                        Continue →
                      </button>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] leading-snug ${faint}`}>
                      Next: endings, include/avoid, style — with tappable examples.
                    </p>
                  </div>
                </div>

                {/* One-tap full examples */}
                <div>
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] mb-1.5 sm:mb-2 px-0.5 ${faint}`}>
                    Or tap a ready example
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {EXAMPLE_BRIEFS.map((s, i) => (
                      <button
                        key={s.prompt}
                        type="button"
                        disabled={loading}
                        onClick={() => send(s.prompt)}
                        className={`cta-mobile-tap shine-border rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 text-left transition sm:hover:-translate-y-0.5 ${border}`}
                        style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                      >
                        <span
                          className={`mb-1 sm:mb-1.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md text-[9px] sm:text-[10px] font-black ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#121214] text-white/60'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <p className={`text-[11px] sm:text-xs font-black leading-tight ${ink}`}>{s.label}</p>
                        <p className={`mt-0.5 text-[9px] sm:text-[10px] leading-snug line-clamp-2 ${muted}`}>
                          {s.blurb}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* In-flow step coach (after first message) */}
            {!showWelcomeOnly && stepHelp && !loading && (
              <motion.div
                key={stepHelp.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative isolate rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-3.5 sm:py-3 ${border}`}
                style={{
                  backgroundColor: isLight ? '#fffbeb' : '#0a0a0c',
                  borderColor: isLight ? 'rgba(253, 230, 138, 0.6)' : undefined,
                }}
              >
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] mb-0.5 sm:mb-1 ${faint}`}>
                  {stepHelp.title}
                </p>
                <p className={`text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2 leading-snug ${ink}`}>
                  {stepHelp.ask}
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {stepHelp.examples.map((ex) => (
                    <button
                      key={ex.value + ex.label}
                      type="button"
                      disabled={loading}
                      onClick={() => send(ex.value)}
                      className={`cta-mobile-tap rounded-full border px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition ${border} ${
                        isLight
                          ? 'bg-white text-slate-700 hover:border-slate-400'
                          : 'bg-[#121214] text-white/75 hover:border-white/25'
                      }`}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div
            className={`relative z-[1] border-t px-2.5 sm:px-5 py-2.5 sm:py-4 ${border} ${
              isLight ? 'bg-white' : 'bg-[#0a0a0c]'
            }`}
          >
            {!showWelcomeOnly && stepHelp && (
              <div className="mb-2">
                <p className={`text-[11px] sm:text-[12px] font-semibold mb-1.5 leading-snug ${ink}`}>
                  {stepHelp.ask}
                </p>
                <div className="mb-2 flex flex-wrap gap-1 sm:gap-1.5">
                  {stepHelp.examples.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      disabled={loading}
                      onClick={() => send(ex.value)}
                      className={`cta-mobile-tap rounded-full border px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition ${border} ${
                        isLight
                          ? 'bg-white text-slate-700 hover:border-slate-400'
                          : 'bg-[#121214] text-white/70 hover:border-white/25'
                      }`}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showWelcomeOnly && (
              <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <label
                  className={`inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border px-2 sm:px-2.5 py-1 sm:py-1.5 ${border}`}
                  style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${faint}`}>
                    Budget $
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={`w-12 sm:w-14 bg-transparent text-xs font-bold outline-none ${ink}`}
                  />
                </label>
                <span className={`text-[9px] sm:text-[10px] ${faint}`}>
                  research cap · not a payment
                </span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (showWelcomeOnly && !input.trim() && easyBiz.trim()) {
                  startFromEasyForm();
                  return;
                }
                void send(input);
              }}
              className={`flex items-end gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border p-1 sm:p-2 transition focus-within:ring-1 ${border} ${
                isLight
                  ? 'bg-slate-50/80 shadow-sm focus-within:ring-slate-200 focus-within:bg-white'
                  : 'bg-[#121214] focus-within:ring-white/15'
              }`}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  showWelcomeOnly
                    ? 'Or type: Fitness gym for busy professionals'
                    : stepHelp?.examples[0]
                      ? `Example: ${stepHelp.examples[0].value}`
                      : 'Type your answer…'
                }
                disabled={loading}
                className={`min-h-[2.5rem] sm:min-h-[2.75rem] flex-1 bg-transparent px-2.5 sm:px-3 py-2 text-[13px] sm:text-sm outline-none ${ink} placeholder:opacity-40`}
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !(showWelcomeOnly && easyBiz.trim().length >= 3))}
                className={`cta-mobile-tap shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl px-3.5 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition disabled:opacity-35 ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15'
                    : 'bg-white text-black hover:bg-white/90 shadow-md shadow-white/10'
                }`}
              >
                {loading ? (
                  <span className="inline-flex gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-current animate-pulse" />
                    <span className="h-1 w-1 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
                    <span className="h-1 w-1 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
                  </span>
                ) : (
                  <>
                    <span>{showWelcomeOnly ? 'Start' : 'Send'}</span>
                    <svg
                      className="h-3.5 w-3.5 opacity-80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {error && (
              <p className="mt-2 text-[11px] sm:text-xs font-semibold text-rose-400">{error}</p>
            )}
            <p className={`mt-2 text-center text-[9px] sm:text-[10px] leading-snug ${faint}`}>
              Free · research only · re-check at a registrar before you buy
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
