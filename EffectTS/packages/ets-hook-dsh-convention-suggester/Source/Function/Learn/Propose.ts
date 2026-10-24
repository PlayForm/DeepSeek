// Propose - derive a repo's pack and WRITE it to the proposals directory: the
// one write the learner performs (D4 - "propose, never write silently"). The
// proposal is a FULL pack object (the library's `Pack` type), not a diff
// against the built-in pack: slug, signature and the families whose
// companions exist. Nothing else is read by a suggester until the user copies
// the file into the user layer.
//
// The derivation is the three leaves: Scan (the found markers), Signature
// (ARCHIVE-STYLE.md, else INDEX.md, else package.json) and Families (the
// companion-complete rows). The slug is the root's basename, lowercased - the
// library's own Slug - so the proposal's name matches the user-layer file the
// note tells the user to create.
//
// No markers -> no signature -> no proposal. No families -> nothing to
// propose. Both are silence, never an empty file.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { Slug, type Pack } from "@playform/ets-lib-dsh-pack";

import type Learned from "../../Interface/Learned.js";
import Families from "./Families.js";
import Location from "./Location.js";
import Scan from "./Scan.js";
import Serialize from "./Serialize.js";
import Signature from "./Signature.js";

export default (Root: string, Home: string): Learned | undefined => {
	const Found = Scan(Root);
	const Markers = Signature(Found);
	if (Markers === undefined) {
		return undefined;
	}
	const Rows = Families(Found);
	const Count = Object.keys(Rows).length;
	if (Count === 0) {
		return undefined;
	}
	const Name = Slug(Root);
	const Proposal: Pack = { slug: Name, signature: Markers, families: Rows };
	const Path = Location(Home, Name);
	mkdirSync(dirname(Path), { recursive: true });
	writeFileSync(Path, Serialize(Proposal), "utf8");
	return { slug: Name, path: Path, families: Count };
};
