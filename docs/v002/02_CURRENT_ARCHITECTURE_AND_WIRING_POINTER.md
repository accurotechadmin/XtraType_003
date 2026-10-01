# XtraType v.002 — Current Architecture and Wiring Pointer

v.002 does not change application wiring from the v.001 final package. Rather than duplicate the detailed map, use this routing hierarchy:

1. **Current executable source:** root `ext/`, `server/`, `src/server/`, `tests/`.
2. **Forward code map:** `reference/ssot/04_CODE_AND_CONTRACT_REFERENCE_MAP.md`.
3. **Detailed v.001 wiring landmark:** `docs/v001/02_ARCHITECTURE_WIRING_HARNESS_COMPONENT_MAP.md`.
4. **Seed implementation maps/workflows:** `docs/SEED_03_CURRENT_IMPLEMENTATION_COMPONENTS.md`, `docs/SEED_06_DATA_WORKFLOWS_AND_SEAMS.md`.
5. **Historical canon:** `reference/canon/XtraType_Canon_v1.0_candidate/`.
6. **PortaShape target:** `reference/specs/XtraType_PortaShape_Companion_v0.1/`.

If a future code change makes the v.001 wiring map materially inaccurate for current architecture, create/update a v.00N current architecture landmark and update `reference/ssot/CURRENT_POINTERS.json`; do not edit the v.001 map.
