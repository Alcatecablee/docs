import { describe, it, expect } from 'vitest';
import { RevisitPolicyService } from '../../services/revisit-policy';

describe('revisit policy', () => {
  it('stores and returns conditional headers', async () => {
    const svc = new RevisitPolicyService();
    const url = 'https://example.com/a';
    // @ts-ignore - Response typing not needed for header access in tests
    const resp = { headers: new Map([['etag', 'W/"abc"'], ['last-modified', 'Mon, 01 Jan 2024 00:00:00 GMT']]), status: 200 };
    // Fake headers.get
    (resp.headers as any).get = (k: string) => (resp.headers as any).get(k);
    await svc.updateFromResponse(url, resp as any, 1000);
    const h = await svc.getConditionalHeaders(url);
    expect(h['If-None-Match']).toBe('W/"abc"');
    expect(h['If-Modified-Since']).toBe('Mon, 01 Jan 2024 00:00:00 GMT');
  });

  it('decides revisit based on ttl', async () => {
    const svc = new RevisitPolicyService();
    const info = { url: 'https://x', lastSeen: Date.now(), ttlMs: 1000 } as any;
    expect(svc.shouldRevisit(info)).toBe(false);
  });
});


