/**
 * Simple Template Renderer
 * Handles Handlebars-like syntax for documentation templates
 */

interface TemplateData {
  [key: string]: any;
}

export class TemplateRenderer {
  /**
   * Render a template with data
   */
  static render(template: string, data: TemplateData): string {
    let result = template;

    // Handle {{variable}} replacements
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : '';
    });

    // Handle {{{variable}}} (unescaped) replacements
    result = result.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : '';
    });

    // Handle {{#if condition}} blocks
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
      return data[key] ? content : '';
    });

    // Handle {{#each array}} blocks
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, itemTemplate) => {
      const array = data[key];
      if (!Array.isArray(array)) return '';

      return array.map(item => {
        let itemResult = itemTemplate;
        // Replace {{property}} with item[property]
        Object.keys(item).forEach(prop => {
          const regex = new RegExp(`\\{\\{${prop}\\}\\}`, 'g');
          itemResult = itemResult.replace(regex, String(item[prop] || ''));
        });
        return itemResult;
      }).join('\n');
    });

    return result;
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
