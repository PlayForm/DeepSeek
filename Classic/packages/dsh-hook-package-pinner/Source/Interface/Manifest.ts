// Manifest — one parsed package.json as the pinner sees it: an arbitrary JSON
// object decoded by Function/Decode from the `ctx.fs.readText` content.
// Dependency sections are named by the config `sections` (defaults in
// Variable/Section); every other key is the author's own (the refusal guard in
// Function/Rewrite refuses to let the rewrite change any of them). Typed
// loosely on purpose: the pinner amends dependency version strings and
// serialises the object back verbatim — it never interprets foreign sections.
export default interface Manifest {
	[Key: string]: unknown;
}
