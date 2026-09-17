# Releasing skills

`@aryasaatvik/skills` uses [Tegami](https://tegami.fuma-nama.dev) for changelogs, versioning, npm
publication, Git tags, and GitHub Releases. Releases run through GitHub Actions and npm trusted
publishing. Only the Tegami workflows are active in this fork; the upstream `ci.yml` and `agents.yml`
are disabled (manual `workflow_dispatch`).

`.github/workflows/prepare-release.yml` drafts the release: on a manual dispatch it runs
`pnpm run tegami version`, which opens or updates a Version Packages pull request
when `.tegami/` has pending changelog files and writes `.tegami/publish-lock.yaml`. Merging that pull
request is the human gate, and the merge triggers `.github/workflows/publish.yml`, which runs
`pnpm run tegami ci` to publish from the lock. Ordinary pushes to `main` do **not** publish. Do not
auto-merge the Version Packages pull request with `GITHUB_TOKEN` — GitHub does not re-run workflows
for commits created by that token, so publish would never start.

Authentication is npm trusted publishing (OIDC). `publish.yml` sets `id-token: write` and does not
use an `NPM_TOKEN`. The package must list GitHub Actions trusted publisher `aryasaatvik/skills-cli`
with workflow filename `publish.yml` and no environment name. Do not rename `publish.yml`; npm pins
that filename.

Pull requests that touch release-relevant paths get a release plan comment from the split
`release-plan.yml` / `release-plan-comment.yml` workflows. Run `pnpm run tegami pr preview` locally
at any time.

## Queue a change

Run `pnpm run tegami` to create a file under `.tegami/`, or write one directly:

```md
---
packages:
  "@aryasaatvik/skills": minor
---

## Describe the change

Describe the user-visible result.
```

Commit the changelog entry with the implementation that it describes. Dispatching the Prepare
release workflow opens the Version Packages pull request.

## Version Packages pull request

Review the generated version bump, changelog aggregation, lockfile, and `.tegami/publish-lock.yaml`.
Merge it in the GitHub UI (or with a non-`GITHUB_TOKEN` actor). The merge triggers `publish.yml`,
which publishes and creates the GitHub Release.

## First-time trusted publishing

Configure trusted publishing once before the first OIDC publish:

- If the package does not exist on npm yet, run `pnpm run release:pretrust` from an authenticated
  local session. Tegami publishes a temporary placeholder under the `temp` dist-tag, then registers
  the trusted publisher from `trustedPublish` in `scripts/tegami.ts`.
- If the package already exists (`@aryasaatvik/skills` does), add the trusted publisher in the npm
  package settings using the values above, or with `npm trust`.

## Verify a publish

```sh
gh run list --workflow=publish.yml --limit 5
npm view @aryasaatvik/skills version
npm view @aryasaatvik/skills dist-tags --json
gh release view "v$(node -p 'require("./package.json").version')"
```

If a publish job fails partway through, fix the cause and re-run the same workflow. The publish lock
makes retries safe.

## Emergency local publish

GitHub Actions is the default publish path. Publish from a laptop only when Actions cannot. From a
clean, current `main` with npm 2FA and GitHub CLI authentication:

```sh
npm whoami
GH_TOKEN="$(gh auth token)" pnpm run release
```

`pnpm run release` runs `release:check` and then `tegami publish`. Restore CI as the default path
after the emergency publish succeeds.

## Local scripts

- `pnpm run tegami` — queue a changelog entry.
- `pnpm run version:packages` — draft version changes locally.
- `pnpm run release:check` — type-check, build, test, and format check.
- `pnpm run release` — emergency local publish (see above).
