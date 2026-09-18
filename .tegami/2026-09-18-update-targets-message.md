---
packages:
  "@aryasaatvik/skills": patch
---

## Accurate `skills update` target line

`skills update` now reports the agent targets it will actually use — the `--agent` override, or the
targets recorded in `skills-lock.json` — instead of listing every agent directory that happens to
exist in the project. A project with a Pi extension but `universal`/`claude-code` recorded targets no
longer falsely prints Pi.
