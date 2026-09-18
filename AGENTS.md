# AGENTS.md

This file provides guidance to AI coding agents working on the `skills` CLI codebase.

## Project Overview

`skills` is the CLI for the open agent skills ecosystem.

## Commands

| Command                       | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `skills`                      | Show banner with available commands                 |
| `skills add <pkg>`            | Install skills from git repos, URLs, or local paths |
| `skills use <pkg>@<skill>`    | Use one skill without installing                    |
| `skills experimental_install` | Restore skills from skills-lock.json                |
| `skills experimental_sync`    | Sync skills from node_modules into agent dirs       |
| `skills list`                 | List installed skills (alias: `ls`)                 |
| `skills update [skills...]`   | Update skills to latest versions                    |
| `skills init [name]`          | Create a new SKILL.md template                      |

Aliases: `skills a` works for `add`. `skills i`, `skills install` (no args) restore from `skills-lock.json`. `skills ls` works for `list`. `skills experimental_install` restores from `skills-lock.json`. `skills experimental_sync` crawls `node_modules` for skills.

## Architecture

```
src/
├── cli.ts           # Main entry point, command routing
├── cli.test.ts      # CLI tests
├── add.ts           # Core add command logic
├── add-prompt.test.ts # Add prompt behavior tests
├── add.test.ts      # Add command tests
├── install.ts       # Restore skills from skills-lock.json
├── update.ts        # Update command - hash compare + reinstall
├── update-source.ts # Source URL/ref helpers for updates
├── update-source.test.ts
├── use.ts           # Use command - generate a skill prompt or launch an agent
├── use.test.ts      # Use command tests
├── find.ts          # Find/search command
├── find.test.ts     # Find command tests
├── list.ts          # List installed skills command
├── list.test.ts     # List command tests
├── remove.ts        # Remove command implementation
├── remove.test.ts   # Remove command tests
├── parse-remove-options.test.ts
├── sync.ts          # Sync command - crawl node_modules for skills
├── constants.ts     # Shared constants
├── agents.ts        # Agent definitions and detection
├── agent-options.ts # --agent flag parsing
├── agent-options.test.ts
├── detect-agent.ts  # Runtime agent detection
├── detect-agent.test.ts
├── installer.ts     # Skill installation logic (symlink/copy) + listInstalledSkills
├── skills.ts        # Skill discovery and parsing
├── skill-lock.ts    # Global lock file management (~/.agents/.skill-lock.json)
├── skill-lock.test.ts
├── local-lock.ts    # Local lock file management (skills-lock.json, checked in)
├── skill-relocation.ts # Resolve locked skills that moved on disk
├── skill-relocation.test.ts
├── source-parser.ts # Parse git URLs, GitHub shorthand, local paths
├── source-parser.test.ts
├── git.ts           # Git clone operations
├── git.test.ts
├── github-host.ts   # GH_HOST handling for clone/API URLs
├── blob.ts          # Blob-based skill download (skills.sh + GitHub trees)
├── download-source.ts # tar/zip download + extract
├── archive.ts       # Zip archive reading/validation
├── frontmatter.ts   # YAML frontmatter parsing for SKILL.md
├── sanitize.ts      # Strip terminal escapes from untrusted strings
├── telemetry.ts     # Anonymous usage tracking
├── types.ts         # TypeScript types
├── plugin-manifest.ts # Plugin manifest discovery support
├── prompts/         # Interactive prompt helpers
│   └── search-multiselect.ts
├── providers/       # Remote skill providers (GitHub, HuggingFace, Mintlify)
│   ├── index.ts
│   ├── registry.ts
│   ├── types.ts
│   └── wellknown.ts
├── init.test.ts     # Init command tests
├── test-utils.ts    # Test utilities
└── test-utils.test.ts

tests/
├── cross-platform-paths.test.ts # Path normalization across platforms
├── full-depth-discovery.test.ts # --full-depth skill discovery tests
├── openclaw-paths.test.ts       # OpenClaw-specific path tests
├── plugin-manifest-discovery.test.ts # Plugin manifest skill discovery
├── sanitize-name.test.ts     # Tests for sanitizeName (path traversal prevention)
├── skill-matching.test.ts    # Tests for filterSkills (multi-word skill name matching)
├── source-parser.test.ts     # Tests for URL/path parsing
├── installer-symlink.test.ts # Tests for symlink installation
├── list-installed.test.ts    # Tests for listing installed skills
├── skill-path.test.ts        # Tests for skill path handling
├── wellknown-provider.test.ts # Tests for well-known provider
├── xdg-config-paths.test.ts   # XDG global path handling tests
└── dist.test.ts               # Tests for built distribution
```

## Update Checking System

### How `skills check` and `skills update` Work

1. Read `~/.agents/.skill-lock.json` for installed skills
2. Filter to GitHub-backed skills that have both `skillFolderHash` and `skillPath`
3. For each skill, call `fetchSkillFolderHash(source, skillPath, token)`. Tree requests start anonymously, then use an explicit `GITHUB_TOKEN`/`GH_TOKEN`, then `gh api` without exporting the GitHub CLI credential.
4. `fetchSkillFolderHash` calls the GitHub Trees API (`/git/trees/<branch>?recursive=1` for `main`, then `master` fallback); update checks fall back to an authenticated Git clone when API access is unavailable.
5. Compare latest folder tree SHA with lock file `skillFolderHash`; mismatch means update available
6. `skills update` reinstalls changed skills by invoking the current CLI entrypoint directly (`node <repo>/bin/cli.mjs add <source-tree-url> -g -y`) to avoid nested npm exec/npx behavior

### Lock File Compatibility

The lock file format is v3. Key field: `skillFolderHash` (GitHub tree SHA for the skill folder).

If reading an older lock file version, it's wiped. Users must reinstall skills to populate the new format.

## Key Integration Points

| Feature                    | Implementation                                                |
| -------------------------- | ------------------------------------------------------------- |
| `skills add`               | `src/add.ts` - full implementation                            |
| `skills experimental_sync` | `src/sync.ts` - crawl node_modules                            |
| `skills check`             | `src/cli.ts` + `fetchSkillFolderHash` in `src/skill-lock.ts`  |
| `skills update`            | `src/cli.ts` direct hash compare + reinstall via `skills add` |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test locally
pnpm dev add vercel-labs/agent-skills --list
pnpm dev experimental_sync
pnpm dev check
pnpm dev update
pnpm dev init my-skill

# Run all tests
pnpm test

# Run specific test file(s)
pnpm test tests/sanitize-name.test.ts
pnpm test tests/skill-matching.test.ts tests/source-parser.test.ts

# Type check
pnpm type-check

# Format code
pnpm format

# Check formatting
pnpm format:check

# Validate and sync agent metadata/docs
pnpm run -C scripts validate-agents.ts
pnpm run -C scripts sync-agents.ts
```

## Code Style

This project uses Prettier for code formatting. **Always run `pnpm format` before committing changes** to ensure consistent formatting.

```bash
# Format all files
pnpm format

# Check formatting without fixing
pnpm format:check
```

CI will fail if code is not properly formatted.

## Release Strategy

- npm package: `@aryasaatvik/skills`. Releases use Tegami and npm trusted publishing.
- Tags are versioned as `vX.Y.Z`.
- Only the Tegami workflows are active; the upstream `ci.yml` and `agents.yml` are disabled
  (`workflow_dispatch` only). Run them manually when needed.
- Add user-facing release notes under `.tegami/` and commit them with the implementation they
  describe.
- `.github/workflows/prepare-release.yml` runs on manual dispatch to draft versions,
  writing `.tegami/publish-lock.yaml` and opening or updating `tegami/version-packages` against
  `main`. Merging that pull request is the human gate.
- The merge triggers `.github/workflows/publish.yaml`, which runs `pnpm run tegami ci` to publish
  through npm OIDC, push the matching `v<version>` tag, and create the GitHub Release. Ordinary
  pushes to `main` do not publish.
- Do not auto-merge the Version Packages pull request with `GITHUB_TOKEN`; its commits will not
  trigger `publish.yaml`.
- The npm trusted publisher is `aryasaatvik/skills-cli` + `publish.yaml` with no environment; no
  `NPM_TOKEN` is used. Configure it once with `pnpm run release:pretrust` (new packages) or the npm
  package settings (existing packages).
- Release-relevant pull requests get a release plan comment from `release-plan.yml` and
  `release-plan-comment.yml`; preview locally with `pnpm run tegami pr preview`.
- See `docs/release.md` for the workflow and verification procedure.

## Adding a New Agent

1. Add the agent definition to `src/agents.ts`
2. Run `pnpm run -C scripts validate-agents.ts` to validate
3. Run `pnpm run -C scripts sync-agents.ts` to update README.md and package keywords
