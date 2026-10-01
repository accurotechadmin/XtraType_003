# XtraType v.003 — Instantiation and Change Log

**Date:** 2026-10-01  
**Change class:** corrective behavior / client runtime / documentation synchronization  
**Application code changed:** yes

## Final v.003 change

- restored the manifest's reserved `_execute_action` Ctrl+Q binding using the same platform-specific mapping as the supplied working demo;
- retained `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` so Ctrl+Q and the toolbar button share Chrome's native action path;
- removed the orphan `toggle-xtratype` command listener;
- removed `chrome.runtime.getContexts()` side-panel-open detection used only by that manual shortcut path;
- removed the keyboard-specific `chrome.sidePanel.close()` / `open()` toggle implementation;
- retained programmatic side-panel opening for distinct context-menu/omnibox flows;
- returned the minimum Chrome version to 116 because explicit side-panel close is no longer required;
- retained technical version 2.5.1 and canonical project version v.003;
- synchronized current SSOT pointers, decision register, README, boot prompt, verification notes, and regression coverage.

## Superseded attempt

An earlier v.003 edit replaced `_execute_action` with `toggle-xtratype` and introduced manual context detection/close behavior. The owner-provided demo established that this was the wrong direction for the required behavior. That implementation is superseded by the native-action method above.

## Preservation

v.002 landmarks remain historical. The outgoing v.002 README and current decision register remain preserved as predecessor landmarks.

## Verification limitation

Automated repository checks can validate manifest wiring and removal of the orphan branch, but native Chrome acceptance is still required for actual shortcut assignment and browser side-panel behavior.
