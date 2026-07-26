/**
 * Durable agent job store — Redis when available, memory otherwise.
 * Dual-write: memory is always updated for fast local reads.
 */

import type { AgentJob } from '@/lib/agent/types';
import { getRedis, getRedisBackend } from './redisClient';

const TTL_SEC = Math.max(300, parseInt(process.env.ADA_JOB_TTL_SECONDS || '3600', 10) || 3600);
const MAX_MEM = 2_000;

type MemStore = Map<string, AgentJob>;

declare global {
  // eslint-disable-next-line no-var
  var __domainAgentJobs: MemStore | undefined;
}

function mem(): MemStore {
  if (!globalThis.__domainAgentJobs) {
    globalThis.__domainAgentJobs = new Map();
  }
  return globalThis.__domainAgentJobs;
}

function redisKey(id: string) {
  return `ada:job:${id}`;
}

function pruneMem() {
  const s = mem();
  if (s.size <= MAX_MEM) return;
  const entries = Array.from(s.entries()).sort(
    (a, b) => new Date(a[1].updatedAt).getTime() - new Date(b[1].updatedAt).getTime()
  );
  const drop = entries.length - MAX_MEM;
  for (let i = 0; i < drop; i++) s.delete(entries[i][0]);
}

export async function saveAgentJob(job: AgentJob): Promise<void> {
  pruneMem();
  mem().set(job.id, job);
  const r = getRedis();
  if (!r) return;
  try {
    await r.setex(redisKey(job.id), TTL_SEC, JSON.stringify(job));
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[scale] job save redis failed:', e instanceof Error ? e.message : e);
    }
  }
}

export async function getAgentJobDurable(id: string): Promise<AgentJob | null> {
  const local = mem().get(id);
  if (local) return local;

  const r = getRedis();
  if (!r) return null;
  try {
    const raw = await r.get(redisKey(id));
    if (!raw) return null;
    const job = JSON.parse(raw) as AgentJob;
    mem().set(job.id, job);
    return job;
  } catch {
    return null;
  }
}

export async function updateAgentJob(
  id: string,
  mutator: (job: AgentJob) => void
): Promise<AgentJob | null> {
  const job = (await getAgentJobDurable(id)) || mem().get(id) || null;
  if (!job) return null;
  mutator(job);
  job.updatedAt = new Date().toISOString();
  await saveAgentJob(job);
  return job;
}

export function jobStoreStats() {
  return {
    memoryJobs: mem().size,
    maxMemoryJobs: MAX_MEM,
    ttlSeconds: TTL_SEC,
    backend: getRedisBackend(),
  };
}

/** Sync memory-only read (legacy callers) */
export function getAgentJobMemory(id: string): AgentJob | null {
  return mem().get(id) ?? null;
}
