## @aryasaatvik/skills@1.7.1

### Notion skills

`skills add notion` installs skills from Notion. It lists the skill packs available to the
authenticated Notion account so you can choose, and `skills add https://notion.so/<skill-page>`
installs the skill on a specific Notion page. Notion sources are prepared through the `ntn` CLI and a
temporary download step, then run through the normal install, agent-target, and lock flow.

### Accurate `skills update` target line

`skills update` now reports the agent targets it will actually use — the `--agent` override, or the
targets recorded in `skills-lock.json` — instead of listing every agent directory that happens to
exist in the project. A project with a Pi extension but `universal`/`claude-code` recorded targets no
longer falsely prints Pi.

## @aryasaatvik/skills@1.7.0

### Preserve project agent targets

`skills add` and `skills experimental_sync` now record each project skill's effective agent
destinations in `skills-lock.json`, and `skills update` reuses them. A skill installed only to the
canonical `.agents/skills` directory is no longer re-linked into agent-specific directories such as
`.pi/skills` by update auto-detection.

`skills update --agent <agents...>` overrides the recorded targets for a run; global `--agent`
remains a one-shot override. `skills experimental_sync --agent <non-universal>` now creates and
records the explicitly selected agent's project link instead of dropping it.
