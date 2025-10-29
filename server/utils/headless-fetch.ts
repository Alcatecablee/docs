export type HeadlessResult = {
  html: string;
  url: string;
};

function isEnabled(): boolean {
  return process.env.HEADLESS_CRAWL === '1' || process.env.HEADLESS_CRAWL === 'true';
}

export async function headlessFetchHTML(targetUrl: string, timeoutMs: number = 12000): Promise<HeadlessResult> {
  if (!isEnabled()) {
    throw new Error('Headless crawl disabled');
  }
  let browser: any;
  try {
    // Lazy import to avoid mandatory dependency when unused
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: process.env.CRAWLER_USER_AGENT || 'DocSS-Crawler/1.0',
      viewport: { width: 1366, height: 900 },
      javaScriptEnabled: true,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    // Block heavy resources
    await page.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
        return route.abort();
      }
      return route.continue();
    });
    const resp = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    if (!resp) throw new Error('No response');
    // Wait a short time for client-side rendering
    await page.waitForTimeout(300);
    const html = await page.content();
    const finalUrl = page.url();
    await context.close();
    await browser.close();
    return { html, url: finalUrl };
  } catch (e) {
    try { if (browser) await browser.close(); } catch {}
    throw e;
  }
}


