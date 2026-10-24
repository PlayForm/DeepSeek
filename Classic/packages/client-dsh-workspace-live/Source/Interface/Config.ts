// Config - the validated shape of the live client's tunables (the
// Schemastery schema in Variable/Config.ts produces this object).
export default interface Config {
	// The live view ships disabled (the family's idle posture; the profile
	// wiring pass enables it).
	enabled: boolean;
	// The tab's order in the conversation.view slot.
	tabOrder: number;
	// The bound on the recent-event tail the view keeps AND on the D5 trace
	// tail it renders (both newest-first surfaces share the one bound).
	maxEvents: number;
	// The bound on the presented representations.
	maxRepresentations: number;
}
