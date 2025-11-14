/**
 * Competitive Intelligence Battlecard PDF Generator
 * Generates professional competitor battlecards from multi-source research data
 */

import PDFKit from 'pdfkit';
import { Readable } from 'stream';

export interface BattlecardData {
  competitorName: string;
  generatedAt: string;
  overview: {
    description: string;
    marketPosition: string;
    targetCustomers: string;
  };
  pricing: {
    model: string;
    tiers: Array<{ name: string; price: string; features: string[] }>;
    complaints: string[];
  };
  strengths: string[];
  weaknesses: string[];
  customerSentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    commonPraise: string[];
    commonComplaints: string[];
    migrationSignals: string[];
  };
  technicalInsights: {
    githubIssues: Array<{ title: string; url: string; votes: number }>;
    stackOverflowTopics: Array<{ question: string; url: string; votes: number }>;
    popularUses: string[];
  };
  sources: {
    reddit: number;
    stackOverflow: number;
    github: number;
    youtube: number;
    devTo: number;
    forums: number;
  };
}

export class BattlecardGenerator {
  private readonly pageWidth = 612; // 8.5 inches at 72 DPI
  private readonly pageHeight = 792; // 11 inches at 72 DPI
  private readonly margin = 50;
  private readonly contentWidth = this.pageWidth - (this.margin * 2);

  /**
   * Generate PDF battlecard from competitive intelligence data
   */
  async generatePDF(data: BattlecardData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFKit({
        size: 'LETTER',
        margins: {
          top: this.margin,
          bottom: this.margin,
          left: this.margin,
          right: this.margin
        },
        bufferPages: true
      });

      // Collect PDF chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        this.renderBattlecard(doc, data);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private renderBattlecard(doc: typeof PDFKit, data: BattlecardData): void {
    let yPosition = this.margin;

    // Header
    yPosition = this.renderHeader(doc, data.competitorName, data.generatedAt, yPosition);

    // Overview Section
    yPosition = this.renderSection(doc, 'Company Overview', yPosition);
    yPosition = this.renderText(doc, data.overview.description, yPosition);
    yPosition = this.renderKeyValue(doc, 'Market Position', data.overview.marketPosition, yPosition);
    yPosition = this.renderKeyValue(doc, 'Target Customers', data.overview.targetCustomers, yPosition);
    yPosition += 20;

    // Pricing Section
    yPosition = this.checkPageBreak(doc, yPosition, 150);
    yPosition = this.renderSection(doc, 'Pricing Intelligence', yPosition);
    yPosition = this.renderKeyValue(doc, 'Model', data.pricing.model, yPosition);
    
    if (data.pricing.tiers.length > 0) {
      yPosition += 10;
      data.pricing.tiers.forEach(tier => {
        yPosition = this.checkPageBreak(doc, yPosition, 80);
        doc.fontSize(10).font('Helvetica-Bold').text(`${tier.name}: ${tier.price}`, this.margin, yPosition);
        yPosition += 15;
        tier.features.slice(0, 3).forEach(feature => {
          doc.fontSize(9).font('Helvetica').text(`• ${feature}`, this.margin + 20, yPosition);
          yPosition += 12;
        });
        yPosition += 5;
      });
    }

    if (data.pricing.complaints.length > 0) {
      yPosition += 10;
      doc.fontSize(10).font('Helvetica-Bold').text('Pricing Complaints:', this.margin, yPosition);
      yPosition += 15;
      data.pricing.complaints.slice(0, 5).forEach(complaint => {
        yPosition = this.checkPageBreak(doc, yPosition, 25);
        doc.fontSize(9).font('Helvetica').fillColor('#D32F2F').text(`⚠ ${complaint}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 20
        });
        yPosition += doc.heightOfString(`⚠ ${complaint}`, { width: this.contentWidth - 20 }) + 8;
        doc.fillColor('#000000');
      });
    }
    yPosition += 20;

    // Strengths & Weaknesses
    yPosition = this.checkPageBreak(doc, yPosition, 100);
    yPosition = this.renderSection(doc, 'Competitive Analysis', yPosition);
    
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2E7D32').text('Strengths:', this.margin, yPosition);
    yPosition += 15;
    data.strengths.slice(0, 5).forEach(strength => {
      yPosition = this.checkPageBreak(doc, yPosition, 25);
      doc.fontSize(9).font('Helvetica').fillColor('#000000').text(`+ ${strength}`, this.margin + 20, yPosition, {
        width: this.contentWidth - 20
      });
      yPosition += doc.heightOfString(`+ ${strength}`, { width: this.contentWidth - 20 }) + 8;
    });

    yPosition += 15;
    yPosition = this.checkPageBreak(doc, yPosition, 100);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#D32F2F').text('Weaknesses:', this.margin, yPosition);
    yPosition += 15;
    data.weaknesses.slice(0, 5).forEach(weakness => {
      yPosition = this.checkPageBreak(doc, yPosition, 25);
      doc.fontSize(9).font('Helvetica').fillColor('#000000').text(`− ${weakness}`, this.margin + 20, yPosition, {
        width: this.contentWidth - 20
      });
      yPosition += doc.heightOfString(`− ${weakness}`, { width: this.contentWidth - 20 }) + 8;
    });
    doc.fillColor('#000000');
    yPosition += 20;

    // Customer Sentiment
    yPosition = this.checkPageBreak(doc, yPosition, 150);
    yPosition = this.renderSection(doc, 'Customer Sentiment Analysis', yPosition);
    
    const sentimentColor = data.customerSentiment.overall === 'positive' ? '#2E7D32' 
                          : data.customerSentiment.overall === 'negative' ? '#D32F2F' 
                          : '#F57C00';
    doc.fontSize(10).font('Helvetica-Bold').text('Overall Sentiment: ', this.margin, yPosition, { continued: true });
    doc.fillColor(sentimentColor).text(data.customerSentiment.overall.toUpperCase());
    doc.fillColor('#000000');
    yPosition += 20;

    if (data.customerSentiment.commonPraise.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold').text('What Customers Love:', this.margin, yPosition);
      yPosition += 15;
      data.customerSentiment.commonPraise.slice(0, 4).forEach(praise => {
        yPosition = this.checkPageBreak(doc, yPosition, 25);
        doc.fontSize(9).font('Helvetica').text(`💚 ${praise}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 20
        });
        yPosition += doc.heightOfString(`💚 ${praise}`, { width: this.contentWidth - 20 }) + 8;
      });
    }

    yPosition += 10;
    if (data.customerSentiment.commonComplaints.length > 0) {
      yPosition = this.checkPageBreak(doc, yPosition, 80);
      doc.fontSize(9).font('Helvetica-Bold').text('What Customers Complain About:', this.margin, yPosition);
      yPosition += 15;
      data.customerSentiment.commonComplaints.slice(0, 4).forEach(complaint => {
        yPosition = this.checkPageBreak(doc, yPosition, 25);
        doc.fontSize(9).font('Helvetica').text(`💔 ${complaint}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 20
        });
        yPosition += doc.heightOfString(`💔 ${complaint}`, { width: this.contentWidth - 20 }) + 8;
      });
    }

    yPosition += 10;
    if (data.customerSentiment.migrationSignals.length > 0) {
      yPosition = this.checkPageBreak(doc, yPosition, 80);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#D32F2F').text('Migration Signals (Switching Away):', this.margin, yPosition);
      doc.fillColor('#000000');
      yPosition += 15;
      data.customerSentiment.migrationSignals.slice(0, 4).forEach(signal => {
        yPosition = this.checkPageBreak(doc, yPosition, 25);
        doc.fontSize(9).font('Helvetica').text(`🚨 ${signal}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 20
        });
        yPosition += doc.heightOfString(`🚨 ${signal}`, { width: this.contentWidth - 20 }) + 8;
      });
    }
    yPosition += 20;

    // Technical Insights
    yPosition = this.checkPageBreak(doc, yPosition, 150);
    yPosition = this.renderSection(doc, 'Technical Insights', yPosition);

    if (data.technicalInsights.githubIssues.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').text('Top GitHub Issues:', this.margin, yPosition);
      yPosition += 15;
      data.technicalInsights.githubIssues.slice(0, 5).forEach(issue => {
        yPosition = this.checkPageBreak(doc, yPosition, 30);
        doc.fontSize(9).font('Helvetica').text(`• ${issue.title}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 40,
          link: issue.url
        });
        yPosition += doc.heightOfString(`• ${issue.title}`, { width: this.contentWidth - 40 }) + 5;
        doc.fontSize(8).fillColor('#666666').text(`  ${issue.votes} reactions • ${issue.url}`, this.margin + 20, yPosition);
        yPosition += 15;
        doc.fillColor('#000000');
      });
    }

    yPosition += 10;
    if (data.technicalInsights.stackOverflowTopics.length > 0) {
      yPosition = this.checkPageBreak(doc, yPosition, 80);
      doc.fontSize(10).font('Helvetica-Bold').text('Stack Overflow Discussions:', this.margin, yPosition);
      yPosition += 15;
      data.technicalInsights.stackOverflowTopics.slice(0, 5).forEach(topic => {
        yPosition = this.checkPageBreak(doc, yPosition, 30);
        doc.fontSize(9).font('Helvetica').text(`• ${topic.question}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 40,
          link: topic.url
        });
        yPosition += doc.heightOfString(`• ${topic.question}`, { width: this.contentWidth - 40 }) + 5;
        doc.fontSize(8).fillColor('#666666').text(`  ${topic.votes} votes • ${topic.url}`, this.margin + 20, yPosition);
        yPosition += 15;
        doc.fillColor('#000000');
      });
    }

    yPosition += 10;
    if (data.technicalInsights.popularUses.length > 0) {
      yPosition = this.checkPageBreak(doc, yPosition, 80);
      doc.fontSize(10).font('Helvetica-Bold').text('Popular Use Cases:', this.margin, yPosition);
      yPosition += 15;
      data.technicalInsights.popularUses.slice(0, 6).forEach(useCase => {
        yPosition = this.checkPageBreak(doc, yPosition, 20);
        doc.fontSize(9).font('Helvetica').text(`• ${useCase}`, this.margin + 20, yPosition, {
          width: this.contentWidth - 20
        });
        yPosition += doc.heightOfString(`• ${useCase}`, { width: this.contentWidth - 20 }) + 8;
      });
    }
    yPosition += 20;

    // Data Sources Footer
    yPosition = this.checkPageBreak(doc, yPosition, 80);
    yPosition = this.renderSection(doc, 'Data Sources', yPosition);
    const sourcesText = `This battlecard was generated from ${
      data.sources.reddit + data.sources.stackOverflow + data.sources.github + 
      data.sources.youtube + data.sources.devTo + data.sources.forums
    } community sources: Reddit (${data.sources.reddit}), Stack Overflow (${data.sources.stackOverflow}), ` +
    `GitHub (${data.sources.github}), YouTube (${data.sources.youtube}), DEV.to (${data.sources.devTo}), Forums (${data.sources.forums})`;
    
    doc.fontSize(8).font('Helvetica').fillColor('#666666').text(sourcesText, this.margin, yPosition, {
      width: this.contentWidth,
      align: 'left'
    });
  }

  private renderHeader(doc: typeof PDFKit, competitorName: string, generatedAt: string, yPosition: number): number {
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1976D2').text(
      `${competitorName} Battlecard`,
      this.margin,
      yPosition,
      { width: this.contentWidth, align: 'left' }
    );
    yPosition += 35;

    doc.fontSize(9).font('Helvetica').fillColor('#666666').text(
      `Generated: ${new Date(generatedAt).toLocaleString('en-US', { 
        dateStyle: 'long', 
        timeStyle: 'short' 
      })}`,
      this.margin,
      yPosition
    );
    doc.fillColor('#000000');
    yPosition += 30;

    // Horizontal line
    doc.moveTo(this.margin, yPosition).lineTo(this.pageWidth - this.margin, yPosition).stroke('#CCCCCC');
    yPosition += 25;

    return yPosition;
  }

  private renderSection(doc: typeof PDFKit, title: string, yPosition: number): number {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1976D2').text(
      title,
      this.margin,
      yPosition
    );
    doc.fillColor('#000000');
    yPosition += 20;

    // Underline
    doc.moveTo(this.margin, yPosition).lineTo(this.margin + 150, yPosition).stroke('#1976D2');
    yPosition += 15;

    return yPosition;
  }

  private renderText(doc: typeof PDFKit, text: string, yPosition: number): number {
    doc.fontSize(10).font('Helvetica').text(text, this.margin, yPosition, {
      width: this.contentWidth,
      align: 'left'
    });
    yPosition += doc.heightOfString(text, { width: this.contentWidth }) + 15;
    return yPosition;
  }

  private renderKeyValue(doc: typeof PDFKit, key: string, value: string, yPosition: number): number {
    doc.fontSize(10).font('Helvetica-Bold').text(`${key}: `, this.margin, yPosition, { continued: true });
    doc.font('Helvetica').text(value, { width: this.contentWidth - 150 });
    yPosition += doc.heightOfString(value, { width: this.contentWidth - 150 }) + 12;
    return yPosition;
  }

  private checkPageBreak(doc: typeof PDFKit, yPosition: number, requiredSpace: number): number {
    if (yPosition + requiredSpace > this.pageHeight - this.margin) {
      doc.addPage();
      return this.margin;
    }
    return yPosition;
  }
}

// Export singleton instance
export const battlecardGenerator = new BattlecardGenerator();
