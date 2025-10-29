import { describe, it, expect } from 'vitest';
import { parseRobots, RobotsTxtService } from '../../services/robots-txt';

describe('robots.txt parsing', () => {
  it('parses allow/disallow and crawl-delay', () => {
    const robots = `
User-agent: *
Disallow: /private
Allow: /private/help
Crawl-delay: 2
`;
    const rulesByAgent = parseRobots(robots);
    const wildcard = rulesByAgent.get('*');
    expect(wildcard).toBeTruthy();
    expect(wildcard!.disallow).toContain('/private');
    expect(wildcard!.allow).toContain('/private/help');
    expect(wildcard!.crawlDelay).toBe(2);
  });
});

describe('robots allowance decisions', () => {
  it('applies longest-match-wins with allow precedence on ties', async () => {
    const svc = new RobotsTxtService('DocSS-Crawler/1.0');
    const origin = 'https://example.com';
    const robots = `
User-agent: *
Disallow: /docs
Allow: /docs/public
`;
    svc.primeCache(origin, robots);

    const blocked = await svc.isAllowed('https://example.com/docs/admin');
    expect(blocked.allowed).toBe(false);

    const allowed = await svc.isAllowed('https://example.com/docs/public/guide');
    expect(allowed.allowed).toBe(true);
  });

  it('respects crawl-delay', async () => {
    const svc = new RobotsTxtService('DocSS-Crawler/1.0');
    const origin = 'https://example.org';
    svc.primeCache(origin, `User-agent: *\nCrawl-delay: 5\n`);
    const res = await svc.isAllowed('https://example.org/path');
    expect(res.crawlDelay).toBe(5);
  });
});


