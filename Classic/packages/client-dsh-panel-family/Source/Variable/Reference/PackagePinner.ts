// PackagePinner - the adapter for hook-dsh-package-pinner, the second of the
// three governors (order 55). Same reference pattern: the child slot, the
// settings namespace, the static activation posture, and the D5 trace
// names. Its schema is the factory's shared block (the volatile cells plus
// the plain policyFile/exclude) followed by its own `sections` field (the
// dependency sections the pinner may rewrite, a plain array).
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-package-pinner",
	bundle: "@playform/hook-dsh-package-pinner",
	namespace: "hook-dsh-package-pinner",
	title: "package-pinner",
	order: 55,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
