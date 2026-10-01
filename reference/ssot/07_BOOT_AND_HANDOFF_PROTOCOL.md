# Boot and Handoff Protocol

## Starting an expert development session

Use root `EXPERT_SESSION_BOOT_PROMPT.md`. The active prompt must route the developer through:

1. current version/status;
2. this SSOT directory;
3. application source/test seams;
4. relevant Seed/canon provenance;
5. relevant PortaShape target contracts;
6. current unresolved decisions and verification limits.

The boot prompt is a navigation contract, not permission to skip reading source.

## Ending a session

Before packaging a material change:

- update current docs where affected;
- add a session/change log;
- update current decision status;
- state verification performed and not performed;
- regenerate authority/checksum/package manifests;
- preserve outgoing current documents if the new version would otherwise erase them;
- leave a fresh boot prompt if the architectural/current-status picture materially changed.

## Retired prompts

Retired prompts live under `reference/ssot/boot-prompts/retired/`. They remain useful for understanding the assumptions of older work but never override the active prompt.

## Handoff test

A new expert should be able to answer, without chat history:

- What version/current state am I in?
- What actually runs today?
- What is target-only?
- Where does each major subsystem live?
- What invariants must I preserve?
- Which security/scale claims are not yet justified?
- How do I update current docs and record decisions?
- How do I trace “how did we get here?” back through v.001 and Seed 1?

If the repository cannot answer those, the handoff documentation is incomplete.
