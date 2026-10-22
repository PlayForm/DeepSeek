// Client - the live client's client half body (Source/Client.ts delegates
// its apply here). Three responsibilities:
//
//   1. Provide the workspaceLive service (the Store): snapshot / subscribe /
//      ingest / refresh. The disposer removes the service with the plugin.
//   2. Mount the conversation.view tab "workspace-live" (order =
//      Config.tabOrder), rendering the LiveView snapshot: the
//      representations (stable-until-event - the component re-renders only
//      when the store emits a new snapshot) and the recent event tail.
//   3. Keep the store fed: the end-phase wires the real sibling channels
//      (ctx.workspaceGraph.snapshot() on start, the workspace event stream
//      via ctx.remote / the event bus); the PoC store accepts ingest() /
//      refresh() calls from whichever channel the wiring pass connects, so
//      the presentation contract is already exercised.
//
// React arrives via createElement calls (no JSX in this package) and stays
// external. Locale strings route through the client locale service
// (namespace "client-dsh-workspace-live"); the visible strings live in
// Variable/Locale-en.json / Variable/Locale-zh.json.
import type { Context } from "@deepseek-ai/cordis";
import StoreFn from "@Function/Store.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import ZH_DICTIONARY from "@Variable/Locale-zh.json";
import { createElement, useEffect, useState } from "react";

const NAMESPACE = "client-dsh-workspace-live";

/** The live view tab body: the representations + the event tail. */
function LiveTab(props: { store: ReturnType<typeof StoreFn> }): ReturnType<typeof createElement> {
	const [view, setView] = useState(props.store.getSnapshot());
	useEffect(
		() =>
			props.store.subscribe(() => {
				// The stable-until-event contract: setView runs only when the
				// store emits a NEW snapshot object (never on a timer).
				setView(props.store.getSnapshot());
			}),
		[],
	);
	return createElement(
		"div",
		{ className: "playform-workspace-live" },
		createElement(
			"ul",
			{ className: "playform-workspace-representations" },
			view.representations.map((representation) =>
				createElement(
					"li",
					{ key: representation.id },
					`${representation.label} (${representation.kind}, v${representation.version}, seq ${representation.lastSequence})`,
				),
			),
		),
		view.representations.length === 0 ? createElement("p", {}, EN_DICTIONARY.empty) : undefined,
	);
}

export default function Client(
	ctx: Context,
	config: { tabOrder: number; maxEvents: number; maxRepresentations: number },
): void {
	const store = StoreFn(config);
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
	// The tab: registered inside ctx.effect so an unload removes it.
	ctx.effect(
		() =>
			ctx.slots.inject("conversation.view", () =>
				ctx.slots.register(
					{
						name: "conversation.view",
						id: "workspace-live",
						order: config.tabOrder,
						locale: NAMESPACE,
						label: () => EN_DICTIONARY.tab,
					},
					() => createElement(LiveTab, { store }),
				),
			),
		"live: workspace tab",
	);
}
