import pino from 'pino';
import { diff } from 'just-diff';

const logger = pino({ name: 'shadow-validation' });

export interface ValidationResult {
  primary: any;
  shadow: any;
  divergence: number;
  differences: any[];
  passed: boolean;
}

export interface ShadowValidationConfig {
  enabled: boolean;
  divergenceThreshold: number;
  sampleRate: number;
  shadowModel: string;
}

const defaultConfig: ShadowValidationConfig = {
  enabled: process.env.SHADOW_VALIDATION_ENABLED === 'true',
  divergenceThreshold: parseFloat(process.env.SHADOW_DIVERGENCE_THRESHOLD || '0.1'),
  sampleRate: parseFloat(process.env.SHADOW_SAMPLE_RATE || '0.1'),
  shadowModel: process.env.SHADOW_MODEL || 'gpt-4',
};

export class ShadowValidator {
  private config: ShadowValidationConfig;
  private divergenceCount = 0;
  private totalValidations = 0;

  constructor(config: Partial<ShadowValidationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  shouldRunShadowValidation(): boolean {
    if (!this.config.enabled) return false;
    return Math.random() < this.config.sampleRate;
  }

  async validate(
    primaryOutput: any,
    shadowFn: () => Promise<any>,
    context: { stage: string; input: any }
  ): Promise<ValidationResult> {
    try {
      const shadowOutput = await shadowFn();
      const differences = diff(primaryOutput, shadowOutput);
      const divergence = this.calculateDivergence(primaryOutput, shadowOutput);

      this.totalValidations++;
      const passed = divergence <= this.config.divergenceThreshold;

      if (!passed) {
        this.divergenceCount++;
        logger.warn({
          stage: context.stage,
          divergence,
          threshold: this.config.divergenceThreshold,
          differences: differences.slice(0, 10),
          divergenceRate: this.getDivergenceRate(),
        }, 'Shadow validation detected divergence above threshold');
      }

      if (this.totalValidations % 100 === 0) {
        this.logStats();
      }

      return {
        primary: primaryOutput,
        shadow: shadowOutput,
        divergence,
        differences,
        passed,
      };
    } catch (error) {
      logger.error({ error, context }, 'Shadow validation failed');
      return {
        primary: primaryOutput,
        shadow: null,
        divergence: 1,
        differences: [],
        passed: true,
      };
    }
  }

  private calculateDivergence(primary: any, shadow: any): number {
    const primaryStr = JSON.stringify(primary);
    const shadowStr = JSON.stringify(shadow);
    
    if (primaryStr === shadowStr) return 0;

    const differences = diff(primary, shadow);
    const totalFields = this.countFields(primary);
    
    if (totalFields === 0) return 0;
    
    return Math.min(differences.length / totalFields, 1);
  }

  private countFields(obj: any): number {
    if (typeof obj !== 'object' || obj === null) return 1;
    
    let count = 0;
    for (const key in obj) {
      count += this.countFields(obj[key]);
    }
    return count;
  }

  getDivergenceRate(): number {
    if (this.totalValidations === 0) return 0;
    return this.divergenceCount / this.totalValidations;
  }

  getStats() {
    return {
      totalValidations: this.totalValidations,
      divergenceCount: this.divergenceCount,
      divergenceRate: this.getDivergenceRate(),
      config: this.config,
    };
  }

  private logStats() {
    const stats = this.getStats();
    logger.info(stats, 'Shadow validation statistics');

    if (stats.divergenceRate > 0.1) {
      logger.warn({
        divergenceRate: stats.divergenceRate,
        threshold: 0.1,
      }, 'Shadow validation divergence rate exceeds 10% - possible model drift detected');
    }
  }

  reset() {
    this.divergenceCount = 0;
    this.totalValidations = 0;
  }
}

export const globalShadowValidator = new ShadowValidator();

export async function withShadowValidation<T>(
  stage: string,
  primaryFn: () => Promise<T>,
  shadowFn: () => Promise<T>,
  input: any
): Promise<T> {
  const validator = globalShadowValidator;

  if (!validator.shouldRunShadowValidation()) {
    return primaryFn();
  }

  const primary = await primaryFn();

  validator.validate(primary, shadowFn, { stage, input }).catch(error => {
    logger.error({ error, stage }, 'Shadow validation error (non-blocking)');
  });

  return primary;
}
