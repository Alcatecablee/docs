import { describe, it, expect } from 'vitest';
import { buildLinkGraph } from '../../services/link-graph';

describe('link-graph frontier scoring', () => {
  it('prioritizes higher in-degree and semantic URLs', () => {
    const roots = ['https://example.com'];
    const links = [
      { from: roots[0], to: 'https://example.com/docs/getting-started' },
      { from: roots[0], to: 'https://example.com/docs/api' },
      { from: roots[0], to: 'https://example.com/blog/intro' },
      { from: 'https://example.com/blog/intro', to: 'https://example.com/docs/api' }
    ];
    const candidates = [
      'https://example.com/',
      'https://example.com/docs/getting-started',
      'https://example.com/docs/api',
      'https://example.com/blog/intro',
      'https://example.com/pricing'
    ];
    const graph = buildLinkGraph({ roots, links, candidates });
    const top = graph.prioritize(3);
    expect(top[0]).toContain('/docs/');
  });
});


