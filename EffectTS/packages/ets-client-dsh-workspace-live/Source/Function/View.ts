// View - the live view's pure element builder: the presented representations
// (the Entity/Presentation/Interaction model's latest observed state, never a
// running OS process), the documented empty note, the D5 trace tail (newest
// first, bounded by the store; one line per envelope as `<kind> <path>`, the
// payload's path when it carries one, else the envelope's trace id), and the
// child-slot element the tab/section hands in. No hooks and no service reads:
// the wrappers own the subscriptions, so the smoke suite can inspect the
// exact tree.
import type { LiveView } from "@Interface/Presentation.js";
import type { TraceEnvelope } from "@Interface/Trace.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, type ReactNode } from "react";

/** The envelope's display key: its payload path, else its trace id. */
const Key = (Envelope: TraceEnvelope): string => {
	const Path = Envelope.payload["path"];
	switch (true) {
		case typeof Path === "string" && Path.length > 0:
			return Path as string;
		default:
			return Envelope.trace;
	}
};

export default function View(props: {
	view: LiveView;
	tail: readonly TraceEnvelope[];
	live: boolean;
	slot?: ReactNode;
}): ReturnType<typeof createElement> {
	return createElement(
		"div",
		{
			className: "playform-workspace-live",
			"data-live": props.live ? "true" : "false",
		},
		createElement(
			"header",
			{ className: "playform-workspace-header" },
			createElement("span", {
				className: "playform-workspace-dot",
				"data-live": props.live ? "true" : "false",
				"aria-hidden": "true",
			}),
			createElement("span", { className: "playform-workspace-title" }, EN_DICTIONARY.tab),
			createElement(
				"span",
				{ className: "playform-workspace-count" },
				String(props.view.representations.length),
			),
		),
		createElement(
			"ul",
			{ className: "playform-workspace-representations" },
			props.view.representations.map((Representation) =>
				createElement(
					"li",
					{ key: Representation.id },
					createElement(
						"span",
						{ className: "playform-workspace-representation-label" },
						Representation.label,
					),
					createElement(
						"span",
						{ className: "playform-workspace-representation-meta" },
						`${Representation.kind} / v${String(Representation.version)} / seq ${String(Representation.lastSequence)}`,
					),
				),
			),
		),
		props.view.representations.length === 0
			? createElement("p", {}, EN_DICTIONARY.empty)
			: undefined,
		createElement(
			"ul",
			{ className: "playform-workspace-trace" },
			props.tail.map((Envelope, Index) =>
				createElement(
					"li",
					{ key: `${Envelope.trace}-${String(Index)}`, "data-kind": Envelope.kind },
					`${Envelope.kind} ${Key(Envelope)}`,
				),
			),
		),
		props.slot,
	);
}
