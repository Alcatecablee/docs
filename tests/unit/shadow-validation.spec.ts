import { describe, it, expect, beforeEach } from 'vitest';
import { ShadowValidator } from '../../server/utils/shadow-validation';

describe('Shadow Validation', () => {
  let validator: ShadowValidator;

  beforeEach(() => {
    validator = new ShadowValidator({
      enabled: true,
      divergenceThreshold: 0.1,
      sampleRate: 1.0,
    });
  });

  describe('Divergence Detection', () => {
    it('should detect no divergence for identical outputs', async () => {
      const primary = { title: 'Test', content: ['a', 'b', 'c'] };
      const shadow = { title: 'Test', content: ['a', 'b', 'c'] };

      const result = await validator.validate(
        primary,
        async () => shadow,
        { stage: 'test', input: {} }
      );

      expect(result.divergence).toBe(0);
      expect(result.passed).toBe(true);
      expect(result.differences.length).toBe(0);
    });

    it('should detect divergence for different outputs', async () => {
      const primary = { title: 'Original', sections: ['A', 'B'] };
      const shadow = { title: 'Modified', sections: ['A', 'C'] };

      const result = await validator.validate(
        primary,
        async () => shadow,
        { stage: 'test', input: {} }
      );

      expect(result.divergence).toBeGreaterThan(0);
      expect(result.differences.length).toBeGreaterThan(0);
    });

    it('should fail validation when divergence exceeds threshold', async () => {
      const primary = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const shadow = { a: 9, b: 8, c: 7, d: 6, e: 5 };

      const result = await validator.validate(
        primary,
        async () => shadow,
        { stage: 'test', input: {} }
      );

      expect(result.divergence).toBeGreaterThan(0.1);
      expect(result.passed).toBe(false);
    });
  });

  describe('Statistics Tracking', () => {
    it('should track divergence rate across multiple validations', async () => {
      const validations = [
        { primary: { a: 1 }, shadow: { a: 1 }, expectPass: true },
        { primary: { a: 1 }, shadow: { a: 2 }, expectPass: false },
        { primary: { a: 1 }, shadow: { a: 1 }, expectPass: true },
        { primary: { a: 1 }, shadow: { a: 1 }, expectPass: true },
      ];

      for (const { primary, shadow } of validations) {
        await validator.validate(
          primary,
          async () => shadow,
          { stage: 'test', input: {} }
        );
      }

      const stats = validator.getStats();
      expect(stats.totalValidations).toBe(4);
      expect(stats.divergenceCount).toBe(1);
      expect(stats.divergenceRate).toBe(0.25);
    });

    it('should reset statistics', () => {
      validator.reset();
      const stats = validator.getStats();
      expect(stats.totalValidations).toBe(0);
      expect(stats.divergenceCount).toBe(0);
      expect(stats.divergenceRate).toBe(0);
    });
  });

  describe('Sampling', () => {
    it('should respect sample rate configuration', () => {
      const lowSampleValidator = new ShadowValidator({
        enabled: true,
        sampleRate: 0,
      });

      const shouldRun = lowSampleValidator.shouldRunShadowValidation();
      expect(shouldRun).toBe(false);
    });

    it('should be disabled when config is disabled', () => {
      const disabledValidator = new ShadowValidator({
        enabled: false,
        sampleRate: 1.0,
      });

      const shouldRun = disabledValidator.shouldRunShadowValidation();
      expect(shouldRun).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle shadow function errors gracefully', async () => {
      const primary = { data: 'test' };
      const shadowFn = async () => {
        throw new Error('Shadow model failed');
      };

      const result = await validator.validate(
        primary,
        shadowFn,
        { stage: 'test', input: {} }
      );

      expect(result.primary).toEqual(primary);
      expect(result.shadow).toBeNull();
      expect(result.passed).toBe(true);
    });

    it('should handle complex nested objects', async () => {
      const primary = {
        title: 'Complex',
        nested: {
          deep: {
            value: [1, 2, 3],
            map: { a: true, b: false }
          }
        }
      };

      const shadow = JSON.parse(JSON.stringify(primary));
      shadow.nested.deep.map.a = false;

      const result = await validator.validate(
        primary,
        async () => shadow,
        { stage: 'test', input: {} }
      );

      expect(result.differences.length).toBeGreaterThan(0);
      expect(result.divergence).toBeGreaterThan(0);
    });
  });
});
