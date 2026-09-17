import { agents, isUniversalAgent } from './agents.ts';
import type { AgentType } from './types.ts';

/** Values collected after an --agent/-a flag and the final consumed index. */
export interface ParsedAgentValues {
  values: string[];
  endIndex: number;
}

/**
 * Collect agent values until the next option. Agent-bearing commands all use
 * this grammar so `--agent one two` and repeated flags behave consistently.
 */
export function collectAgentValues(args: string[], flagIndex: number): ParsedAgentValues {
  let endIndex = flagIndex + 1;
  while (endIndex < args.length && !args[endIndex]!.startsWith('-')) {
    endIndex++;
  }

  return {
    values: args.slice(flagIndex + 1, endIndex),
    endIndex: endIndex - 1,
  };
}

export function getValidAgentNames(): string[] {
  return Object.keys(agents);
}

export function getInvalidAgentNames(values: string[]): string[] {
  const validAgents = new Set(getValidAgentNames());
  return values.filter((value) => value !== '*' && !validAgents.has(value));
}

export function normalizeAgentTargets(targets: AgentType[]): AgentType[] {
  const normalized: AgentType[] = [];
  let hasUniversal = false;

  for (const target of targets) {
    if (isUniversalAgent(target)) {
      hasUniversal = true;
      continue;
    }
    if (!normalized.includes(target)) normalized.push(target);
  }

  return hasUniversal ? ['universal', ...normalized] : normalized;
}

/** Keep only targets that produced an install, collapsing universal aliases. */
export function getEffectiveAgentTargets(
  results: ReadonlyArray<{ agentType: AgentType; success: boolean; skipped?: boolean }>
): AgentType[] {
  return normalizeAgentTargets(
    results.filter((result) => result.success && !result.skipped).map((result) => result.agentType)
  );
}

export function expandAgentValues(values: string[]): AgentType[] {
  if (values.includes('*')) return getValidAgentNames() as AgentType[];
  return values as AgentType[];
}
