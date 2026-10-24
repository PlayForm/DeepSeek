// Normalize - the reference adapter for the normalize family (the pattern the
// five remaining flavors and plugin-dsh-normalize-file copy). It declares the
// child slot its manifest registers into (the v4.1 model), the settings
// namespace its config form reads, its static activation posture, and the D5
// trace names it follows. The adapter itself holds no React and no host
// import: Function/Adapter.ts wires the manifest into the registry and the
// slot, and Function/Section.ts renders it.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-normalize-dash",
	bundle: "@playform/hook-dsh-normalize-dash",
	namespace: "hook-dsh-normalize-dash",
	title: "normalize",
	order: 10,
	slot: "playform.panel.section",
	// The schema has no master switch: the bundle row decides, so the static
	// posture is "enabled" until a trace envelope reports otherwise.
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
