## @aryasaatvik/skills@1.7.0

### Preserve project agent targets

`skills add` and `skills experimental_sync` now record each project skill's effective agent
destinations in `skills-lock.json`, and `skills update` reuses them. A skill installed only to the
canonical `.agents/skills` directory is no longer re-linked into agent-specific directories such as
`.pi/skills` by update auto-detection.

`skills update --agent <agents...>` overrides the recorded targets for a run; global `--agent`
remains a one-shot override. `skills experimental_sync --agent <non-universal>` now creates and
records the explicitly selected agent's project link instead of dropping it.
