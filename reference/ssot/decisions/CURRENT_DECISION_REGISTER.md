# Current Forward Decision Register — v.003

v.002 decisions remain historical authority for the SSOT instantiation. The outgoing v.002 current register is preserved at `docs/v003/V002_CURRENT_DECISION_REGISTER_PRE_V003.md`.

| ID | Status | Decision / boundary | Authority / follow-up |
|---|---|---|---|
| V003-D001 | Accepted | Canonical project version is v.003 and this is a code-bearing corrective client increment. | owner directive 2026-10-01 |
| V003-D002 | Accepted | Chrome/npm/release technical identifiers remain 2.5.1 for this v.003 executable patch; canonical v.00N and technical SemVer remain separate sequences. | `08_VERSIONING_AND_CURRENT_DOCS_SIGNAL.md` |
| V003-D003 | Accepted | Ctrl+Q is bound to Manifest V3's reserved `_execute_action` command so Chrome invokes the same native extension action as the toolbar button. | supplied Ctrl+Q demo; `ext/manifest.json` |
| V003-D004 | Accepted | XtraType does not maintain a keyboard-specific `commands.onCommand` open/close branch; the superseded `toggle-xtratype`, SIDE_PANEL context polling, and explicit shortcut close path are removed. | `ext/service-worker.js` |
| V003-D005 | Accepted | The toolbar extension button and Ctrl+Q share Chrome's native `openPanelOnActionClick` side-panel behavior. Distinct context-menu/omnibox flows may still open the panel programmatically. | Chrome Side Panel API; `ext/service-worker.js` |
| V003-D006 | Accepted | Minimum Chrome is 116; the temporary Chrome 141 requirement was only needed by the superseded explicit `sidePanel.close()` implementation. | `ext/manifest.json` |
| V003-D007 | Accepted | Local-first personal capability and existing record/storage identities remain unchanged by this repair. | inherited guard dogs |
| V003-D008 | Open | Native Chrome acceptance must confirm Ctrl+Q assignment and toolbar-button open/close behavior after extension reload, including worker restart and multiple tabs/windows. | owner-side acceptance gate |
| V003-D009 | Open | Production server/service-plane hardening, recovery, distributed sync, abuse/security and public-scale acceptance remain under development. | inherited roadmap |
| V003-D010 | Open | First implemented PortaShape host/package/grant/operation runtime must follow the selected Companion contracts or an explicit successor/delta. | companion + future spec delta |
