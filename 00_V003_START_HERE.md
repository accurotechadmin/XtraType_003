# XtraType v.003 — Start Here

**Canonical project version:** **v.003**  
**Instantiated:** 2026-10-01 17:26 EDT  
**Corrected:** 2026-10-01 18:20 EDT  
**Application-code change in this instantiation:** **yes — corrective client behavior**  
**Application technical version:** **2.5.1**  
**Primary change:** restore reliable native side-panel toggling from Ctrl+Q while retaining toolbar-button toggling.

## Owner directive implemented

- Ctrl+Q must toggle XtraType open and closed.
- The extension toolbar button must toggle XtraType open and closed.
- Keep the canonical project-development version at v.003.

## What changed

The v.003 manual shortcut implementation (`toggle-xtratype` + `chrome.runtime.getContexts()` + `chrome.sidePanel.close/open`) was removed. The supplied working Ctrl+Q demo confirmed the earlier native pattern: the manifest binds Ctrl+Q to Manifest V3's reserved `_execute_action` command, and the worker enables `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})`.

Chrome therefore handles Ctrl+Q as the same extension action used by the toolbar button, including the native side-panel toggle behavior. `_execute_action` does not flow through `chrome.commands.onCommand`, so XtraType does not maintain a second open/close implementation.

The explicit-close-only Chrome 141 dependency is gone; the extension minimum returns to Chrome 116.

## Read first

1. `README.md`
2. `reference/ssot/README.md`
3. `reference/ssot/00_CURRENT_AUTHORITY.md`
4. `reference/ssot/01_DOCUMENT_ROUTER.md`
5. `reference/ssot/02_ANTI_DRIFT_GUARD_DOGS.md`
6. `docs/v003/00_CURRENT_STATUS_2026-10-01T172600-0400.md`
7. `EXPERT_SESSION_BOOT_PROMPT.md`

## Verification posture

Static regression coverage asserts the reserved action shortcut, native side-panel action behavior, and absence of the orphan manual close/context-detection path. Native Chrome acceptance remains an owner-side gate: reload the unpacked extension, verify the shortcut assignment at `chrome://extensions/shortcuts`, and test both Ctrl+Q and the toolbar button on a normal page.

v.002 remains an immutable predecessor landmark.
