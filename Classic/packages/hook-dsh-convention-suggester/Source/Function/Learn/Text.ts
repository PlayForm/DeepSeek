// Text - the learning note's model-facing text (D4): what was proposed, where
// the proposal is, how many families it carries, and the one install step.
// Byte-stable (the smoke asserts it verbatim); the install line names the
// user layer's documented path so the model needs no further lookup.
//
// The proposal line is ABSOLUTE (the temp home in a smoke, the real home in
// production) because the model must be able to act on it; the install line
// stays tilde-form, the documented user-layer location.
export default (Slug: string, Path: string, Families: number): string =>
	[
		`[convention-suggester] learned pack proposal for ${Slug}`,
		`proposal: ${Path}`,
		`families: ${Families}`,
		`install: copy the proposal to ~/.dsh/playform/workspaces/${Slug}.yml`,
	].join("\n");
