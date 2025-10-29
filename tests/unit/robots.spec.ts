import { describe, it, expect } from 'vitest';
import { parseRobots } from '../../server/services/robots-txt';

describe('parseRobots', () => {
  it('parses allow/disallow and crawl-delay', () => {
    const txt = `
User-agent: *
Disallow: /admin
Allow: /docs
Crawl-delay: 5
`;
    const rules = parseRobots(txt);
    const star = rules.get('*');
    expect(star).toBeTruthy();
    expect(star?.disallow).toContain('/admin');
    expect(star?.allow).toContain('/docs');
    expect(star?.crawlDelay).toBe(5);
  });
});


