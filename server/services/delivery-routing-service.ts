/**
 * Delivery Routing Service
 * 
 * Routes documentation generation through different AI provider pipelines
 * based on delivery option:
 * 
 * - STANDARD (72h): Free APIs (DeepSeek, etc.) + GPT-4 validation
 * - RUSH (24-48h): OpenAI GPT-4 only for everything
 * - SAME-DAY (12h): OpenAI GPT-4 only for everything
 */

import type { AIProvider } from '../ai-provider';
import { QualityValidationService, type QualityValidationResult } from './quality-validation-service';

export type DeliveryOption = 'standard' | 'rush' | 'same-day';

export interface DeliveryConfig {
  delivery: DeliveryOption;
  useOpenAIOnly: boolean;
  performQualityValidation: boolean;
  qualityThreshold: number;
  maxValidationPasses: number;
}

export interface GenerationProviders {
  primary: AIProvider | null;
  validation: AIProvider | null;
}

export class DeliveryRoutingService {
  private freeProvider: AIProvider | null;
  private openaiProvider: AIProvider | null;
  private validationService: QualityValidationService;

  constructor(
    freeProvider: AIProvider | null,
    openaiProvider: AIProvider | null
  ) {
    this.freeProvider = freeProvider;
    this.openaiProvider = openaiProvider;
    this.validationService = new QualityValidationService(openaiProvider);
  }

  /**
   * Get delivery configuration based on delivery option
   */
  getDeliveryConfig(delivery: DeliveryOption): DeliveryConfig {
    switch (delivery) {
      case 'rush':
      case 'same-day':
        return {
          delivery,
          useOpenAIOnly: true,
          performQualityValidation: false, // Skip validation for rush - GPT-4 is already high quality
          qualityThreshold: 0,
          maxValidationPasses: 0,
        };

      case 'standard':
      default:
        return {
          delivery: 'standard',
          useOpenAIOnly: false,
          performQualityValidation: true,
          qualityThreshold: 80, // Overall score must be 80+
          maxValidationPasses: 3, // Allow up to 3 validation attempts
        };
    }
  }

  /**
   * Get AI providers for generation based on delivery config
   */
  getGenerationProviders(config: DeliveryConfig): GenerationProviders {
    if (config.useOpenAIOnly) {
      console.log(`🚀 [DELIVERY ROUTING] Using OpenAI GPT-4 for rush delivery`);
      return {
        primary: this.openaiProvider,
        validation: null, // No separate validation needed
      };
    }

    console.log(`⏱️  [DELIVERY ROUTING] Using free APIs + GPT-4 validation for standard delivery`);
    return {
      primary: this.freeProvider || this.openaiProvider, // Fallback to OpenAI if no free provider
      validation: this.openaiProvider,
    };
  }

  /**
   * Validate documentation quality (for standard delivery only)
   */
  async validateQuality(
    productName: string,
    documentation: string,
    sourcesSummary: string,
    targetUrl: string,
    config: DeliveryConfig
  ): Promise<QualityValidationResult | null> {
    if (!config.performQualityValidation) {
      console.log(`⏭️  [QUALITY VALIDATION] Skipped for ${config.delivery} delivery`);
      return null;
    }

    console.log(`🔍 [QUALITY VALIDATION] Starting validation for ${productName}...`);
    
    const result = await this.validationService.validateDocumentation(
      productName,
      documentation,
      sourcesSummary,
      targetUrl,
      {
        minOverallScore: config.qualityThreshold,
        minCategoryScore: 70,
        requireAllCategories: true,
      }
    );

    return result;
  }

  /**
   * Get delivery time estimate in hours
   */
  getDeliveryTimeHours(delivery: DeliveryOption): number {
    switch (delivery) {
      case 'same-day':
        return 12;
      case 'rush':
        return 24;
      case 'standard':
      default:
        return 72;
    }
  }

  /**
   * Get delivery time description
   */
  getDeliveryDescription(delivery: DeliveryOption): string {
    switch (delivery) {
      case 'same-day':
        return 'Same-day delivery (12 hours) using premium OpenAI GPT-4';
      case 'rush':
        return 'Rush delivery (24-48 hours) using premium OpenAI GPT-4';
      case 'standard':
      default:
        return 'Standard delivery (3-5 days) using optimized free APIs with GPT-4 quality validation';
    }
  }

  /**
   * Check if delivery option requires premium AI
   */
  isPremiumDelivery(delivery: DeliveryOption): boolean {
    return delivery === 'rush' || delivery === 'same-day';
  }

  /**
   * Get recommended AI provider name for delivery option
   */
  getProviderName(delivery: DeliveryOption): string {
    return this.isPremiumDelivery(delivery) ? 'OpenAI GPT-4' : 'DeepSeek/Free APIs + GPT-4 Validation';
  }

  /**
   * Estimate API cost for delivery option
   */
  estimateAPICost(delivery: DeliveryOption, documentSize: 'small' | 'medium' | 'large'): number {
    const baseCosts = {
      small: 0.50,
      medium: 1.50,
      large: 3.00,
    };

    if (this.isPremiumDelivery(delivery)) {
      // OpenAI only - higher cost but faster
      return baseCosts[documentSize] * 8; // 8x multiplier for GPT-4
    } else {
      // Free APIs + validation - mostly free with small validation cost
      return baseCosts[documentSize] * 0.5; // Just validation cost
    }
  }

  /**
   * Log delivery routing decision
   */
  logRoutingDecision(delivery: DeliveryOption, productName: string): void {
    const config = this.getDeliveryConfig(delivery);
    const providers = this.getGenerationProviders(config);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📋 DELIVERY ROUTING DECISION`);
    console.log('='.repeat(60));
    console.log(`Product: ${productName}`);
    console.log(`Delivery Option: ${delivery.toUpperCase()}`);
    console.log(`Description: ${this.getDeliveryDescription(delivery)}`);
    console.log(`Primary Provider: ${providers.primary ? 'Available' : 'Not Available'}`);
    console.log(`Validation Provider: ${providers.validation ? 'Available' : 'Not Available'}`);
    console.log(`Quality Validation: ${config.performQualityValidation ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Quality Threshold: ${config.qualityThreshold}/100`);
    console.log(`Estimated Delivery: ${this.getDeliveryTimeHours(delivery)} hours`);
    console.log('='.repeat(60) + '\n');
  }
}
