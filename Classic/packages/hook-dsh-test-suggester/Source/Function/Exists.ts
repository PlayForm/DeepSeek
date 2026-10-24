// Exists - the BASE-AWARE companion existence filter: does a pack target
// exist under any of the call's three path bases? The embedded packs are this
// repo's conventions as DATA, and they mix three bases:
//
//   * repo-relative    (`Documentation/...`, `Site/...`, `CHANGELOG.md`);
//   * package-relative (`SCHEME.md`, `README.md`, `cordis.patch.yml`,
//     `Source/Test/...`, `Source/Function/Apply.ts`);
//   * sibling-relative (`*/package.json`, `*/Source/Function/Apply.ts`).
//
// A single-root filter silently dropped the most relevant companions (the
// package's own SCHEME.md and patch row), so the filter computes three bases
// from the RESOLVED call path:
//
//   * RepoRoot - the ancestor carrying Documentation/ARCHIVE-STYLE.md (the
//     workspace gate's root);
//   * PackageRoot - the nearest ancestor of the call path that contains
//     package.json, at or below RepoRoot;
//   * PackageParent - PackageRoot's parent directory.
//
// The rules (the filter only DROPS a target, it never rewrites one):
//   * a literal path (no `*`) -> exists under RepoRoot, PackageRoot or
//     PackageParent; a directory target passes by the same check;
//   * a `*/<rest>` glob -> at least one immediate subdirectory of
//     PackageParent or of RepoRoot contains `<rest>`;
//   * any other glob -> its literal prefix directory exists under a base;
//   * a target carrying a `<...>` placeholder (`Source/Test/<Suite>/Test.ts`)
//     is illustrative and always kept.
import { existsSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

import Package from "./Package.js";

/** An illustrative target placeholder (`Source/Test/<Suite>/Test.ts`). */
const Placeholder = /<[^>]+>/;

/** The bases a target may hang off, in the check order. */
const Bases = (Root: string, PackageRoot: string | undefined): string[] =>
	PackageRoot === undefined ? [Root] : [Root, PackageRoot, dirname(PackageRoot)];

/** Whether a literal path exists under any base. */
const Literal = (Companion: string, Paths: string[]): boolean =>
	Paths.some((Base) => existsSync(join(Base, Companion)));

/** Whether an immediate subdirectory of a root contains the rest. */
const Sibling = (Rest: string, Roots: string[]): boolean =>
	Roots.some((Root) => {
		try {
			return readdirSync(Root, { withFileTypes: true }).some(
				(Entry) => Entry.isDirectory() && existsSync(join(Root, Entry.name, Rest)),
			);
		} catch {
			return false;
		}
	});

/** Whether a general glob's literal prefix directory exists under a base. */
const Prefix = (Companion: string, Paths: string[]): boolean => {
	const Head = Companion.slice(0, Companion.indexOf("*"));
	const Directory = Head.endsWith("/") ? Head.slice(0, -1) : dirname(Head);
	return (
		Directory === "" ||
		Directory === "." ||
		Paths.some((Base) => existsSync(join(Base, Directory)))
	);
};

export default (
	/** The companion path or glob (one of the pack's three bases). */
	Companion: string,
	/** The call path the pack is judged against (absolute or cwd-relative). */
	CallPath: string,
	/** The resolved workspace root (the gate's root). */
	Root: string,
	/** The session cwd, when the harness service exposes one. */
	Cwd: string | undefined,
): boolean => {
	const Resolved = isAbsolute(CallPath) ? CallPath : resolve(Cwd ?? process.cwd(), CallPath);
	const PackageRoot = Package(Resolved, Root);
	switch (true) {
		case Placeholder.test(Companion):
			return true;
		case !Companion.includes("*"):
			return Literal(Companion, Bases(Root, PackageRoot));
		case Companion.startsWith("*/"):
			return Sibling(Companion.slice(2), [
				...(PackageRoot === undefined ? [] : [dirname(PackageRoot)]),
				Root,
			]);
		default:
			return Prefix(Companion, Bases(Root, PackageRoot));
	}
};
