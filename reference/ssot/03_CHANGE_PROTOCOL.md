# Forward Change Protocol

Every material change from v.002 onward should follow this sequence.

## 1. Orient

- Read `CURRENT_POINTERS.json`.
- Read the applicable row in `01_DOCUMENT_ROUTER.md`.
- Read the relevant anti-drift guards.
- Inspect the actual source path end-to-end before editing.

## 2. Classify the change

Record whether it is:

- corrective behavior;
- additive feature;
- compatibility/migration change;
- trust/permission/security change;
- network/external-effect change;
- documentation/process change;
- specification/charter change.

The last four classifications require explicit forward decision or spec records.

## 3. Trace producers and consumers

Identify who creates the data/action, who validates it, where it is stored, who reads it, what UI acknowledges it, how failure appears, how retry/recovery works, and which offline/unavailable states exist.

## 4. Preserve invariants or declare the migration

If an established record, storage key, operation, permission, or user-visible behavior changes, document compatibility. Do not let migrations emerge accidentally from UI work.

## 5. Implement coherently

Update mirrored/shared browser/web code together. Preserve host authority boundaries. Keep local/remote/effect states truthful.

## 6. Test at the nearest deterministic seam

Prefer a focused regression test for the bug/feature plus broader validation. Native browser/platform behavior must be called native/manual unless actually exercised.

## 7. Update current docs

Apply the standing “update current docs” signal in `08_VERSIONING_AND_CURRENT_DOCS_SIGNAL.md`. Update decisions/spec deltas where the behavior or architecture changed.

## 8. Record the session/release

Add a timestamped change/session record. If work leaves unresolved risk, record it instead of burying it in chat context.

## 9. Package and prove provenance

Regenerate current authority/file indexes and checksum manifests. Never overwrite historical manifests to pretend they described the new package.

## 10. Final report

State exactly:

- what changed;
- what did not change;
- what was tested this session;
- what remains untested/deferred;
- which current docs/spec/decision records were updated;
- package/version/checksum identity.
