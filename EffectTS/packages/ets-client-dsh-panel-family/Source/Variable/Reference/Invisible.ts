// Invisible - the adapter for hook-dsh-normalize-invisible, the fourth of the
// five remaining normalize flavors (order 14). Same reference pattern: the
// child slot, the settings namespace, the static activation posture, and the
// D5 trace names. The invisible schema carries the volatile `replacement`
// knob (the empty string by default: removal, not rewrite).
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-normalize-invisible",
	bundle: "@playform/ets-hook-dsh-normalize-invisible",
	namespace: "hook-dsh-normalize-invisible",
	title: "normalize-invisible",
	order: 14,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
