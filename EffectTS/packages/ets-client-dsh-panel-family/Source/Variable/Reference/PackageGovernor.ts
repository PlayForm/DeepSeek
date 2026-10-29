// PackageGovernor - the adapter for hook-dsh-package-governor, the first of
// the three governors (order 50). Same reference pattern: the child slot,
// the settings namespace, the static activation posture, and the D5 trace
// names. Its schema is the factory's shared block (the volatile log/logFile/
// updateCooldownMs/mutationTools cells plus the plain policyFile/exclude)
// followed by its own fields (strict, maxUpdateFailures, updateMode,
// ncuBin): the volatile cells ride the revision-fenced mutate, the rest ride
// the plain bridge.
import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

export default {
	id: "adapter-hook-dsh-package-governor",
	bundle: "@playform/ets-hook-dsh-package-governor",
	namespace: "hook-dsh-package-governor",
	title: "package-governor",
	order: 50,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
