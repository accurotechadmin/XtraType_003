# Forward Specification Deltas and Successors

The selected PortaShape Companion v0.1 under `reference/specs/` is a sealed foundational target. If future work intentionally changes or extends a target contract, add an explicit versioned delta or successor specification here (or under a future dedicated `reference/specs/<new-version>/` tree) and update the current SSOT router/pointers.

Every delta must state:

- what foundational specification it extends/supersedes;
- what remains inherited unchanged;
- affected contract/operation/permission/component IDs;
- migration/compatibility implications;
- acceptance criteria;
- decision record authorizing the change.
