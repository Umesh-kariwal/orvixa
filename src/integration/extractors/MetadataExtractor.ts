export class MetadataExtractor {
  public static extract(doc: Document): Record<string, any> {
    const meta: Record<string, any> = {
      title: doc.title || '',
      description: '',
      ogTitle: '',
      ogDescription: '',
    };

    const descEl = doc.querySelector('meta[name="description"]');
    if (descEl) meta.description = descEl.getAttribute('content') || '';

    const ogTitleEl = doc.querySelector('meta[property="og:title"]');
    if (ogTitleEl) meta.ogTitle = ogTitleEl.getAttribute('content') || '';

    const ogDescEl = doc.querySelector('meta[property="og:description"]');
    if (ogDescEl) meta.ogDescription = ogDescEl.getAttribute('content') || '';

    return meta;
  }
}
