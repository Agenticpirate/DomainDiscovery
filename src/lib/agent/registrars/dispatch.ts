/**
 * Dispatch register / DNS to wired adapters (Porkbun, Namecheap, Cloudflare).
 * All mutations require feature flag + BYOK + human confirm (enforced by caller).
 */

import type { RegistrarAdapter } from './types';
import { porkbunAdapter } from './adapters/porkbun';
import { namecheapAdapter } from './adapters/namecheap';
import { cloudflareAdapter } from './adapters/cloudflare';
import { namesiloAdapter } from './adapters/namesilo';
import { dynadotAdapter } from './adapters/dynadot';

const ADAPTERS: Record<string, RegistrarAdapter> = {
  porkbun: porkbunAdapter,
  namecheap: namecheapAdapter,
  cloudflare: cloudflareAdapter,
  namesilo: namesiloAdapter,
  dynadot: dynadotAdapter,
};

export function getWiredAdapter(providerId: string): RegistrarAdapter | null {
  const id = providerId.toLowerCase().trim();
  return ADAPTERS[id] || null;
}

export function listWiredAdapterIds(): string[] {
  return Object.keys(ADAPTERS);
}
