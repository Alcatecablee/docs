import fs from 'node:fs/promises';
import path from 'node:path';
import { structuredDataTest } from 'structured-data-testing-tool';

async function main() {
  const htmlPath = path.resolve(process.cwd(), 'dist', 'index.html');
  const html = await fs.readFile(htmlPath, 'utf8');

  const result = await structuredDataTest(html, { url: 'http://localhost/' });

  if (!result || !Array.isArray(result)) {
    console.warn('Structured data validation did not return results (no JSON-LD detected). Skipping.');
    return;
  }

  const errors = result.flatMap((r) => r.errors || []);
  const warnings = result.flatMap((r) => r.warnings || []);

  if (errors.length > 0) {
    console.error('Structured data validation failed with errors:');
    for (const err of errors) console.error(`- ${err}`);
    process.exit(1);
  }

  // Optionally surface warnings but do not fail the build
  if (warnings.length > 0) {
    console.warn('Structured data validation warnings:');
    for (const w of warnings) console.warn(`- ${w}`);
  }

  console.log('Structured data validation passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

