// Maintain/Icon/Index.mjs - walks both trees, builds one genome per package,
// renders both SVG sets and the ledger, and writes or verifies the generated
// files. See Documentation/Brand/ICON-GRAMMAR.md sections 6, 8, 9 and 10.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { featuresOf } from "./Feature.mjs";
import * as Grammar from "./Grammar.mjs";
import { profileOf, structureOf } from "./Infer.mjs";
import { evolutionOf, mutationsOf } from "./Mutation.mjs";
import * as Palette from "./Palette.mjs";
import * as Prng from "./Prng.mjs";
import * as Render from "./RenderScene.mjs";

const sha256Of = (Text) => createHash("sha256").update(Text, "utf8").digest("hex");

/** The package directories of both trees, exactly the ones that carry a
 ** package.json, sorted by dir in plain code-unit order (not localeCompare). */
export const packages = (root) => {
	const Found = [];
	for (const Tree of ["Classic", "EffectTS"]) {
		const Base = join(root, Tree, "packages");
		for (const Dir of readdirSync(Base)) {
			if (existsSync(join(Base, Dir, "package.json"))) {
				Found.push({ dir: Dir, tree: Tree, path: `${Tree}/packages/${Dir}` });
			}
		}
	}
	return Found.sort((A, B) => (A.dir < B.dir ? -1 : A.dir > B.dir ? 1 : 0));
};

const changelogOf = (root, entry) => {
	const Path = join(root, entry.tree, "packages", entry.dir, "CHANGELOG.md");
	return existsSync(Path) ? readFileSync(Path, "utf8") : "";
};

/** The genome of one package entry: every featuresOf field plus seed,
 ** mutations, palette, plan, svg and hash. */
export const genomeOf = (root, entry) => {
	const features = featuresOf(root, entry.dir);
	const featureDigest = Prng.digest(JSON.stringify(features));
	const seed = Prng.seedOf([
		features.package,
		features.tree,
		features.version,
		featureDigest,
		features.changelogDigest,
	]);
	const palette = Palette.palettesOf({ kind: features.kind, seed: seed });
	const mutations = evolutionOf(mutationsOf(changelogOf(root, entry)));
	const structure = structureOf(root, entry.dir);
	const profile = profileOf(structure, {
		kind: features.kind,
		domain: features.domain,
		bundle: features.bundle,
	});
	const genome = {
		package: features.package,
		dir: features.dir,
		kind: features.kind,
		tree: features.tree,
		twin: features.twin,
		version: features.version,
		domain: features.domain,
		bundle: features.bundle,
		features: features.features,
		changelogDigest: features.changelogDigest,
		mutations,
		seed,
		palette,
		structure,
		profile,
		manifest: { tokens: structure.tokens },
		tokens: Object.fromEntries(
			Object.entries(structure.tokens).map(([Key, Values]) => [Key, Values.length]),
		),
	};

	// The plan streams from the seed, so it is computed on the genome without
	// plan; both renders receive the final genome with plan already set.
	const plan = Grammar.planOf(genome);
	const svg = {
		mono: `Site/Public/Icons/${entry.dir}.svg`,
		colour: `Site/Public/Icons/Color/${entry.dir}.svg`,
	};
	const rendered = { ...genome, plan, svg };
	return {
		...rendered,
		hash: {
			mono: sha256Of(Render.renderMono(rendered, plan)),
			colour: sha256Of(Render.renderColour(rendered, plan)),
		},
	};
};

// The ledger: format 1, the counts and one icon entry per package sorted by
// dir. Plan fields are read defensively; the rings fall back to the evolution
// rings of plan.mutations when the plan carries no rings of its own.
const ledgerOf = (genomes) => {
	const countOf = (Key, Value) => genomes.filter((Genome) => Genome[Key] === Value).length;
	const icons = genomes.map((Genome) => ({
		package: Genome.package,
		dir: Genome.dir,
		kind: Genome.kind,
		tree: Genome.tree,
		version: Genome.version,
		seed: Genome.seed,
		grammar: Genome.plan?.grammar,
		order: Genome.plan?.order,
		arms: Genome.plan?.arms,
		rings: Genome.plan?.rings ?? Genome.plan?.mutations?.rings ?? 0,
		orbit: Genome.plan?.orbit,
		rim: Genome.plan?.rim,
		mode: Genome.plan?.mode,
		hash: { mono: Genome.hash.mono, colour: Genome.hash.colour },
		path: { mono: Genome.svg.mono, colour: Genome.svg.colour },
	}));
	const Ledger = {
		format: 1,
		counts: {
			packages: genomes.length,
			classic: countOf("tree", "Classic"),
			effectTS: countOf("tree", "EffectTS"),
			hook: countOf("kind", "hook"),
			plugin: countOf("kind", "plugin"),
			client: countOf("kind", "client"),
			lib: countOf("kind", "lib"),
			mono: genomes.length,
			colour: genomes.length,
		},
		icons,
	};
	return `${JSON.stringify(Ledger, null, "\t")}\n`;
};

/** The whole generated set in memory: both SVG renders per package plus the
 ** ledger, keyed by root-relative POSIX path. */
export const build = (root) => {
	const genomes = packages(root).map((Entry) => genomeOf(root, Entry));
	const files = new Map();
	for (const Genome of genomes) {
		files.set(Genome.svg.mono, Render.renderMono(Genome, Genome.plan));
		files.set(Genome.svg.colour, Render.renderColour(Genome, Genome.plan));
	}
	files.set("Maintain/Icon/Ledger.json", ledgerOf(genomes));
	return { genomes, files };
};

/** Writes every generated file under root, creating directories as needed. */
export const write = (root) => {
	const { files } = build(root);
	for (const [Path, Content] of files) {
		const Target = join(root, Path);
		mkdirSync(dirname(Target), { recursive: true });
		writeFileSync(Target, Content);
	}
	return { written: files.size };
};

/** Compares the generated set against the bytes on disk: missing paths and
 ** paths whose bytes differ, ok when both lists are empty. */
export const check = (root) => {
	const { files } = build(root);
	const missing = [];
	const stale = [];
	for (const [Path, Content] of files) {
		const Target = join(root, Path);
		if (!existsSync(Target)) {
			missing.push(Path);
			continue;
		}
		if (!readFileSync(Target).equals(Buffer.from(Content, "utf8"))) {
			stale.push(Path);
		}
	}
	return { ok: missing.length === 0 && stale.length === 0, missing, stale };
};
