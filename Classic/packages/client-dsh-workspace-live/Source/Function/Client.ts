/**
 * @module Client
 *
 * The live client's client half body: `Source/Client.ts` delegates its apply
 * here.
 *
 * @remarks
 * The wiring:
 *
 * 1. Provide the workspaceLive service (the Store): snapshot / subscribe /
 *    ingest / refresh. The disposer removes the service with the plugin.
 * 2. Register the locale dictionaries and the live trace source: the D5 bus
 *    (`ctx.get("trace")`) is the live source; without it the view is the
 *    documented static state (empty tail, `live: false`), never an error.
 * 3. Mount the conversation.view tab "workspace-live" (order =
 *    Config.tabOrder), rendering the LiveView snapshot and the stored trace
 *    tail (newest first, bounded by Config.maxEvents). When the panel
 *    family is composed (`playformFamilyPanel` present), the tab ADOPTS THE
 *    CHILD-SLOT MODEL: its registration declares `workspace.live.section`
 *    in its `children` table and the component renders it through the
 *    renderer's `renderSlot` prop.
 * 4. When the panel family is composed, register the live section into the
 *    declared child slot; its registration's INJECT face (`{ section,
 *    ports }`) is the data path - the section reads the store and the trace
 *    tail through the ports, never through the context.
 * 5. When the composition carries the right Sidebar (`sidebarRightTabs`
 *    present), register the live view as a tab TYPE: stage one into that
 *    registry, stage two into the keyed `sidebar.right.pane.tab` seat under
 *    the type's own id. The registry is probed structurally - no inject row
 *    and no import - and an absent one is a silent skip, so the
 *    conversation.view tab above stays the only surface (fail-open).
 *
 * The stable-until-event rule: the tab re-renders only on a new store
 * snapshot or a new trace envelope; there is no polling and no timer. React
 * arrives via createElement calls (no JSX in this package) and stays
 * external. Locale strings route through the client locale service
 * (namespace "client-dsh-workspace-live"); the visible strings live in
 * `Variable/Locale-en.json` / `Variable/Locale-zh.json`.
 */
import Section from "@Function/Section.js";
import StoreFn from "@Function/Store.js";
import TraceFn from "@Function/Trace.js";
import View from "@Function/View.js";
import type { ClientContext } from "@Interface/Client.js";
import type { LiveView } from "@Interface/Presentation.js";
import type LiveTrace from "@Interface/Trace.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import ZH_DICTIONARY from "@Variable/Locale-zh.json";
import SectionIdentity from "@Variable/Section.js";
import Slots from "@Variable/Slots.js";
import { createElement, useEffect, useState, type ReactNode } from "react";

const NAMESPACE = "client-dsh-workspace-live";

/**
 * The panel family's slot-aware registry face (the optional composition).
 */
type Registry = {
	register: (section: unknown) => () => void;
	getVersion: () => number;
};

const IsRegistry = (Candidate: unknown): Candidate is Registry =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as Registry).register === "function" &&
	typeof (Candidate as Registry).getVersion === "function";

/**
 * The panel family's registry when the composition carries it.
 */
const RegistryOf = (ctx: ClientContext): Registry | undefined => {
	const Candidate = ctx.get("playformFamilyPanel");
	switch (true) {
		case IsRegistry(Candidate):
			return Candidate;
		default:
			return undefined;
	}
};

/**
 * The right-Sidebar tab type's identity: unique across every registration
 * and the key its body registers under in the pane seat (the harness's
 * tab-registry contract: a definition's `id` is the stage-two key).
 */
const TAB_ID = "playform-workspace-live";

/**
 * The right-Sidebar tab-type registry (the optional composition): stage one
 * of a tab type's registration. Only `register` is required - the body's
 * keyed pane registration is stage two, into a seat ui-sidebar-right
 * declares. Neither the package nor its types are imported: the face is
 * structural, exactly like the panel family's registry.
 */
type TabRegistrar = {
	register: (definition: {
		id: string;
		kind: string;
		patterns: readonly string[];
		title: () => string;
		keepMounted: boolean;
	}) => () => void;
};

const IsTabRegistrar = (Candidate: unknown): Candidate is TabRegistrar =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as TabRegistrar).register === "function";

/**
 * The right-Sidebar tab-type registry when the composition carries
 * ui-sidebar-right.
 */
const TabRegistrarOf = (ctx: ClientContext): TabRegistrar | undefined => {
	const Candidate = ctx.get("sidebarRightTabs");
	switch (true) {
		case IsTabRegistrar(Candidate):
			return Candidate;
		default:
			return undefined;
	}
};

/**
 * The renderer's child-slot dispatch prop.
 */
type RenderSlot = (name: string, props: object) => ReactNode;

/**
 * The keyed registration face of the slot service: the right-Sidebar pane
 * seat is keyed by the tab type's own id, which the context's list-shaped
 * mirror does not declare.
 */
type KeyedSlots = {
	register: (
		options: { name: string; key: string },
		component: (props?: Record<string, unknown>) => unknown,
	) => () => void;
};

/**
 * The live view tab body: the representations, the trace tail, the child slot.
 */
function LiveTab(props: {
	store: ReturnType<typeof StoreFn>;
	trace: LiveTrace;
	slot?: ReactNode;
}): ReactNode {
	const [Current, SetCurrent] = useState<LiveView>(() => props.store.getSnapshot());
	const [Tail, SetTail] = useState(() => props.trace.tail());
	useEffect(() => {
		// The stable-until-event contract: setState runs only when the store
		// emits a NEW snapshot object or a trace envelope arrives (never on a
		// timer).
		const OffStore = props.store.subscribe(() => SetCurrent(props.store.getSnapshot()));
		const OffTrace = props.trace.subscribe(() => SetTail(props.trace.tail()));
		return () => {
			OffStore();
			OffTrace();
		};
	}, []);
	switch (true) {
		case props.slot != null:
			return props.slot;
		default:
			return createElement(View, {
				view: Current,
				tail: Tail,
				live: props.trace.live,
			});
	}
}

export default function Client(
	ctx: ClientContext,
	config: { tabOrder: number; maxEvents: number; maxRepresentations: number },
): void {
	const store = StoreFn(config);
	const trace = TraceFn(ctx, config.maxEvents);
	const registry = RegistryOf(ctx);

	// The section's manifest: its identity is stable, its order follows the
	// Config tabOrder at registration time.
	const manifest = { ...SectionIdentity, order: config.tabOrder };

	// The workspaceLive service: removed with the plugin.
	ctx.provide("workspaceLive", {
		getSnapshot: () => store.getSnapshot(),
		subscribe: (listener: () => void) => store.subscribe(listener),
		ingest: (event: Parameters<typeof store.ingest>[0]) => store.ingest(event),
		refresh: (graph: Parameters<typeof store.refresh>[0]) => store.refresh(graph),
	});

	// The locale dictionaries: registered inside ctx.effect.
	ctx.effect(
		() => ctx.locale.register(NAMESPACE, { en: EN_DICTIONARY, zh: ZH_DICTIONARY }),
		"live: dictionaries",
	);

	// The tab: registered inside ctx.effect so an unload removes it; the trace
	// source unwinds with the same effect (one label, the existing contract).
	ctx.effect(() => {
		const Off = ctx.slots.inject(Slots.tab, () =>
			ctx.slots.register(
				{
					name: Slots.tab,
					id: "workspace-live",
					order: config.tabOrder,
					locale: NAMESPACE,
					label: () => EN_DICTIONARY.tab,
					// The child-slot model: the tab declares the slot it renders.
					...(registry === undefined
						? {}
						: {
								children: {
									[Slots.section]: { kind: "list", scope: "session" },
								},
							}),
				},
				(props: Record<string, unknown> = {}) =>
					createElement(LiveTab, {
						store,
						trace,
						...(typeof props["renderSlot"] === "function"
							? {
									slot: (props["renderSlot"] as RenderSlot)(Slots.section, {}),
								}
							: {}),
					}),
			),
		);
		return () => {
			Off?.();
			trace.dispose();
		};
	}, "live: workspace tab");

	// The right-Sidebar tab type (the optional composition): the registry is
	// probed structurally, so an absent ui-sidebar-right is a silent skip - no
	// inject row, no import, no error - and the conversation.view tab above
	// stays the only surface. When the registry is present, both stages ride
	// one effect: stage one registers the type, stage two keys the same body
	// into the pane seat under the type's own id.
	const registrar = TabRegistrarOf(ctx);
	switch (true) {
		case registrar !== undefined: {
			const Tabs = registrar;
			ctx.effect(() => {
				const Keyed = ctx.slots as unknown as KeyedSlots;
				const Disposers = [
					Tabs.register({
						id: TAB_ID,
						kind: "playform",
						// The harness matcher tests the whole address when the pattern
						// carries a scheme separator, and `*` does not cross `/`, so
						// this claims the bare `dsh-resource://<type>` addresses and
						// leaves every nested file address to the shipped viewers; the
						// tab itself opens by kind (`openTab("playform")`).
						patterns: ["dsh-resource://*"],
						title: () => EN_DICTIONARY.tab,
						keepMounted: true,
					}),
					ctx.slots.inject(Slots.pane, () =>
						Keyed.register({ name: Slots.pane, key: TAB_ID }, () =>
							createElement(LiveTab, { store, trace }),
						),
					),
				];
				return () => {
					for (const Dispose of Disposers) Dispose();
				};
			}, "live: sidebar tab");
			break;
		}
		default:
			break;
	}
	// The child-slot contribution: one section, its data through the inject
	// face. Registered only when the panel family is composed - the standalone
	// tab keeps its legacy registration shape (the compatibility rule).
	switch (true) {
		case registry !== undefined:
			ctx.effect(
				() =>
					ctx.slots.inject(Slots.section, () =>
						ctx.slots.register(
							{
								name: Slots.section,
								id: SectionIdentity.id,
								order: config.tabOrder,
								locale: NAMESPACE,
								inject: () => ({ section: manifest, ports: { store, trace } }),
							},
							(props: Record<string, unknown> = {}) =>
								createElement(
									Section,
									props as unknown as Parameters<typeof Section>[0],
								),
						),
					),
				"live: panel section",
			);
			break;
		default:
			break;
	}
}
