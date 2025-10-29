/**
 * Content Hash Deduplication
 * 
 * Prevents crawling functionally identical pages using SHA-256 content hashing.
 * Addresses Production Hardening Roadmap gap: "Content Hash Deduplication"
 */

import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

export interface ContentHashConfig {
  maxCacheSize?: number;
  ttl?: number;
}

interface HashEntry {
  hash: string;
  url: string;
  timestamp: number;
}

/**
 * Content Deduplication Manager
 * 
 * Uses SHA-256 hashing of normalized HTML to detect duplicate pages,
 * even when URLs differ (e.g., sorted/filtered views).
 */
export class ContentDeduplicator {
  private hashCache: LRUCache<string, HashEntry>;
  private urlToHash: Map<string, string> = new Map();

  constructor(config: ContentHashConfig = {}) {
    this.hashCache = new LRUCache<string, HashEntry>({
      max: config.maxCacheSize || 10000,
      ttl: config.ttl || 1000 * 60 * 60 * 24, // 24 hours default
    });
  }

  /**
   * Normalize HTML content for hashing
   * Removes whitespace, comments, and dynamic elements
   */
  private normalizeContent(html: string): string {
    return html
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags and content  
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove inline styles
      .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
      // Remove data attributes (often dynamic)
      .replace(/\s*data-[a-z-]+\s*=\s*["'][^"']*["']/gi, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      // Remove spaces between tags and trim content
      .replace(/>\s+</g, '><')
      .replace(/>\s+/g, '>')
      .replace(/\s+</g, '<')
      // Trim
      .trim()
      .toLowerCase();
  }

  /**
   * Compute SHA-256 hash of normalized content
   */
  private computeHash(content: string): string {
    const normalized = this.normalizeContent(content);
    return crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex');
  }

  /**
   * Check if content is a duplicate
   * Returns the original URL if duplicate found, null otherwise
   */
  isDuplicate(url: string, content: string): string | null {
    const hash = this.computeHash(content);

    // Always track this URL
    this.urlToHash.set(url, hash);

    // Check if we've seen this hash before
    const existing = this.hashCache.get(hash);
    if (existing) {
      console.log(`⚠️ Duplicate content detected: ${url} matches ${existing.url}`);
      return existing.url;
    }

    // New unique content - store it
    const entry: HashEntry = {
      hash,
      url,
      timestamp: Date.now(),
    };
    
    this.hashCache.set(hash, entry);
    
    return null;
  }

  /**
   * Check if URL has been processed (by URL, not content)
   */
  hasProcessedUrl(url: string): boolean {
    return this.urlToHash.has(url);
  }

  /**
   * Get deduplication statistics
   */
  getStats(): {
    uniquePages: number;
    totalHashes: number;
    cacheSize: number;
  } {
    return {
      uniquePages: this.urlToHash.size,
      totalHashes: this.hashCache.size,
      cacheSize: this.hashCache.size,
    };
  }

  /**
   * Clear all cached hashes
   */
  clear(): void {
    this.hashCache.clear();
    this.urlToHash.clear();
  }

  /**
   * Get all duplicate groups
   * Returns URLs grouped by their content hash
   */
  getDuplicateGroups(): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    
    for (const [url, hash] of this.urlToHash.entries()) {
      if (!groups.has(hash)) {
        groups.set(hash, []);
      }
      groups.get(hash)!.push(url);
    }

    // Filter to only groups with duplicates
    const duplicates = new Map<string, string[]>();
    for (const [hash, urls] of groups.entries()) {
      if (urls.length > 1) {
        duplicates.set(hash, urls);
      }
    }

    return duplicates;
  }
}

/**
 * Global singleton instance
 */
let globalDeduplicator: ContentDeduplicator | null = null;

/**
 * Get or create global deduplicator instance
 */
export function getDeduplicator(config?: ContentHashConfig): ContentDeduplicator {
  if (!globalDeduplicator) {
    globalDeduplicator = new ContentDeduplicator(config);
  }
  return globalDeduplicator;
}

/**
 * Reset global deduplicator (useful for testing)
 */
export function resetDeduplicator(): void {
  globalDeduplicator = null;
}
