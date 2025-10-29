import { describe, it, expect, beforeEach } from 'vitest';
import { ContentDeduplicator } from '../content-hash';

describe('ContentDeduplicator', () => {
  let dedup: ContentDeduplicator;

  beforeEach(() => {
    dedup = new ContentDeduplicator();
  });

  describe('Duplicate Detection', () => {
    it('should detect exact duplicate content', () => {
      const html = '<html><body><h1>Test Page</h1></body></html>';
      const url1 = 'https://example.com/page1';
      const url2 = 'https://example.com/page2';

      const result1 = dedup.isDuplicate(url1, html);
      expect(result1).toBeNull();

      const result2 = dedup.isDuplicate(url2, html);
      expect(result2).toBe(url1);
    });

    it('should detect duplicates despite whitespace differences', () => {
      const html1 = '<html><body><h1>Test</h1></body></html>';
      const html2 = '<html>  <body>  <h1>   Test   </h1>  </body>  </html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      const result = dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(result).toBe('https://example.com/page1');
    });

    it('should detect duplicates despite HTML comments', () => {
      const html1 = '<html><body><h1>Test</h1></body></html>';
      const html2 = '<html><!-- Comment --><body><h1>Test</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      const result = dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(result).toBe('https://example.com/page1');
    });

    it('should detect duplicates despite different inline styles', () => {
      const html1 = '<html><body><h1>Test</h1></body></html>';
      const html2 = '<html><body><h1 style="color: red">Test</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      const result = dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(result).toBe('https://example.com/page1');
    });

    it('should detect duplicates despite script tags', () => {
      const html1 = '<html><body><h1>Test</h1></body></html>';
      const html2 = '<html><body><h1>Test</h1><script>console.log("different")</script></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      const result = dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(result).toBe('https://example.com/page1');
    });

    it('should detect duplicates despite data attributes', () => {
      const html1 = '<html><body><h1>Test</h1></body></html>';
      const html2 = '<html><body><h1 data-id="123" data-timestamp="456">Test</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      const result = dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(result).toBe('https://example.com/page1');
    });
  });

  describe('Unique Content', () => {
    it('should treat different content as unique', () => {
      const html1 = '<html><body><h1>Page 1</h1></body></html>';
      const html2 = '<html><body><h1>Page 2</h1></body></html>';
      
      const result1 = dedup.isDuplicate('https://example.com/page1', html1);
      const result2 = dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should handle unique pages with similar structure', () => {
      const html1 = '<html><body><article><h1>Article 1</h1><p>Content A</p></article></body></html>';
      const html2 = '<html><body><article><h1>Article 2</h1><p>Content B</p></article></body></html>';
      
      const result1 = dedup.isDuplicate('https://example.com/article1', html1);
      const result2 = dedup.isDuplicate('https://example.com/article2', html2);
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('URL Tracking', () => {
    it('should track processed URLs', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      
      expect(dedup.hasProcessedUrl('https://example.com/page1')).toBe(false);
      
      dedup.isDuplicate('https://example.com/page1', html);
      
      expect(dedup.hasProcessedUrl('https://example.com/page1')).toBe(true);
    });

    it('should not confuse URL tracking with content dedup', () => {
      const html1 = '<html><body><h1>Page 1</h1></body></html>';
      const html2 = '<html><body><h1>Page 2</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      dedup.isDuplicate('https://example.com/page2', html2);
      
      expect(dedup.hasProcessedUrl('https://example.com/page1')).toBe(true);
      expect(dedup.hasProcessedUrl('https://example.com/page2')).toBe(true);
      expect(dedup.hasProcessedUrl('https://example.com/page3')).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate stats', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html);
      dedup.isDuplicate('https://example.com/page2', html);
      dedup.isDuplicate('https://example.com/page3', html);
      
      const stats = dedup.getStats();
      expect(stats.uniquePages).toBe(3);
      expect(stats.totalHashes).toBe(1);
    });

    it('should track multiple unique pages', () => {
      dedup.isDuplicate('https://example.com/page1', '<html><body><h1>Page 1</h1></body></html>');
      dedup.isDuplicate('https://example.com/page2', '<html><body><h1>Page 2</h1></body></html>');
      dedup.isDuplicate('https://example.com/page3', '<html><body><h1>Page 3</h1></body></html>');
      
      const stats = dedup.getStats();
      expect(stats.uniquePages).toBe(3);
      expect(stats.totalHashes).toBe(3);
    });
  });

  describe('Duplicate Groups', () => {
    it('should identify duplicate groups', () => {
      const html1 = '<html><body><h1>Page A</h1></body></html>';
      const html2 = '<html><body><h1>Page B</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html1);
      dedup.isDuplicate('https://example.com/page2', html1);
      dedup.isDuplicate('https://example.com/page3', html1);
      
      dedup.isDuplicate('https://example.com/page4', html2);
      dedup.isDuplicate('https://example.com/page5', html2);
      
      const groups = dedup.getDuplicateGroups();
      expect(groups.size).toBe(2);
      
      const groupArray = Array.from(groups.values());
      expect(groupArray).toContainEqual(expect.arrayContaining([
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
      ]));
      expect(groupArray).toContainEqual(expect.arrayContaining([
        'https://example.com/page4',
        'https://example.com/page5',
      ]));
    });

    it('should not return groups with only one URL', () => {
      dedup.isDuplicate('https://example.com/page1', '<html><body><h1>Unique 1</h1></body></html>');
      dedup.isDuplicate('https://example.com/page2', '<html><body><h1>Unique 2</h1></body></html>');
      
      const groups = dedup.getDuplicateGroups();
      expect(groups.size).toBe(0);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      
      dedup.isDuplicate('https://example.com/page1', html);
      dedup.isDuplicate('https://example.com/page2', html);
      
      expect(dedup.getStats().totalHashes).toBeGreaterThan(0);
      
      dedup.clear();
      
      const stats = dedup.getStats();
      expect(stats.uniquePages).toBe(0);
      expect(stats.totalHashes).toBe(0);
    });

    it('should respect cache size limits', () => {
      const smallDedup = new ContentDeduplicator({ maxCacheSize: 3 });
      
      for (let i = 1; i <= 5; i++) {
        smallDedup.isDuplicate(
          `https://example.com/page${i}`,
          `<html><body><h1>Page ${i}</h1></body></html>`
        );
      }
      
      const stats = smallDedup.getStats();
      expect(stats.totalHashes).toBeLessThanOrEqual(3);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle sorted/filtered views as duplicates', () => {
      const productList = `
        <html>
          <body>
            <div class="products">
              <div data-sort="date">Product A</div>
              <div data-sort="date">Product B</div>
              <div data-sort="date">Product C</div>
            </div>
          </body>
        </html>
      `;
      
      dedup.isDuplicate('https://shop.com/products', productList);
      const duplicate = dedup.isDuplicate('https://shop.com/products?sort=date&order=asc', productList);
      
      expect(duplicate).toBe('https://shop.com/products');
    });

    it('should handle paginated views as unique', () => {
      const page1 = '<html><body><article>Content 1-10</article></body></html>';
      const page2 = '<html><body><article>Content 11-20</article></body></html>';
      
      dedup.isDuplicate('https://blog.com/posts?page=1', page1);
      const result = dedup.isDuplicate('https://blog.com/posts?page=2', page2);
      
      expect(result).toBeNull();
    });

    it('should handle A/B test variants as duplicates when content is same', () => {
      const content = '<html><body><h1>Welcome</h1><p>Same content</p></body></html>';
      
      dedup.isDuplicate('https://site.com/landing?variant=A', content);
      const duplicate = dedup.isDuplicate('https://site.com/landing?variant=B', content);
      
      expect(duplicate).toBe('https://site.com/landing?variant=A');
    });
  });
});
