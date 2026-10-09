// Normalize — the FULL-VERSION NORMALIZATION rule (a Cargo-module directive):
// every simple version value in the dependency sections must be expanded to
// its MOST SPECIFIC form — no shorthand like "1.0" may remain in a governed
// Cargo.toml.
//
//   "1"      → "1.0.0"
//   "1.2"    → "1.2.0"
//   "1.2.3"  → unchanged (already full)
//   "1.2-rc.1"   → "1.2.0-rc.1"  (the core is padded BEFORE any prerelease)
//   "1.2.3-rc.1" → unchanged     (prerelease preserved as authored)
//   "1.2.3+build"→ unchanged     (build metadata preserved as authored)
//   "=1.0"   → "=1.0.0"          (the exact form keeps its = prefix)
//
// COMPLEX FORMS ARE LEFT AS-IS (same rule as before): ">=", ">", "<", "~",
// "^", "*", compound/space ranges — anything that is not a bare (or =
// prefixed) numeric core with an optional prerelease/build suffix returns
// null and the value stays byte-identical.
//
// Cargo semantics are unchanged by this rule: a bare full version is still
// Cargo's implicit caret — "1.0.0" means exactly what "1.0" meant, written
// fully.
//
// Pure internal calculation — one of the standing exemptions.
export default (Version: string): string | null => {
	let Value = Version.trim();
	// Complex requirement syntax is never normalized.
	switch (true) {
		case /^[~^><*]/.test(Value):
		case /\s/.test(Value):
		case Value.includes(","):
			return null;
	}
	// The exact form keeps its "=" prefix; the rest must be a simple core.
	let Prefix = "";
	if (Value.startsWith("=")) {
		Prefix = "=";
		Value = Value.slice(1).trim();
	}
	// Core = 1..3 dot-separated numeric parts, followed by an optional
	// prerelease/build suffix ("-..." or "+...").
	const Match = /^(\d+(?:\.\d+)*)(?:([-+].*))?$/.exec(Value);
	switch (true) {
		case !Match:
			return null;
	}
	const Parts = (Match[1] as string).split(".");
	switch (true) {
		case Parts.length > 3:
			return null;
	}
	while (Parts.length < 3) {
		Parts.push("0");
	}
	return `${Prefix}${Parts.join(".")}${Match[2] ?? ""}`;
};
