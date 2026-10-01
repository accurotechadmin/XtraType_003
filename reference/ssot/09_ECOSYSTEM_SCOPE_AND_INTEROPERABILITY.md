# Ecosystem Scope and Interoperability

## One ecosystem, independently useful pieces

The intended system is cohesive without being compulsory. People should be able to use only XtraType, only a helper like Stay D.R.Y., only a script/plugin, or a larger integrated stack. Interoperability should add value rather than become a prerequisite for basic usefulness.

## XtraType

The contextual application: annotations, conversations, snapshots, relationships, and structured context attached to URLs, videos, places, moments, selections, and future portable objects.

## PortaShape

The wraparound framework and interoperability substrate. Its selected target responsibilities include:

- plugin/package identity and lifecycle;
- capability grants and host-mediated operations;
- UI contributions and namespaced plugin data;
- typed operation routing among tools;
- portable records/relationships/representations/provenance;
- local data transportation among XtraType, plugins, scripts, clients, publishers, and connectors;
- a controlled boundary between ordinary user code and privileged reviewed host/connector code;
- common receipts/events/fidelity and effect-status semantics;
- future local/shared service-plane interfaces without prematurely collapsing everything into one backend.

## Script Studio

The script-building canvas/tooling surface in the PortaShape direction. Personal scripts should be easy to create and inspect while privileged authority remains separately reviewed/granted.

## Stay D.R.Y.

Reusable text/pattern assistance governed by explicit consent, exclusion, TTL/lifecycle, insertion, and no-implicit-submit principles.

## Universal Publisher / Bridges

A canonical publishing core that can compose representations, preview fidelity, bind destinations/accounts, execute through separate connectors, and record receipts/unknown outcomes truthfully.

## External connectors

Separate packages that translate host operations into external-platform effects. Credentials/grants stay machine/user scoped and do not travel in portable package data.

## Shared clients and future surfaces

Web/mobile/desktop/local clients may participate through portable contracts while honestly exposing only the capabilities their host actually provides.

## Interoperability principle

Prefer stable typed boundaries and portable records over direct private-database coupling between modules. The system should become easier—not harder—to decompose as it grows.
