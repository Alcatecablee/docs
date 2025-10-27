import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { db } from '../db';
import { documentations } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { TemplateRenderer } from '../utils/template-renderer';
import { DocumentationParser } from '../utils/documentation-parser';

export interface SubdomainConfig {
  subdomain: string;
  userId: string;
  documentationId: number;
  customDomain?: string;
  sslEnabled: boolean;
}

export interface HostingResult {
  subdomain: string;
  url: string;
  deployedAt: Date;
  sslStatus: 'active' | 'pending' | 'disabled';
}

/**
 * Subdomain Hosting Service for Enterprise tier
 * Manages multi-tenant static hosting for documentation
 */
export class SubdomainHostingService {
  private hostingDir: string;
  private baseUrl: string;

  constructor() {
    this.hostingDir = join(process.cwd(), 'hosted-docs');
    this.baseUrl = process.env.BASE_DOMAIN || 'docsnap.app';
  }

  /**
   * Deploy documentation to subdomain
   */
  async deployToSubdomain(config: SubdomainConfig): Promise<HostingResult> {
    try {
      console.log(`🚀 Deploying documentation to subdomain: ${config.subdomain}`);

      // Validate subdomain format
      if (!this.isValidSubdomain(config.subdomain)) {
        throw new Error('Invalid subdomain format. Use lowercase letters, numbers, and hyphens only.');
      }

      // Check if subdomain is available
      const isAvailable = await this.isSubdomainAvailable(config.subdomain);
      if (!isAvailable) {
        throw new Error('Subdomain is already taken');
      }

      // Get documentation content
      const database = db;
      if (!database) {
        throw new Error('Database not configured');
      }

      const [doc] = await database
        .select()
        .from(documentations)
        .where(eq(documentations.id, config.documentationId))
        .limit(1);

      if (!doc) {
        throw new Error('Documentation not found');
      }

      // Create subdomain directory
      const subdomainPath = join(this.hostingDir, config.subdomain);
      await mkdir(subdomainPath, { recursive: true });

      // Generate static HTML
      const html = await this.generateStaticHTML(doc, config);
      await writeFile(join(subdomainPath, 'index.html'), html);

      // Generate assets
      await this.generateAssets(subdomainPath, doc);

      // Configure SSL if enabled
      const sslStatus = config.sslEnabled ? await this.provisionSSL(config.subdomain) : 'disabled';

      // Update subdomain mapping
      await this.updateSubdomainMapping(config);

      const url = config.customDomain || `https://${config.subdomain}.${this.baseUrl}`;

      console.log(`✅ Documentation deployed to: ${url}`);

      return {
        subdomain: config.subdomain,
        url,
        deployedAt: new Date(),
        sslStatus,
      };
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  }

  /**
   * Validate subdomain format
   */
  private isValidSubdomain(subdomain: string): boolean {
    // Lowercase letters, numbers, hyphens only
    // Must start with letter, no consecutive hyphens
    const pattern = /^[a-z][a-z0-9-]{2,62}$/;
    return pattern.test(subdomain) && !subdomain.includes('--');
  }

  /**
   * Check if subdomain is available
   */
  private async isSubdomainAvailable(subdomain: string): boolean {
    try {
      const mappingFile = join(this.hostingDir, 'subdomain-mapping.json');
      try {
        const data = await readFile(mappingFile, 'utf-8');
        const mapping = JSON.parse(data);
        return !mapping[subdomain];
      } catch {
        // File doesn't exist, subdomain is available
        return true;
      }
    } catch (error) {
      console.error('Availability check error:', error);
      return false;
    }
  }

  /**
   * Update subdomain mapping
   */
  private async updateSubdomainMapping(config: SubdomainConfig): Promise<void> {
    const mappingFile = join(this.hostingDir, 'subdomain-mapping.json');
    await mkdir(this.hostingDir, { recursive: true });

    let mapping: Record<string, any> = {};
    try {
      const data = await readFile(mappingFile, 'utf-8');
      mapping = JSON.parse(data);
    } catch {
      // File doesn't exist, start fresh
    }

    mapping[config.subdomain] = {
      userId: config.userId,
      documentationId: config.documentationId,
      customDomain: config.customDomain,
      createdAt: new Date().toISOString(),
    };

    await writeFile(mappingFile, JSON.stringify(mapping, null, 2));
  }

  /**
   * Generate static HTML for documentation using enterprise template
   */
  private async generateStaticHTML(doc: any, config: SubdomainConfig): Promise<string> {
    try {
      // Load templates
      const templatePath = join(process.cwd(), 'server', 'templates', 'documentation-template.html');
      const cssPath = join(process.cwd(), 'server', 'templates', 'documentation-styles.css');
      const jsPath = join(process.cwd(), 'server', 'templates', 'documentation-scripts.js');
      
      const [template, css, js] = await Promise.all([
        readFile(templatePath, 'utf-8'),
        readFile(cssPath, 'utf-8'),
        readFile(jsPath, 'utf-8')
      ]);
      
      // Parse documentation sections
      const sections = DocumentationParser.parseSections(doc.content);
      const contentHTML = DocumentationParser.sectionsToHTML(sections);
      
      // Get description from doc
      let description = '';
      try {
        const docData = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
        description = docData.description || doc.description || '';
      } catch {
        description = doc.description || '';
      }
      
      // Prepare template data
      const templateData = {
        title: doc.title || 'Documentation',
        description: description,
        sections: sections,
        content: contentHTML,
        customCSS: css,
        customJS: js,
        baseUrl: this.baseUrl,
        theme: 'light'
      };
      
      // Render template
      const html = TemplateRenderer.render(template, templateData);
      
      return html;
    } catch (error) {
      console.error('Error generating enterprise HTML:', error);
      // Fallback to basic HTML if templates fail
      return this.generateFallbackHTML(doc);
    }
  }
  
  /**
   * Fallback HTML generation if enterprise templates fail
   */
  private generateFallbackHTML(doc: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title || 'Documentation'}</title>
  <meta name="description" content="${doc.description || 'Generated documentation'}">
</head>
<body>
  <h1>${doc.title || 'Documentation'}</h1>
  <p>${doc.description || ''}</p>
  <main>${doc.content || ''}</main>
</body>
</html>`;
  }

  /**
   * Generate additional assets (CSS, JS, etc.)
   */
  private async generateAssets(path: string, doc: any): Promise<void> {
    // Generate robots.txt
    const robotsTxt = `User-agent: *\nAllow: /\nSitemap: https://${doc.subdomain || 'docs'}.${this.baseUrl}/sitemap.xml`;
    await writeFile(join(path, 'robots.txt'), robotsTxt);

    // Generate minimal CSS
    const css = `/* Additional styles can be added here */`;
    await writeFile(join(path, 'styles.css'), css);
  }

  /**
   * Provision SSL certificate for subdomain
   * In production, this would integrate with Let's Encrypt or cloud provider
   */
  private async provisionSSL(subdomain: string): Promise<'active' | 'pending' | 'disabled'> {
    console.log(`🔒 SSL provisioning for ${subdomain} (simulated in development)`);
    
    // In production:
    // 1. Use certbot/Let's Encrypt for automatic SSL
    // 2. Or integrate with cloud provider (Cloudflare, AWS ACM, etc.)
    // 3. Verify domain ownership via DNS challenge
    // 4. Install certificate
    
    return 'active'; // Simulated
  }

  /**
   * Remove subdomain deployment
   */
  async removeSubdomain(subdomain: string): Promise<void> {
    console.log(`🗑️ Removing subdomain: ${subdomain}`);
    
    const { rm } = await import('fs/promises');
    const subdomainPath = join(this.hostingDir, subdomain);
    
    try {
      await rm(subdomainPath, { recursive: true, force: true });
      
      // Update mapping
      const mappingFile = join(this.hostingDir, 'subdomain-mapping.json');
      const data = await readFile(mappingFile, 'utf-8');
      const mapping = JSON.parse(data);
      delete mapping[subdomain];
      await writeFile(mappingFile, JSON.stringify(mapping, null, 2));
      
      console.log(`✅ Subdomain removed: ${subdomain}`);
    } catch (error) {
      console.error('Subdomain removal error:', error);
      throw error;
    }
  }

  /**
   * List all active subdomains for a user
   */
  async listUserSubdomains(userId: string): Promise<string[]> {
    try {
      const mappingFile = join(this.hostingDir, 'subdomain-mapping.json');
      const data = await readFile(mappingFile, 'utf-8');
      const mapping = JSON.parse(data);
      
      return Object.keys(mapping).filter(sub => mapping[sub].userId === userId);
    } catch {
      return [];
    }
  }
}

export const subdomainHostingService = new SubdomainHostingService();
