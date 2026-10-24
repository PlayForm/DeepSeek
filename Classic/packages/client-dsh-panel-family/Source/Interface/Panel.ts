// Panel - the v4.1 PANEL CONTRACT (Documentation/Plans/UI-FAMILY-V4-1.md
// section 3.3, Documentation/Plans/Completion-Spec/04-CLIENT.md section 2).
// The 13 per-bundle adapters import these types with `import type` ONLY: no
// runtime import may exist between the central package and any adapter
// (PHASE-2 A2.4, verified by grep in the end-phase). The runtime slot names
// live in Variable/Slots.ts; this file is types only, so it emits nothing.
import type { ReactNode } from "react";

// A PanelSlot is one declared child slot: the only keys an adapter may
// register into. The panel owns both render sites; an adapter's client half
// injects the slot its manifest declares and registers one section component
// there - React travels through slots, so the section inherits the locale
// `t`, the session scope, the inject face, the priority, and
// `Slots.listSubTree` visibility.
export type PanelSlot = "playform.panel.section" | "playform.panel.overlay";

// A PanelMount is where a section shows up. The slot is the v4.1 dispatch
// key; `mount` survives as the legacy field the slot-aware registry maps onto
// a slot when an older registration omits `slot`.
export type PanelMount = "family-tab" | "overlay" | "sidebar";

// The static activation posture an adapter declares (its plugin's own
// enabled default). A live trace envelope may override it per status().
export type PanelActivation = "enabled" | "disabled" | "unknown";

// The LaunchTarget is what a section hands to open(): which registered view
// to show and what to focus inside it.
export type LaunchTarget = { view: string; focus?: string };

// The props every section's render function receives. `sessionId` is the
// active conversation session when the section sits in the family tab;
// `useTrajectory` exposes the session's trajectory snapshot hook when the
// renderer provides one; `open` launches a registered overlay view.
export type SectionProps = {
	sessionId?: string;
	useTrajectory?: () => unknown;
	open: (target: LaunchTarget) => void;
};

// The D5 trace envelope, mirrored structurally from @playform/lib-dsh-trace
// (the package never imports the library at runtime or type level: the
// client bundle must not reach a host package). A host that exposes the trace
// bus on the client context hands the panel exactly this shape.
export type PanelEnvelope = {
	trace: string;
	kind: string;
	at: number;
	actor?: object;
	payload: Record<string, unknown>;
};

// The status one adapter section renders: the activation state and the live
// tail (the trace's recent envelopes for this adapter, newest first). With no
// trace exposed the tail is empty and `live` is false - the documented static
// fallback.
export type PanelStatus = {
	bundle: string;
	activation: PanelActivation;
	live: boolean;
	tail: string[];
};

// A PanelSection is one adapter contribution: the manifest the owning bundle
// declares (identity, namespace, title, order, slot) plus the optional custom
// render the legacy contract carried. `namespace` is the settings namespace
// (the profile entry id) the config form reads.
export type PanelSection = {
	id: string;
	bundle: string;
	namespace: string;
	title: string;
	order: number;
	slot?: PanelSlot;
	mount?: PanelMount;
	activation?: PanelActivation;
	traceKinds?: readonly string[];
	match?: (envelope: PanelEnvelope) => boolean;
	enabled?: () => boolean;
	render?: (props: SectionProps) => ReactNode;
};

// The registry service shape (ctx.reflect.provide("playformFamilyPanel",
// ...)): slot-aware bookkeeping for the adapters' manifests. register adds a
// section (one adapter per bundle per slot; a duplicate is refused);
// unregister removes it and cascades its overlay views; entries snapshots the
// current sections ordered by (order, id), optionally filtered by slot;
// subscribe watches changes (returns the unlisten function); getVersion bumps
// on every accepted mutation; open launches an overlay view.
export type PanelRegistry = {
	register: (section: PanelSection) => () => void;
	unregister: (id: string) => void;
	entries: (slot?: PanelSlot) => PanelSection[];
	subscribe: (listener: () => void) => () => void;
	getVersion: () => number;
	open: (target: LaunchTarget) => void;
};
