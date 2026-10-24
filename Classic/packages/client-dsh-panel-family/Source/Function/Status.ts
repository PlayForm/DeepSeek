// Status - resolve one adapter's status from its declared static posture and
// the panel's live trace tail. The tail lines are byte-exact
// `<kind> <key>` strings, where the key is the envelope's payload path when it
// carries one (the coalescing key of the D5 contract) and its trace id
// otherwise. The activation state is the adapter's declared posture unless
// the NEWEST matching envelope carries `payload.activation` of "enabled" or
// "disabled" - the one live override the panel honours. Without a trace the
// status is static and the tail is empty (the documented fallback).
import type {
	PanelActivation,
	PanelEnvelope,
	PanelSection,
	PanelStatus,
} from "@Interface/Panel.js";
import type { PanelLive } from "@Interface/Trace.js";

/** The envelope's display key: its payload path, else its trace id. */
const Key = (Envelope: PanelEnvelope): string => {
	const Path = Envelope.payload["path"];
	switch (true) {
		case typeof Path === "string" && Path.length > 0:
			return Path as string;
		default:
			return Envelope.trace;
	}
};

/** One tail line: the event name and its key. */
const Line = (Envelope: PanelEnvelope): string => `${Envelope.kind} ${Key(Envelope)}`;

/** The activation override one envelope carries, when it carries one. */
const Activation = (Envelope: PanelEnvelope): PanelActivation | undefined => {
	const Value = Envelope.payload["activation"];
	switch (true) {
		case Value === "enabled":
			return "enabled";
		case Value === "disabled":
			return "disabled";
		default:
			return undefined;
	}
};

export default function Status(Section: PanelSection, Live: PanelLive | undefined): PanelStatus {
	const Envelopes = Live === undefined ? [] : Live.tail();
	const Matched =
		Section.match === undefined
			? Envelopes
			: Envelopes.filter((Envelope) => Section.match?.(Envelope) === true);
	// Newest first: the first envelope carrying an activation wins.
	const Override = Matched.find((Envelope) => Activation(Envelope) !== undefined);
	const Declared: PanelActivation = Section.activation ?? "unknown";
	const ActivationState: PanelActivation =
		Override === undefined ? Declared : (Activation(Override) as PanelActivation);
	return {
		bundle: Section.bundle,
		activation: ActivationState,
		live: Live !== undefined,
		tail: Matched.map(Line),
	};
}
