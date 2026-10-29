// Ccr - the adapter for hook-dsh-ccr, the tool-output compression hook
// (order 70, the last section of the family tab). Same reference pattern:
// the child slot, the settings namespace, the static activation posture, and
// the D5 trace names. Its schema's volatile cells (logFile, thresholdBytes,
// the multipliers object, previewMaxChars) ride the revision-fenced mutate;
// the structural knobs (targets, exempt, the store, the journal,
// autoExpand, the phase-4 context-engine flags) ride the plain bridge.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-ccr",
	bundle: "@playform/ets-hook-dsh-ccr",
	namespace: "hook-dsh-ccr",
	title: "ccr",
	order: 70,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
