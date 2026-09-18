---
packages:
  "@aryasaatvik/skills": minor
---

## Notion skills

`skills add notion` installs skills from Notion. It lists the skill packs available to the
authenticated Notion account so you can choose, and `skills add https://notion.so/<skill-page>`
installs the skill on a specific Notion page. Notion sources are prepared through the `ntn` CLI and a
temporary download step, then run through the normal install, agent-target, and lock flow.
