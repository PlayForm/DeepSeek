// Suggester - the reference adapter for the suggester family, represented by
// hook-dsh-convention-suggester (the pack learner after the completion spec's
// re-spec). Its schema is fully volatile, so its form writes ride the
// revision-fenced settings mutate, and the D5 trace feeds its live tail.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-convention-suggester",
	bundle: "@playform/hook-dsh-convention-suggester",
	namespace: "hook-dsh-convention-suggester",
	title: "suggester",
	order: 40,
	slot: "playform.panel.section",
	// Config.enabled defaults to true (Variable/Config.ts): the static posture
	// is the schema default, not a live read.
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
