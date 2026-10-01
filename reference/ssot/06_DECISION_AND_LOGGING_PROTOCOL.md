# Decision and Logging Protocol

## Decisions worth recording

Record a forward decision when work changes any of these:

- product identity/scope;
- compatibility or migration behavior;
- storage/record identity;
- permissions/grants/plugin authority;
- identity/authentication/invitation policy;
- data portability/provenance;
- external effects/publishing/retry behavior;
- security boundaries;
- public/scale assumptions;
- a previously deferred PortaShape area;
- the meaning of a canonical term.

## Decision fields

Every durable decision should capture:

- ID and timestamp/version;
- status: proposed / accepted / superseded / rejected / deferred;
- problem and context;
- decision;
- alternatives considered;
- affected code/contracts/docs;
- compatibility/migration consequences;
- verification/acceptance requirements;
- supersedes / superseded-by links.

## Session logs

A productive coding session should end with a log when it changes the package or leaves material unresolved work. Include what was examined, changed, tested, not tested, deferred, and the exact current package/version identity.

## Current decision register

`reference/ssot/decisions/CURRENT_DECISION_REGISTER.md` is a concise live index. Do not make it the only copy of a complex architectural rationale; link to a dedicated record where needed.

## Why this exists

The project is expected to grow horizontally (new modules, scripts, plugins, clients, connectors) and vertically (stronger infrastructure, security, scale). Without explicit decision provenance, a locally reasonable optimization can erase a small convention that another subsystem depended upon. Logs and decision records are the memory that prevents that class of drift.
