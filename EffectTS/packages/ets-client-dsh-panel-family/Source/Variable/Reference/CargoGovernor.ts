// CargoGovernor - the adapter for hook-dsh-cargo-governor, the third of the
// three governors (order 60), the Rust-side twin of the package governor.
// Same reference pattern: the child slot, the settings namespace, the static
// activation posture, and the D5 trace names. Its schema is the factory's
// shared block (the volatile log/logFile/updateCooldownMs/mutationTools
// cells plus the plain policyFile/exclude) followed by its own fields
// (strict, maxUpdateFailures, cargoBin, keepFile, updateMode).
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-cargo-governor",
	bundle: "@playform/ets-hook-dsh-cargo-governor",
	namespace: "hook-dsh-cargo-governor",
	title: "cargo-governor",
	order: 60,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
