/** Is a relative path excluded - exactly, or under an excluded folder. */
export default (Exclusion, File) =>
	Exclusion.has(File) ||
	[...Exclusion].some((Path) => Path.endsWith("/") && File.startsWith(Path));
