// smokes/Test/Scratch-Profile/Live-Assertions/Test.ts - one singular test:
// the Section 2.3 skeleton validity of the freshly created scratch profile -
// the bundle list, the empty root, the patch-file shape, the no-symlink
// post-install invariant, and the tarball/file: install producing real
// (copied) directories whose bytes match the monorepo build. Split from
// scratch-profile-smoke.mjs: this folder carries the suite's live
// assertions; the skip guard and the harness checks live in the sibling
// Gate-And-Harness folder.
// Tree-agnostic: this folder exercises the LIVE harness via the shared
// wiring-live.mjs and imports nothing from the tree Targets, so the Classic
// and EffectTS copies differ by the tree's own package names only.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import * as Wiring from "../../../wiring-live.mjs";

let Pass = 0;
let Fail = 0;
const Check = (Condition: boolean, Message: string): void => {
	if (Condition) {
		Pass += 1;
		console.log(`PASS - ${Message}`);
	} else {
		Fail += 1;
		console.log(`FAIL - ${Message}`);
	}
};

if (!Wiring.ScratchHome()) {
	console.log("SKIPPED (no scratch home)");
	process.exit(0);
}

const Scratch = (await Wiring.EnsureScratch())!;
const Home = Scratch.Home;
const Profile = Scratch.Profile;
const PlayformDir = path.join(Profile, "node_modules", "@playform");

// Group: the isolation - the scratch home is never the user's real ~/.dsh.
{
	// Leaf 1: the home differs from the real ~/.dsh. Leaf 2: the home is the
	// suite's own DSH_TEST_SCRATCH. Leaf 3: the profile directory exists.
	Check(Home !== path.join(os.homedir(), ".dsh"), "the scratch home is not the real ~/.dsh");
	Check(
		Home.startsWith(os.tmpdir()) || process.env["DSH_TEST_SCRATCH"] !== undefined,
		"the scratch home is the suite's own DSH_TEST_SCRATCH",
	);
	Check(existsSync(Profile), "the dsh-test profile directory exists");
}

// Group: the skeleton (Section 2.3 of the plan).
{
	// Leaf 4: the bundle list mirrors the live desktop profile (13 entries,
	// ordered).
	const Manifest = JSON.parse(readFileSync(path.join(Profile, "package.json"), "utf8"));
	const Bundles = Manifest?.dsh?.profile?.bundles ?? [];
	Check(
		JSON.stringify(Bundles) ===
			JSON.stringify([
				"@deepseek-ai/dsh-base",
				"@deepseek-ai/dsh-web-app",
				"@playform/ets-plugin-dsh-factory",
				"@playform/ets-hook-dsh-package-governor",
				"@playform/ets-hook-dsh-package-pinner",
				"@playform/ets-hook-dsh-cargo-governor",
				"@playform/ets-hook-dsh-normalize-dash",
				"@playform/ets-hook-dsh-normalize-quotes",
				"@playform/ets-hook-dsh-normalize-ellipsis",
				"@playform/ets-hook-dsh-normalize-spaces",
				"@playform/ets-hook-dsh-normalize-invisible",
				"@playform/ets-hook-dsh-normalize-fullwidth",
				"@playform/ets-plugin-dsh-normalize-file",
			]),
		"the bundle list mirrors the live desktop profile (13 entries, ordered)",
	);

	// Leaf 5: cordis.yml is the empty root entry list (pre-boot form, or the
	// loader's rewritten root-comment anchor after a boot).
	const Root = readFileSync(path.join(Profile, "cordis.yml"), "utf8");
	Check(
		Root.trim() === "[]" || Root.includes("# dsh profile root"),
		"cordis.yml is the empty root entry list (pre-boot form, or the loader's rewritten root-comment anchor after a boot)",
	);

	// Leaf 6: the user patch layer carries no personal config. Leaf 7: it is
	// empty of family overrides (the wiring overlay is separate).
	const UserPatch = readFileSync(path.join(Profile, "cordis.patch.yml"), "utf8");
	Check(
		!/apiKey|providers|cloudflare|baseUrl/i.test(UserPatch),
		"the user patch layer carries no personal config",
	);
	Check(
		!/updateCooldownMs|mutationTools|logFile/.test(UserPatch),
		"the user patch layer is empty of family overrides (the wiring overlay is separate)",
	);

	// Leaf 8: pnpm-workspace.yaml exists (pnpm 11 settings home). Leaf 9:
	// the install is hoisted like the live desktop profile. Leaf 10: the
	// profile has a produced lockfile.
	Check(
		existsSync(path.join(Profile, "pnpm-workspace.yaml")),
		"pnpm-workspace.yaml exists (pnpm 11 settings home)",
	);
	Check(
		readFileSync(path.join(Profile, "pnpm-workspace.yaml"), "utf8").includes(
			"nodeLinker: hoisted",
		),
		"the install is hoisted like the live desktop profile",
	);
	Check(existsSync(path.join(Profile, "pnpm-lock.yaml")), "the profile has a produced lockfile");
}

// Group: the tarballs (Method 1 - publish-identical).
{
	// Leaf 11: the 15 release tarballs were packed (the twelve bundles + the
	// base + the two new libraries: trace, pack). Leaf 12: every tarball is a
	// @playform pack artifact.
	const Tarballs = readdirSync(Scratch.Tarballs).filter((Entry) => Entry.endsWith(".tgz"));
	Check(Tarballs.length === 15, `the 15 release tarballs were packed (${Tarballs.length})`);
	Check(
		Tarballs.every((Entry) => Entry.startsWith("playform-")),
		"every tarball is a @playform pack artifact",
	);
}

// Group: the no-symlink invariant (Section 2.2 of the plan).
{
	// Leaf 13: find $SCRATCH -type l is empty outside pnpm's own layout.
	const Links = Wiring.SymlinksOutsideStore(Home);
	Check(
		Links.length === 0,
		`find $SCRATCH -type l is empty outside pnpm's own layout (${Links.length})`,
	);
}

// Group: the real directories - every @playform entry is a copied directory,
// never a link.
{
	// Leaf 14: node_modules/@playform exists. Leaf 15: every expected entry
	// is a real directory.
	Check(existsSync(PlayformDir), "node_modules/@playform exists");
	const Expected = [
		"ets-base-dsh",
		"ets-hook-dsh-cargo-governor",
		"ets-lib-dsh-core",
		"ets-lib-dsh-pack",
		"ets-lib-dsh-trace",
		"ets-hook-dsh-normalize-dash",
		"ets-hook-dsh-normalize-ellipsis",
		"ets-plugin-dsh-normalize-file",
		"ets-hook-dsh-normalize-fullwidth",
		"ets-hook-dsh-normalize-invisible",
		"ets-hook-dsh-normalize-quotes",
		"ets-hook-dsh-normalize-spaces",
		"ets-hook-dsh-package-governor",
		"ets-hook-dsh-package-pinner",
		"ets-plugin-dsh-factory",
	];
	const RealDirs = Expected.filter((Name) => {
		const Entry = path.join(PlayformDir, Name);
		return existsSync(Entry) && statSync(Entry).isDirectory();
	});
	Check(
		RealDirs.length === 15,
		"every @playform entry is a real directory (copied, never linked)",
	);
}

// Group: the file: install is publish-identical - the installed build bytes
// match the packed tarball (the plan's checksum-compare assertion,
// Section 2.2).
{
	const CompareTargets: Array<[string, string]> = [
		["@playform/ets-plugin-dsh-factory", "ets-plugin-dsh-factory"],
		["@playform/ets-hook-dsh-normalize-dash", "ets-hook-dsh-normalize-dash"],
	];
	const TarballOf = (Name: string): string | null => {
		const Short = Name.split("/")[1]!;
		const Match = readdirSync(Scratch.Tarballs)
			.filter((Entry) => Entry.startsWith(`playform-${Short}-`) && Entry.endsWith(".tgz"))
			.sort();
		return Match.length > 0 ? path.join(Scratch.Tarballs, Match.at(-1)!) : null;
	};
	for (const [Name, Dir] of CompareTargets) {
		const Installed = path.join(PlayformDir, Dir, "Target", "Library.js");
		const Tarball = TarballOf(Name);
		const InstalledBytes = existsSync(Installed) ? readFileSync(Installed, "utf8") : null;
		const TarballBytes = Tarball !== null ? Wiring.TarballFile(Tarball, "package/Target/Library.js") : null;
		// Leaf 16 + Leaf 17: one per compared package.
		Check(
			InstalledBytes !== null && TarballBytes !== null && InstalledBytes === TarballBytes,
			`the installed ${Name} Target/Library.js bytes match the packed tarball (publish-identical)`,
		);
	}
}

// Group: the exercise driver (scratch-only, never in the user's profiles).
{
	// Leaf 18: the wiring-exercise driver is installed in the scratch
	// profile.
	Check(
		existsSync(
			path.join(Profile, "node_modules", "@local", "dsh-wiring-exercise", "Target", "Library.js"),
		),
		"the wiring-exercise driver is installed in the scratch profile",
	);
}

console.log(`${Pass} PASS - Scratch-Profile/Live-Assertions`);
process.exit(Fail === 0 ? 0 : 1);
