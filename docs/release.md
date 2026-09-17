# Releasing skills

`@aryasaatvik/skills` uses [Tegami](https://tegami.fuma-nama.dev) for changelogs, versioning, npm
publication, Git tags, and GitHub Releases. Releases run from `main` through GitHub Actions and npm
trusted publishing.

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

Commit the changelog entry with the implementation that it describes.

## Prepare a version pull request

Start from a clean, current `main` branch with GitHub CLI authentication:

```sh
pnpm install --frozen-lockfile
GH_TOKEN="$(gh auth token)" pnpm run version:packages
```

Tegami consumes the pending changelog entries, updates `package.json` and `CHANGELOG.md`, writes its
publish lock, pushes `tegami/version-packages`, and opens or updates a pull request against `main`.
Review and merge that pull request before publishing.

## Publish

After the version pull request is merged, the `release.yml` workflow runs from the clean merged
`main` branch. It installs dependencies, runs the release checks, then runs:

```sh
pnpm run release:check && pnpm run tegami ci
```

The workflow grants GitHub's OIDC token to npm and has no `NPM_TOKEN` secret. Tegami publishes the
package, creates and pushes the `v<version>` Git tag, and creates the matching GitHub Release.

The npm trusted publisher must be configured as:

- Repository: `aryasaatvik/skills-cli`
- Workflow filename: `release.yml`
- Environment: blank
- Publishing method: npm publish only

## First-time trusted publishing

Configure trusted publishing once before the first OIDC publish:

- If the package does not exist on npm yet, run `pnpm run release:pretrust` from an authenticated
  local session. Tegami publishes a temporary placeholder under the `temp` dist-tag, then registers
  the trusted publisher from `trustedPublish` in `scripts/tegami.ts`.
- If the package already exists (`@aryasaatvik/skills` does), add the trusted publisher in the npm
  package settings using the values above, or with `npm trust`.

Verify the result:

```sh
npm view @aryasaatvik/skills version
npm view @aryasaatvik/skills dist-tags --json
gh release view "v$(node -p 'require("./package.json").version')"
```

Do not merge a version pull request or rerun a partially completed workflow without first checking
the npm version, Git tag, GitHub Release, and Tegami publish status.

## Upstream workflow

`.github/workflows/publish.yml` is the upstream vercel-labs publish workflow. It only runs on manual
`workflow_dispatch` and depends on maintainer secrets this fork does not hold, so the Tegami
`release.yml` workflow is the fork's release path.
