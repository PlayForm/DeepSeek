// Refusal — the shared REFUSAL GUARD: only the declared dependency sections
// may differ from the author's manifest. If a module's own logic would EVER
// change a non-dependency section, the rewrite is refused — never applied.
// The guard composes the family's byte-identical line through the module's
// Append:
//   `REFUSED rewrite of <path>: non-dependency section "<name>" would change`
// and returns true when refused (the module returns null — the factory stays
// silent and no update stage follows).
export default (
	Append: (Message: string) => void,
	Path: string,
	Sections: string[],
	Current: Record<string, unknown>,
	Next: Record<string, unknown>,
): boolean => {
	for (const Name of Object.keys(Current)) {
		switch (true) {
			case !Sections.includes(Name) &&
				JSON.stringify(Current[Name]) !== JSON.stringify(Next[Name]):
				Append(`REFUSED rewrite of ${Path}: non-dependency section "${Name}" would change`);
				return true;
		}
	}
	return false;
};
