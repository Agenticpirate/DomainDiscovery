import { lookupDns, validateDnsName } from '@/lib/dnsLookup';

describe('validateDnsName', () => {
  it('accepts public names and rejects IPs, local and invalid input', () => {
    expect(validateDnsName('https://Example.com/path')).toBe('example.com');
    expect(validateDnsName('127.0.0.1')).toBeNull();
    expect(validateDnsName('printer.local')).toBeNull();
    expect(validateDnsName('localhost')).toBeNull();
    expect(validateDnsName('not a domain')).toBeNull();
  });
});

describe('lookupDns', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('normalizes answers', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Status: 0, Answer: [{ name: 'example.com.', type: 15, TTL: 300, data: '10 mail.example.com.' }] }),
    }) as unknown as typeof fetch;
    const r = await lookupDns('example.com', 'MX');
    expect(r.resolver).toBe('cloudflare-dns.com');
    expect(r.records).toEqual([{ name: 'example.com', type: 'MX', ttl: 300, data: '10 mail.example.com' }]);
  });

  it('falls back to the second resolver on failure', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ Status: 3 }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    const r = await lookupDns('example.com', 'A');
    expect(r.resolver).toBe('dns.google');
    expect(r.status).toBe(3);
    expect(r.records).toEqual([]);
  });

  it('rejects invalid input without fetching', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    await expect(lookupDns('10.0.0.1', 'A')).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
