import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll } from 'vitest';

/**
 * Hermetic $HOME sandbox.
 *
 * Many tests install or remove skills at *global* scope (`-g`), which the CLI
 * resolves under `homedir()` (see `getCanonicalSkillsDir` in installer.ts) —
 * i.e. the developer's real `~/.agents/skills` and `~/.claude/skills`. Node's
 * `os.homedir()` honors `$HOME` on POSIX, and the CLI subprocesses spawned by
 * `runCli` inherit the environment, so redirecting `$HOME` here makes every
 * global-scope side effect land in a throwaway directory instead of the real
 * home — where, untreated, remove/`--all` tests can wipe a curated skill set
 * (and `~/.agents` is frequently a git repo, so the churn is even noisier).
 *
 * XDG base dirs must be redirected too: GitHub-hosted runners export
 * `XDG_CONFIG_HOME`, so leaving them unset would resolve in-process agents to
 * the real `~/.config` instead of the sandbox. The values mirror
 * `createTestHomeEnvironment` in src/test-utils.ts.
 */
const sandboxHome = mkdtempSync(join(tmpdir(), 'skills-test-home-'));
process.env.HOME = sandboxHome;
process.env.USERPROFILE = sandboxHome; // Windows equivalent
process.env.XDG_CONFIG_HOME = join(sandboxHome, '.config');
process.env.XDG_DATA_HOME = join(sandboxHome, '.local', 'share');
process.env.XDG_STATE_HOME = join(sandboxHome, '.local', 'state');
process.env.XDG_CACHE_HOME = join(sandboxHome, '.cache');

afterAll(() => {
  try {
    rmSync(sandboxHome, { recursive: true, force: true });
  } catch {
    // best-effort cleanup; the OS temp dir is reclaimed regardless
  }
});
