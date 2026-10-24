// Measure - one pack candidate against the graph projection (the P2 rules
// that replace the neutral 0.5 literal of Function/Score):
//
//   literal(c) =
//     0.5                                  the graph is absent or empty (the
//                                          documented neutral fallback - the
//                                          caller passes no projection);
//     1.0 * recency(c)                     a node exists at c and its kind is
//                                          one the intent expects (Variable/
//                                          Kinds), where recency(c) =
//                                          0.9 + 0.1 * rank;
//     0.8 * recency(c)                     a node exists at c with another kind;
//     0.3                                  the graph has nodes but none at c
//                                          (the candidate is unproven - the
//                                          existence filter already proved the
//                                          file on disk, the graph did not).
//
//   scope(c) =
//     1.0                                  the graph is absent/empty, or the
//                                          shallowest matched node sits at
//                                          depth <= 2 (the canonical top);
//     1.0 - min(0.3, 0.05 * (depth - 2))   a deeper literal node;
//     0.7                                  a glob candidate the graph proves
//                                          (the plan's in-scope glob tier).
//
// The match rules (the projection only READS the graph; it never rewrites a
// candidate):
//   * a literal path matches a node path equal to it or ending in `/<path>`
//     (the pack mixes repo-relative and package-relative paths, and the graph
//     stores display paths);
//   * a `*/<rest>` glob matches any node path ending in `/<rest>` (any
//     package, the same sibling rule the existence filter uses);
//   * any other glob is translated to a segment-anchored regex (`**/` = any
//     depth, `*` = one segment).
import type { Intent, Target } from "../Interface/Execution.js";
import type Measurement from "../Interface/Measurement.js";
import type Projection from "../Interface/Projection.js";
import Kinds from "../Variable/Kinds.js";

/** The literal score of a candidate the graph has nodes for but cannot prove. */
const Unproven = 0.3;

/** The scope score of a glob candidate the graph proves. */
const GlobScope = 0.7;

/** Escape one literal glob segment for a RegExp. */
const Escape = (Text: string): string => Text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A glob translated to a segment-anchored RegExp: a single star is one segment, a double star with a slash is any depth. */
const Pattern = (Glob: string): RegExp => {
	const Body = Glob.split("**/")
		.map((Part) => Part.split("*").map(Escape).join("[^/]*"))
		.join("(?:.*/)?");
	return new RegExp(`(^|/)${Body}$`);
};

/** Whether a node path satisfies a candidate path or glob. */
export const Match = (Candidate: string, NodePath: string): boolean => {
	switch (true) {
		case !Candidate.includes("*"):
			return NodePath === Candidate || NodePath.endsWith(`/${Candidate}`);
		case Candidate.startsWith("*/"):
			return NodePath.endsWith(`/${Candidate.slice(2)}`);
		default:
			return Pattern(Candidate).test(NodePath);
	}
};

/** The depth tier: the canonical top (depth <= 2) keeps 1.0, deeper paths lose up to 0.3. */
const Shallow = (Depth: number): number => 1 - Math.min(0.3, 0.05 * Math.max(0, Depth - 2));

/** The path below the snapshot's common root (the repo-relative form). */
const Relative = (Projection: Projection, Path: string): string =>
	Path.split("/").slice(Projection.root).join("/");

export default (
	/** The built projection (Function/Projection). */
	Projection: Projection,
	/** The intent the candidate belongs to (its expected kinds). */
	Intent: Intent,
	/** The pack candidate. */
	Target: Target,
): Measurement => {
	const Glob = Target.path.includes("*");
	const Matches = [...Projection.facts].flatMap(([Path, Fact]) =>
		Match(Target.path, Path) ? [{ Path, Fact }] : [],
	);
	if (Matches.length === 0) {
		return {
			exists: false,
			kind: "",
			depth: 0,
			recency: 0,
			literal: Unproven,
			scope: Glob ? GlobScope : 1,
			paths: [],
			count: 0,
		};
	}
	// A LITERAL candidate resolves to its single BEST node (an exact
	// repo-relative match first, then the shallowest, then the newest), so a
	// root-relative `package.json` never claims every package's manifest. A
	// GLOB candidate resolves to every matched path (the family's concrete
	// index).
	const Selected = Glob
		? Matches
		: Matches.slice()
				.sort(
					(Left, Right) =>
						(Relative(Projection, Left.Path) === Target.path ? 0 : 1) -
							(Relative(Projection, Right.Path) === Target.path ? 0 : 1) ||
						Left.Fact.depth - Right.Fact.depth ||
						Right.Fact.recency - Left.Fact.recency ||
						(Left.Path < Right.Path ? -1 : Left.Path > Right.Path ? 1 : 0),
				)
				.slice(0, 1);
	const Expected = Kinds[Intent.id] ?? [];
	const Seen = new Set(Selected.flatMap((Match_) => Match_.Fact.kinds));
	const Kind = Expected.find((Kind_) => Seen.has(Kind_)) ?? [...Seen][0] ?? "";
	const Recency = Math.max(...Selected.map((Match_) => Match_.Fact.recency));
	const Depth = Math.min(...Selected.map((Match_) => Match_.Fact.depth));
	const Paths = Selected.map((Match_) => Match_.Path).sort((Left, Right) => {
		const LeftFact = Projection.facts.get(Left);
		const RightFact = Projection.facts.get(Right);
		return (
			(LeftFact?.depth ?? 0) - (RightFact?.depth ?? 0) ||
			(RightFact?.recency ?? 0) - (LeftFact?.recency ?? 0) ||
			(Left < Right ? -1 : Left > Right ? 1 : 0)
		);
	});
	return {
		exists: true,
		kind: Kind,
		depth: Depth,
		recency: Recency,
		literal: (Expected.includes(Kind) ? 1 : 0.8) * (0.9 + 0.1 * Recency),
		scope: Glob ? GlobScope : Shallow(Depth),
		paths: Paths,
		count: Selected.length,
	};
};
