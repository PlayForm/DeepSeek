// Classic/smokes/scratch-profile-smoke.mjs - wiring suite #1 (the live
// ~/.dsh battery, Documentation/Plans/DOGFOOD-TESTING.md §3). The §2.3
// skeleton validity: the bundle list, the empty root, the patch-file shape,
// the no-symlink post-install invariant, and the tarball/file: install
// producing real (copied) directories whose bytes match the monorepo build.
// Tree-agnostic: this suite exercises the LIVE harness and imports nothing
// from the tree Targets, so the Classic and EffectTS copies are identical.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import os from "node:os";
import Path from "node:path";
import * as Wiring from "./wiring-live.mjs";

let Pass = 0,
	Fail = 0;
const Check = (Condition, Message) => {
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

const Scratch = await Wiring.EnsureScratch();
const Home = Scratch.Home;
const Profile = Scratch.Profile;

// ISOLATION - the scratch home is never the user's real ~/.dsh.
Check(Home !== Path.join(os.homedir(), ".dsh"), "the scratch home is not the real ~/.dsh");
Check(
	Home.startsWith(os.tmpdir()) || process.env.DSH_TEST_SCRATCH !== undefined,
	"the scratch home is the suite's own DSH_TEST_SCRATCH",
);
Check(existsSync(Profile), "the dsh-test profile directory exists");

// THE SKELETON (§2.3).
const Manifest = JSON.parse(readFileSync(Path.join(Profile, "package.json"), "utf8"));
const Bundles = Manifest?.dsh?.profile?.bundles ?? [];
Check(
	JSON.stringify(Bundles) ===
		JSON.stringify([
			"@deepseek-ai/dsh-base",
			"@deepseek-ai/dsh-web-app",
			"@playform/ets-dsh-plugin-factory",
			"@playform/ets-hook-dsh-package-governor",
			"@playform/ets-hook-dsh-package-pinner",
			"@playform/ets-hook-dsh-cargo-governor",
			"@playform/ets-hook-dsh-normalize-dash",
			"@playform/ets-hook-dsh-normalize-quotes",
			"@playform/ets-hook-dsh-normalize-ellipsis",
			"@playform/ets-hook-dsh-normalize-spaces",
			"@playform/ets-hook-dsh-normalize-invisible",
			"@playform/ets-hook-dsh-normalize-fullwidth",
			"@playform/ets-hook-dsh-normalize-file",
		]),
	"the bundle list mirrors the live desktop profile (13 entries, ordered)",
);

const Root = readFileSync(Path.join(Profile, "cordis.yml"), "utf8");
Check(
	Root.trim() === "[]" || Root.includes("# dsh profile root"),
	"cordis.yml is the empty root entry list (pre-boot form, or the loader's rewritten root-comment anchor after a boot)",
);

const UserPatch = readFileSync(Path.join(Profile, "cordis.patch.yml"), "utf8");
Check(
	!/apiKey|providers|cloudflare|baseUrl/i.test(UserPatch),
	"the user patch layer carries no personal config",
);
Check(
	!/updateCooldownMs|mutationTools|logFile/.test(UserPatch),
	"the user patch layer is empty of family overrides (the wiring overlay is separate)",
);

Check(
	existsSync(Path.join(Profile, "pnpm-workspace.yaml")),
	"pnpm-workspace.yaml exists (pnpm 11 settings home)",
);
Check(
	readFileSync(Path.join(Profile, "pnpm-workspace.yaml"), "utf8").includes("nodeLinker: hoisted"),
	"the install is hoisted like the live desktop profile",
);
Check(existsSync(Path.join(Profile, "pnpm-lock.yaml")), "the profile has a produced lockfile");

// THE TARBALLS (Method 1 - publish-identical).
const Tarballs = readdirSync(Scratch.Tarballs).filter((Entry) => Entry.endsWith(".tgz"));
Check(Tarballs.length === 12, `the 12 release tarballs were packed (${Tarballs.length})`);
Check(
	Tarballs.every((Entry) => Entry.startsWith("playform-")),
	"every tarball is a @playform pack artifact",
);

// THE NO-SYMLINK INVARIANT (§2.2).
const Links = Wiring.SymlinksOutsideStore(Home);
Check(
	Links.length === 0,
	`find $SCRATCH -type l is empty outside pnpm's own layout (${Links.length})`,
);

const PlayformDir = Path.join(Profile, "node_modules", "@playform");
Check(existsSync(PlayformDir), "node_modules/@playform exists");
const Expected = [
	"hook-dsh-cargo-governor",
	"hook-dsh-core",
	"hook-dsh-normalize-dash",
	"hook-dsh-normalize-ellipsis",
	"hook-dsh-normalize-file",
	"hook-dsh-normalize-fullwidth",
	"hook-dsh-normalize-invisible",
	"hook-dsh-normalize-quotes",
	"hook-dsh-normalize-spaces",
	"hook-dsh-package-governor",
	"hook-dsh-package-pinner",
	"dsh-plugin-factory",
];
const RealDirs = Expected.filter((Name) => {
	const Entry = Path.join(PlayformDir, Name);
	return existsSync(Entry) && statSync(Entry).isDirectory();
});
Check(RealDirs.length === 12, "every @playform entry is a real directory (copied, never linked)");

// THE FILE: INSTALL IS PUBLISH-IDENTICAL - the installed build bytes match
// the monorepo build (the plan's checksum-compare assertion, §2.2).
const CompareTargets = [
	["@playform/ets-dsh-plugin-factory", "dsh-plugin-factory"],
	["@playform/ets-hook-dsh-normalize-dash", "hook-dsh-normalize-dash"],
];
const TarballOf = (Name) => {
	const Short = Name.split("/")[1];
	const Match = readdirSync(Scratch.Tarballs)
		.filter((Entry) => Entry.startsWith(`playform-${Short}-`) && Entry.endsWith(".tgz"))
		.sort();
	return Match.length > 0 ? Path.join(Scratch.Tarballs, Match.at(-1)) : null;
};
for (const [Name, Dir] of CompareTargets) {
	const Installed = Path.join(PlayformDir, Name.split("/")[1], "Target", "Library.js");
	const Tarball = TarballOf(Name);
	const InstalledBytes = existsSync(Installed) ? readFileSync(Installed, "utf8") : null;
	const TarballBytes =
		Tarball !== null ? Wiring.TarballFile(Tarball, "package/Target/Library.js") : null;
	Check(
		InstalledBytes !== null && TarballBytes !== null && InstalledBytes === TarballBytes,
		`the installed ${Name} Target/Library.js bytes match the packed tarball (publish-identical)`,
	);
}

// THE EXERCISE DRIVER (scratch-only, never in the user's profiles).
Check(
	existsSync(
		Path.join(Profile, "node_modules", "@local", "dsh-wiring-exercise", "Target", "Library.js"),
	),
	"the wiring-exercise driver is installed in the scratch profile",
);

console.log(`\n${Pass} checks - ${Fail === 0 ? "ALL PASS" : `${Fail} FAIL`}`);
process.exit(Fail === 0 ? 0 : 1);
