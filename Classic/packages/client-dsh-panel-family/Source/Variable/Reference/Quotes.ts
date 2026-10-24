// Quotes - the adapter for hook-dsh-normalize-quotes, the first of the five
// remaining normalize flavors (order 11, right after the dash reference at
// 10). It copies the reference pattern exactly: the child slot its manifest
// registers into (the v4.1 model), the settings namespace its config form
// reads, its static activation posture, and the D5 trace names it follows.
// The quotes schema has no master switch (Variable/Config.ts: the bundle row
// decides), so the static posture is "enabled" until a trace envelope reports
// otherwise; the form's volatile knobs (logFile, the scopes object,
// toolResultsExempt) ride the revision-fenced mutate and its two semantic
// gates (normalizeReasoning, normalizeToolArguments) ride the plain bridge.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-normalize-quotes",
	bundle: "@playform/hook-dsh-normalize-quotes",
	namespace: "hook-dsh-normalize-quotes",
	title: "normalize-quotes",
	order: 11,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
