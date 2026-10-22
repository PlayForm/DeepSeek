// Panel - the PANEL CONTRACT (Documentation/Plans/UI-Family/
// PHASE-2-PANEL-CONTRACT.md, the only shared artifact in the whole UI family
// design). The 13 adapters import these types with `import type` ONLY: no
// runtime import may exist between the central package and any adapter
// (A2.4, verified by grep in the end-phase).
import type { ReactNode } from "react";

//
// A PanelMount is where a section shows up: the family tab in the
// conversation view, a floating overlay panel, or the sidebar.
export type PanelMount = "family-tab" | "overlay" | "sidebar";

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

// A PanelSection is one adapter contribution: identified by its owning
// bundle, titled, ordered, mounted somewhere, and rendered by a function
// that returns a ReactNode (createElement output - no JSX in this package).
export type PanelSection = {
	id: string;
	bundle: string;
	title: string;
	order: number;
	mount: PanelMount;
	render: (props: SectionProps) => ReactNode;
};

// The registry service shape (ctx.reflect.provide("playformFamilyPanel",
// ...)): register adds/replaces by section id, unregister removes it and
// cascades its overlay views, entries snapshots the current sections ordered
// by (order, id), subscribe watches registry changes (returns the unlisten
// function), getVersion bumps on every mutation.
export type PanelRegistry = {
	register: (section: PanelSection) => () => void;
	unregister: (id: string) => void;
	entries: () => PanelSection[];
	subscribe: (listener: () => void) => () => void;
	getVersion: () => number;
	open: (target: LaunchTarget) => void;
};
