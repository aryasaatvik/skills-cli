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
 * XDG base dirs are intentionally left untouched: when unset they resolve to
 * `$HOME`-relative paths (so they follow the sandbox), and
 * tests/xdg-config-paths.test.ts sets/clears `XDG_STATE_HOME` itself.
 */
const sandboxHome = mkdtempSync(join(tmpdir(), 'skills-test-home-'));
process.env.HOME = sandboxHome;
process.env.USERPROFILE = sandboxHome; // Windows equivalent

afterAll(() => {
  try {
    rmSync(sandboxHome, { recursive: true, force: true });
  } catch {
    // best-effort cleanup; the OS temp dir is reclaimed regardless
  }
});
