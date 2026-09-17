#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { tegami, type TegamiPlugin } from 'tegami';
import { runCli } from 'tegami/cli';
import { github } from 'tegami/plugins/github';

const REPOSITORY = 'aryasaatvik/skills-cli';
const PACKAGE_NAME = '@aryasaatvik/skills';
const PACKAGE_ID = `npm:${PACKAGE_NAME}`;

const rootPackage = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { name?: string };

if (rootPackage.name !== PACKAGE_NAME) {
  throw new Error(`unexpected release package: expected ${PACKAGE_NAME}`);
}

/**
 * Tegami only creates git tags for packages whose publish plan carries one
 * (the npm provider leaves it unset), so assign the tag the release expects.
 */
const packageTag = (): TegamiPlugin => ({
  name: 'skills-tag',
  enforce: 'post',
  initPublishPlan({ plan }) {
    const pkg = this.graph.get(PACKAGE_ID);
    const packagePlan = plan.packages.get(PACKAGE_ID);
    if (!pkg?.version || !packagePlan) return;

    packagePlan.git ??= {};
    packagePlan.git.tag = `v${pkg.version}`;
  },
});

const release = tegami({
  npm: {
    client: 'pnpm',
    trustedPublish: {
      provider: 'github',
      workflow: 'publish.yml',
    },
  },
  packages: {
    [PACKAGE_NAME]: {},
  },
  plugins: [
    github({
      repo: REPOSITORY,
      pushTags: true,
      versionPr: {
        branch: 'tegami/version-packages',
        base: 'main',
        forceCreate: false,
        create() {
          const version = this.graph.get(PACKAGE_ID)?.version;
          return {
            title: version
              ? `chore(release): prepare ${PACKAGE_NAME} ${version}`
              : `chore(release): prepare ${PACKAGE_NAME}`,
          };
        },
      },
      release: {
        create({ tag }) {
          return { title: tag };
        },
      },
    }),
    packageTag(),
  ],
});

await runCli(release);
