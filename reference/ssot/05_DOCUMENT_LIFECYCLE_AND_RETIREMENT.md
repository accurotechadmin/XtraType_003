# Document Lifecycle and Retirement Policy

## Categories

### Mutable current documents
These are allowed—and expected—to change when current truth changes:

- root `README.md`;
- root `EXPERT_SESSION_BOOT_PROMPT.md`;
- `reference/ssot/*` documents explicitly marked current/mutable;
- `reference/ssot/CURRENT_POINTERS.json`;
- `reference/ssot/decisions/CURRENT_DECISION_REGISTER.md`;
- the current version's status/register documents where designated mutable.

Before replacing material current text, preserve the old meaningful state as a versioned/timestamped landmark when it would otherwise be lost.

### Versioned landmarks
Examples: `docs/v001/*`, `docs/v002/*` timestamped status/logs, `00_V00N_START_HERE.md`, `V00N_INSTANTIATION_MANIFEST.json`, named boot prompts. Once the next version supersedes them, they become read-only history.

### Perpetual foundational/legacy
Seed 1, historical canon, selected companion v0.1 specification, preserved source snapshots, and evidence. These are never “cleaned up” to match current wording.

## Boot prompts

- The active boot prompt is always root `EXPERT_SESSION_BOOT_PROMPT.md` and is mirrored/captured under `reference/ssot/boot-prompts/current/`.
- When replaced, copy the outgoing prompt into `reference/ssot/boot-prompts/retired/` with its version/name intact.
- Retired prompts are evidence, not instructions to follow over the current prompt.

## Decision records

Current decision status lives in `reference/ssot/decisions/CURRENT_DECISION_REGISTER.md`. Major decisions should also receive immutable timestamped/versioned records if their rationale could matter later.

## Logs

Session and release logs go under `reference/ssot/logs/` or the current version landmark directory. Logs are append-only records; correct mistakes with an amendment, not silent rewriting.

## Specifications

Never silently edit the sealed PortaShape Companion v0.1. Create a delta/successor specification and update the current router/pointers. A successor must say what it supersedes and what remains inherited unchanged.

## Retirement is not deletion

“Retired” means “no longer the active instruction set.” It does not mean unimportant, untrue for its time, or removable. The project intentionally preserves the chain of thought encoded in its artifacts without relying on ephemeral chat history.
