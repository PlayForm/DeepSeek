// Fullwidth - the adapter for hook-dsh-normalize-fullwidth, the last of the
// five remaining normalize flavors (order 15). Same reference pattern: the
// child slot, the settings namespace, the static activation posture, and the
// D5 trace names. Like the quotes flavor it is a MAP flavor: no
// `replacement` field exists (the substitution is the core's Fullwidth
// table), so the form's tunables are the volatile log/scopes cells and the
// two plain semantic gates.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-normalize-fullwidth",
	bundle: "@playform/ets-hook-dsh-normalize-fullwidth",
	namespace: "hook-dsh-normalize-fullwidth",
	title: "normalize-fullwidth",
	order: 15,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
