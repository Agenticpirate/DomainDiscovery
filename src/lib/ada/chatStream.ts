/**
 * SSE streaming for ADA chat — progressive status + final result.
 * Research basis: Vercel AI SDK / better-chatbot patterns use SSE or streamable UI;
 * we implement native SSE so we stay dependency-light and work with our hybrid engine.
 */

import { runAdaChat } from './chatEngine';
import type { ChatRequest, ChatResponse } from './chatTypes';
import { upsertSession } from './sessionStore';

export type StreamEvent =
  | { type: 'status'; phase: string; detail?: string }
  | { type: 'token'; text: string }
  | { type: 'result'; data: ChatResponse }
  | { type: 'error'; message: string };

function sseLine(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Chunk text into progressive tokens for UX (rules engine has no LLM stream). */
export async function* chunkText(
  text: string,
  chunkSize = 24
): AsyncGenerator<string> {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    // Small yield for event loop / UI paint
    await new Promise((r) => setTimeout(r, 8));
  }
}

/**
 * Run chat and emit SSE-friendly events.
 * Phases validated against product flow: receive → intake/rank → stream message → result.
 */
export async function* runAdaChatStream(
  req: ChatRequest
): AsyncGenerator<StreamEvent> {
  yield { type: 'status', phase: 'received', detail: 'Message received' };

  const lastUser = [...(req.messages || [])].reverse().find((m) => m.role === 'user');
  const looksLikeRank =
    req.skipIntake ||
    /\b(rank|go|generate|shortlist)\b/i.test(lastUser?.content || '') ||
    req.intake?.step === 'ready';

  if (looksLikeRank && !req.skipIntake) {
    yield {
      type: 'status',
      phase: 'preparing',
      detail: 'Preparing domain shortlist (strategies + availability)…',
    };
  } else if (req.intake?.step && req.intake.step !== 'business') {
    yield {
      type: 'status',
      phase: 'intake',
      detail: `Updating brief · step ${req.intake.step}`,
    };
  } else {
    yield { type: 'status', phase: 'thinking', detail: 'Understanding your brief…' };
  }

  try {
    const result = await runAdaChat(req);

    // Persist session
    const session = upsertSession(req.sessionId, {
      messages: req.messages,
      intake: result.intake ?? null,
      maxBudgetUsd: req.maxBudgetUsd,
      lastResponse: result,
    });
    result.sessionId = session.id;

    if (result.domains?.shortlist?.length) {
      yield {
        type: 'status',
        phase: 'ranked',
        detail: `${result.domains.shortlist.length} domains ranked`,
      };
    }

    // Progressive message tokens
    const msg = result.message || '';
    for await (const piece of chunkText(msg, 28)) {
      yield { type: 'token', text: piece };
    }

    yield { type: 'result', data: result };
  } catch (e) {
    yield {
      type: 'error',
      message: e instanceof Error ? e.message : 'Chat stream failed',
    };
  }
}

export function streamToSseResponse(
  generator: AsyncGenerator<StreamEvent>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of generator) {
          if (ev.type === 'status') {
            controller.enqueue(
              encoder.encode(sseLine('status', { phase: ev.phase, detail: ev.detail }))
            );
          } else if (ev.type === 'token') {
            controller.enqueue(encoder.encode(sseLine('token', { text: ev.text })));
          } else if (ev.type === 'result') {
            controller.enqueue(encoder.encode(sseLine('result', ev.data)));
          } else if (ev.type === 'error') {
            controller.enqueue(encoder.encode(sseLine('error', { message: ev.message })));
          }
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            sseLine('error', {
              message: e instanceof Error ? e.message : 'Stream failed',
            })
          )
        );
      } finally {
        controller.enqueue(encoder.encode(sseLine('done', { ok: true })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
