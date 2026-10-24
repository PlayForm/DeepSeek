// NormalizeFile - the adapter for plugin-dsh-normalize-file, the
// file-content normalizer of the normalize family (order 20, between the
// stream flavors and the tool coach). Same reference pattern: the child
// slot, the settings namespace, the static activation posture, and the D5
// trace names. Its schema keeps the family's volatile cells (logFile,
// replacement, the scopes object, toolResultsExempt) and adds NO plain
// semantic gate: every field the form derives is volatile.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-plugin-dsh-normalize-file",
	bundle: "@playform/plugin-dsh-normalize-file",
	namespace: "plugin-dsh-normalize-file",
	title: "normalize-file",
	order: 20,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
