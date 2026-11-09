// Status - resolve one adapter's status from its declared static posture and
// the panel's live trace tail. The tail lines are byte-exact
// `<kind> <key>` strings, where the key is the envelope's payload path when it
// carries one (the coalescing key of the D5 contract) and its trace id
// otherwise. The activation state is the adapter's declared posture unless
// the NEWEST matching envelope carries `payload.activation` of "enabled" or
// "disabled" - the one live override the panel honours. Without a trace the
// status is static and the tail is empty (the documented fallback). The
// activation LAMP is a harness StateDot: the dot carries the state, the status
// line beside it carries the words (the dot is aria-hidden).
import { StateDot, type StateDotState } from "@deepseek-ai/dsh-client-ui-primitives";
import type {
	PanelActivation,
	PanelEnvelope,
	PanelSection,
	PanelStatus,
} from "@Interface/Panel.js";
import type { PanelLive } from "@Interface/Trace.js";
import { createElement } from "react";

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

/** The dot state one activation posture paints: an enabled adapter is done,
 *  an unknown posture is the user-attention warning, and a disabled one is the
 *  neutral idle grey. The primitive's `error` and `ongoing` states have no
 *  posture here: the panel never reports a failed or a running activation. */
const StateOf = (Posture: PanelActivation): StateDotState => {
	switch (true) {
		case Posture === "enabled":
			return "done";
		case Posture === "unknown":
			return "warning";
		default:
			return "idle";
	}
};

/** The activation lamp: the harness state dot for one activation posture. */
export const Lamp = (props: { activation: PanelActivation }): ReturnType<typeof createElement> =>
	createElement(StateDot, { state: StateOf(props.activation) });

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
