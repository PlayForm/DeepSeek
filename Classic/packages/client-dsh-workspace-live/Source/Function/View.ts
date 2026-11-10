import {
	DetailDocument,
	detailDocumentState,
	StateDot,
	Tag,
	type DetailDocumentLabels,
	type DetailDocumentRead,
	type StateDotState,
	type TagTone,
} from "@deepseek-ai/dsh-client-ui-primitives";
import type { LiveView, Representation } from "@Interface/Presentation.js";
import type { TraceEnvelope } from "@Interface/Trace.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, type ReactNode } from "react";

/**
 * @module View
 *
 * The live view's pure element builder.
 *
 * @remarks
 *
 * The presented representations (the Entity/Presentation/Interaction model's
 * latest observed state, never a running OS process), the documented empty
 * note, the D5 trace tail (newest first, bounded by the store; one line per
 * envelope as `<kind> <path>`, the payload's path when it carries one, else
 * the envelope's trace id), and the child-slot element the tab/section hands
 * in. No hooks and no service reads: the wrappers own the subscriptions, so
 * the smoke suite can inspect the exact tree.
 *
 * The state surfaces are the harness UI primitives (the shell's seed word,
 * @deepseek-ai/dsh-client-ui-primitives): the live dot is a StateDot, a
 * representation's kind is a Tag from the fixed eight-tone set (the kind
 * moves out of the meta line, which keeps the version and the sequence), and
 * the trace tail's in-between states are a DetailDocument whose state comes
 * from detailDocumentState. Every className, the remaining strings and every
 * node stay: the primitive replaces the exact span it stands for.
 */
/**
 * The envelope's display key: its payload path, else its trace id.
 */
const Key = (Envelope: TraceEnvelope): string => {
	const Path = Envelope.payload["path"];
	switch (true) {
		case typeof Path === "string" && Path.length > 0:
			return Path as string;
		default:
			return Envelope.trace;
	}
};

/**
 * The dot state the live flag paints: a resolved trace bus is the healthy
 * `done` dot, and the documented static state (no bus composed) is the
 * neutral `idle` grey. The trace contract reports no failure and no
 * in-flight state, so the primitive's `error` and `ongoing` arms have no
 * source here.
 */
const DotOf = (Live: boolean): StateDotState => {
	switch (true) {
		case Live:
			return "done";
		default:
			return "idle";
	}
};

/**
 * The tone one representation kind paints. A kind is an informational
 * classification, so the palette stays inside the read-only tones: `success`,
 * `danger` and `solid` state health or selection, which a kind does not.
 */
const ToneOf = (Kind: Representation["kind"]): TagTone => {
	switch (true) {
		case Kind === "file":
			return "info";
		case Kind === "test":
			return "warning";
		case Kind === "block":
			return "quiet";
		case Kind === "doc":
			return "outline";
		default:
			return "neutral";
	}
};

/**
 * The detail document's chrome from the package's own dictionary: the tab
 * title names the region and the placeholder. The retry and the markdown
 * copy stay empty because this body renders neither a document nor the
 * failure arm - the trace contract reports a live bus or the documented
 * static state, never a failure - and the dictionaries are not this file's
 * to extend.
 */
const Labels: DetailDocumentLabels = {
	title: EN_DICTIONARY.tab,
	loading: EN_DICTIONARY.tab,
	retry: "",
	markdown: { code: { copyLabel: "", copiedLabel: "" }, footnotes: "" },
};

/**
 * The retry the primitive requires: unreachable, because the failure arm is
 * the only one that draws the control and this view has no failure source.
 */
const Retry = (): void => undefined;

/**
 * The tail read the body stands for: the harness loading skeleton while a
 * live bus has delivered nothing yet, and the primitive's "nothing" arm in
 * the documented static state (no bus composed) - never a failure.
 */
const ReadOf = (Live: boolean): DetailDocumentRead => {
	switch (true) {
		case Live:
			return { status: "loading" };
		default:
			return { status: "ready", markdown: undefined };
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
			createElement(StateDot, {
				className: "playform-workspace-dot",
				state: DotOf(props.live),
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
					createElement(Tag, { tone: ToneOf(Representation.kind) }, Representation.kind),
					createElement(
						"span",
						{ className: "playform-workspace-representation-label" },
						Representation.label,
					),
					createElement(
						"span",
						{ className: "playform-workspace-representation-meta" },
						`v${String(Representation.version)} / seq ${String(Representation.lastSequence)}`,
					),
				),
			),
		),
		props.view.representations.length === 0
			? createElement("p", {}, EN_DICTIONARY.empty)
			: undefined,
		props.tail.length === 0
			? createElement(DetailDocument, {
					labels: Labels,
					onRetry: Retry,
					state: detailDocumentState(ReadOf(props.live)),
				})
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
