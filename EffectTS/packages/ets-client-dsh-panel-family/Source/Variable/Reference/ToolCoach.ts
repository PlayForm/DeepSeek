// ToolCoach - the reference adapter for hook-dsh-tool-coach, the first real
// contribution of the v4.1 plan (section 7: the ladder section at order 30,
// the first config form). Every knob in the coach's schema is volatile, so
// its form writes all ride the revision-fenced settings mutate; the ladder
// section's live tail is the D5 trace when the host exposes it.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-tool-coach",
	bundle: "@playform/ets-hook-dsh-tool-coach",
	namespace: "hook-dsh-tool-coach",
	title: "tool-coach",
	order: 30,
	slot: "playform.panel.section",
	// Config.enabled defaults to true (Variable/Config.ts): the static posture
	// is the schema default, not a live read.
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
