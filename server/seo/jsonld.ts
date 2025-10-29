export function buildSoftwareApplicationJSONLD(doc: any) {
  const name = doc?.title || 'Documentation';
  const description = doc?.description || '';
  const url = doc?.metadata?.site_source || doc?.url || undefined;
  const json: any = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
  };
  if (url) json.url = url;
  return json;
}

export function buildFAQJSONLD(doc: any) {
  const faqs: Array<{ name: string; acceptedAnswer: { text: string } }> = [];
  const sections = Array.isArray(doc?.sections) ? doc.sections : [];
  for (const section of sections) {
    if (!section || !Array.isArray(section.content)) continue;
    // Treat any heading+paragraph pairs under sections titled FAQ as questions/answers
    if (String(section.title || '').toLowerCase().includes('faq')) {
      let lastQ: string | null = null;
      for (const block of section.content) {
        if (block.type === 'heading') lastQ = block.text;
        else if (block.type === 'paragraph' && lastQ) {
          faqs.push({ name: lastQ, acceptedAnswer: { text: block.text } });
          lastQ = null;
        }
      }
    }
  }
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q.name, acceptedAnswer: { '@type': 'Answer', text: q.acceptedAnswer.text } })),
  };
}


