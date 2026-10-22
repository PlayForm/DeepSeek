// Config - the validated shape of the panel package's tunables (the
// Schemastery schema in Variable/Config.ts produces this object).
export default interface Config {
	// The package ships enabled: the client half is a pure browser module
	// and needs no restart, so the default is on (R-UI-1). The bundle patch
	// row still carries the Loader-level enablement decision.
	enabled: boolean;
	// The family tab's order in the conversation.view slot (20 puts it
	// between Trajectory and chat per PHASE-2 A2.3).
	tabOrder: number;
	// The overlay panel max width in px, applied by the overlay mount.
	overlayMaxWidth: number;
	// The locale namespace fallback language for the panel's own strings.
	locale: "en" | "zh";
}
