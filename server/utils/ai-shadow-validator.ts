import { monitoring } from '../monitoring';
import { createAIProvider, AIMessage } from '../ai-provider';

/**
 * Optional shadow validation of AI JSON outputs using a secondary provider.
 * Enabled when SHADOW_VALIDATION=1. Records divergence metrics only.
 */
export async function shadowValidateJSON(stage: string, jsonString: string): Promise<void> {
  if (process.env.SHADOW_VALIDATION !== '1' && process.env.SHADOW_VALIDATION !== 'true') return;
  try {
    const provider = createAIProvider();
    const messages: AIMessage[] = [
      { role: 'system', content: 'You are a strict JSON validator. Reply ONLY with a short JSON object: {"valid": boolean, "reason"?: string}.' },
      { role: 'user', content: `Validate this JSON for structural correctness and coherence. Respond with {valid: boolean, reason?: string} and no extra text.\n\n${jsonString}` }
    ];
    const resp = await provider.generateCompletion(messages, { jsonMode: true, timeoutMs: 20000 });
    const verdict = JSON.parse(resp.content || '{}') as { valid?: boolean; reason?: string };
    const valid = verdict && verdict.valid === true;
    monitoring.recordMetric('ai.shadow_validation', 0, valid, valid ? undefined : (verdict.reason || 'invalid'), {
      stage,
      provider: resp.provider,
    });
  } catch (e: any) {
    monitoring.recordMetric('ai.shadow_validation', 0, false, e?.message || 'shadow_error', { stage });
  }
}


