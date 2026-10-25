/** The workspace dependencies of one package: its manifest dependencies under
 *  the release scope. */
export default (Manifest, Scope) =>
	Object.keys(Manifest.dependencies ?? {}).filter((Name) => Name.startsWith(Scope));
