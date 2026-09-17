import { describe, expect, it } from 'vitest';
import {
  collectAgentValues,
  expandAgentValues,
  getEffectiveAgentTargets,
  getInvalidAgentNames,
  normalizeAgentTargets,
} from './agent-options.ts';

describe('agent option helpers', () => {
  it('collects values until the next option', () => {
    expect(collectAgentValues(['--agent', 'universal', 'pi', '-y'], 0)).toEqual({
      values: ['universal', 'pi'],
      endIndex: 2,
    });
  });

  it('normalizes universal aliases to the canonical target', () => {
    expect(normalizeAgentTargets(['codex', 'cursor', 'pi'])).toEqual(['universal', 'pi']);
  });

  it('excludes skipped and failed targets from effective agents', () => {
    expect(
      getEffectiveAgentTargets([
        { agentType: 'codex', success: true },
        { agentType: 'pi', success: true, skipped: true },
        { agentType: 'claude-code', success: false },
      ])
    ).toEqual(['universal']);
  });

  it('expands the wildcard and reports invalid names', () => {
    expect(expandAgentValues(['*'])).toContain('pi');
    expect(getInvalidAgentNames(['universal', 'not-an-agent'])).toEqual(['not-an-agent']);
  });
});
