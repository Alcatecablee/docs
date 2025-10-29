import { describe, it, expect } from 'vitest';
import { normalizeUrl, isSameOrigin } from '../../server/utils/url-normalization';

describe('normalizeUrl', () => {
  it('removes fragments and tracking params and default ports', () => {
    const n = normalizeUrl('https://EXAMPLE.com:443/docs/getting-started?utm_source=x&ref=r#section');
    expect(n).toBe('https://example.com/docs/getting-started');
  });
  it('sorts query params and trims trailing slashes', () => {
    const n = normalizeUrl('http://example.com/path/?b=2&a=1');
    expect(n).toBe('http://example.com/path?a=1&b=2');
  });
});

describe('isSameOrigin', () => {
  it('compares protocol and host', () => {
    expect(isSameOrigin('https://a.com/x', 'https://a.com/y')).toBe(true);
    expect(isSameOrigin('http://a.com/x', 'https://a.com/y')).toBe(false);
  });
});


