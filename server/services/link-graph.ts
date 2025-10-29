import { normalizeUrl } from '../utils/url-normalization';

export interface LinkEdge {
  from: string;
  to: string;
}

export interface LinkNodeMeta {
  url: string;
  inDegree: number;
  outDegree: number;
  depth: number;
  semanticScore: number;
  score: number;
}

export interface LinkGraphInput {
  roots: string[];
  links: Array<{ from: string; to: string }>;
  candidates: string[];
}

const DOC_KEYWORDS = /(doc|help|support|guide|tutorial|api|developer|faq|question|blog|article|changelog|release|update|resource|learn|integration|pricing|security|status|knowledge|kb)/i;

const normalize = (u: string) => normalizeUrl(u);

function urlDepth(u: string): number {
  try {
    const url = new URL(u);
    return url.pathname.split('/').filter(Boolean).length;
  } catch {
    return 0;
  }
}

function semanticScore(u: string): number {
  const score = DOC_KEYWORDS.test(u) ? 1 : 0;
  return score;
}

export class LinkGraph {
  private nodes: Map<string, LinkNodeMeta> = new Map();

  constructor(input: LinkGraphInput) {
    const roots = new Set(input.roots.map(normalize));
    const counts: Map<string, { inDeg: number; outDeg: number }> = new Map();
    for (const { from, to } of input.links) {
      const f = normalize(from);
      const t = normalize(to);
      if (!counts.has(f)) counts.set(f, { inDeg: 0, outDeg: 0 });
      if (!counts.has(t)) counts.set(t, { inDeg: 0, outDeg: 0 });
      counts.get(f)!.outDeg += 1;
      counts.get(t)!.inDeg += 1;
    }

    const uniqueCandidates = Array.from(new Set(input.candidates.map(normalize)));
    for (const c of uniqueCandidates) {
      const deg = counts.get(c) || { inDeg: 0, outDeg: 0 };
      const depth = urlDepth(c);
      const sem = semanticScore(c);
      // Weighted scoring: in-degree (0.6), semantic (0.3), shallower depth (0.1)
      const score = 0.6 * Math.min(10, deg.inDeg) + 0.3 * sem + 0.1 * Math.max(0, 6 - depth);
      this.nodes.set(c, {
        url: c,
        inDegree: deg.inDeg,
        outDegree: deg.outDeg,
        depth,
        semanticScore: sem,
        score
      });
    }
  }

  prioritize(limit: number): string[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(n => n.url);
  }
}

export function buildLinkGraph(input: LinkGraphInput): LinkGraph {
  return new LinkGraph(input);
}


