# V003-001 — Side-panel toggle repair

**Status:** implemented; native acceptance pending  
**Canonical version:** v.003  
**Technical version:** 2.5.1

## Problem

Ctrl+Q stopped reliably opening/toggling the XtraType side panel. A first v.003 attempt introduced a separate `toggle-xtratype` command with manual side-panel context detection and explicit close/open calls, but the supplied working demo showed that the reliable behavior comes from Chrome's native action command instead.

## Resolution

Bind Ctrl+Q to Manifest V3's reserved `_execute_action` command and keep `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})`. Chrome then handles the shortcut as though the extension toolbar action was invoked. `_execute_action` is intentionally not handled by `chrome.commands.onCommand`.

Remove the superseded keyboard-only machinery: `toggle-xtratype`, `chrome.runtime.getContexts()` SIDE_PANEL detection, and `chrome.sidePanel.close()` from the shortcut path.

## Compatibility

Minimum Chrome is 116. No XtraType record/storage migration occurs.

## Acceptance

Reload the unpacked extension and verify:
1. `chrome://extensions/shortcuts` shows Ctrl+Q for XtraType's action (assign it manually if needed).
2. Ctrl+Q opens a closed panel.
3. Ctrl+Q closes an open panel.
4. Toolbar button opens a closed panel.
5. Toolbar button closes an open panel.
6. Repeat after tab changes and service-worker idle/restart.
