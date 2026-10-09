// wiring-live.mjs - the shared infrastructure for the family's WIRING suites
// (the live `~/.dsh` battery per Documentation/Plans/DOGFOOD-TESTING.md). The
// suites are tree-agnostic: they exercise the LIVE harness (the `dsh` CLI +
// the scratch profile) and import nothing from the tree Targets, so the
// Classic and EffectTS copies are byte-identical.
//
// The scratch lifecycle (the plan's §2.4: create → install → activate →
// exercise → verify → destroy) lives here, driven by whichever suite or the
// wiring runner (Maintain/Run-Wiring.mjs) is executing:
//
//   * The scratch home is $DSH_TEST_SCRATCH (method B - DSH_HOME redirected).
//     UNSET means the suite SKIPS (exit 0, `SKIPPED (no scratch home)`) - the
//     mechanics-only `pnpm test` never touches the harness.
//   * A missing/uninitialized scratch is created on demand: 12 `pnpm pack`
//     tarballs from Classic/packages (publish-identical, NO symlinks), the
//     profile skeleton (bundle list mirroring the live desktop profile, the
//     empty cordis.yml root, the minimal user layer, `file:` tarball deps),
//     the wiring overlay, the scratch-only exercise driver package, and a
//     fake cargo shim so the cargo update stage never touches a real toolchain.
//   * Every mutation is under the scratch home. The user's real ~/.dsh is
//     only ever read (and only by the user, not by these suites).
//
// The ledgers land in $SCRATCH/ledgers/*.log because the wiring overlay
// points every family module's `logFile` there - the bundle layers' `~/.dsh/...`
// defaults do NOT resolve under a redirected DSH_HOME (the appends silently
// fail - the storage-domain gap the plan's §1.2-5 documents; the overlay is
// the battery's own record of that discovery).
import ChildProcess from "node:child_process";
import FileSystem from "node:fs";
import OS from "node:os";
import Path from "node:path";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** The scratch home, or "" when the suite must skip. */
export const ScratchHome = () => process.env.DSH_TEST_SCRATCH ?? "";

/** The monorepo root (the suite file sits in <tree>/smokes/). */
export const MonorepoRoot = () =>
	process.env.DSH_WIRING_MONOREPO ?? Path.resolve(import.meta.dirname, "..", "..");

/** The Classic release tree - the packing source per the plan (§2.2). */
export const PackagesDir = () => Path.join(MonorepoRoot(), "Classic", "packages");

// The twelve release packages: the bundle-list name and the candidate source
// directory names (the tree's package directories were renamed hook-dsh-* →
// dsh-hook-* mid-batch; both spellings are accepted).
const Bundles = [
	["@playform/dsh-plugin-factory", ["dsh-plugin-factory", "dsh-plugin-factory"]],
	["@playform/hook-dsh-core", ["hook-dsh-core", "hook-dsh-core"]],
	[
		"@playform/hook-dsh-package-governor",
		["hook-dsh-package-governor", "hook-dsh-package-governor"],
	],
	["@playform/hook-dsh-package-pinner", ["hook-dsh-package-pinner", "hook-dsh-package-pinner"]],
	["@playform/hook-dsh-cargo-governor", ["hook-dsh-cargo-governor", "hook-dsh-cargo-governor"]],
	["@playform/hook-dsh-normalize-dash", ["hook-dsh-normalize-dash", "hook-dsh-normalize-dash"]],
	[
		"@playform/hook-dsh-normalize-quotes",
		["hook-dsh-normalize-quotes", "hook-dsh-normalize-quotes"],
	],
	[
		"@playform/hook-dsh-normalize-ellipsis",
		["hook-dsh-normalize-ellipsis", "hook-dsh-normalize-ellipsis"],
	],
	[
		"@playform/hook-dsh-normalize-spaces",
		["hook-dsh-normalize-spaces", "hook-dsh-normalize-spaces"],
	],
	[
		"@playform/hook-dsh-normalize-invisible",
		["hook-dsh-normalize-invisible", "hook-dsh-normalize-invisible"],
	],
	[
		"@playform/hook-dsh-normalize-fullwidth",
		["hook-dsh-normalize-fullwidth", "hook-dsh-normalize-fullwidth"],
	],
	["@playform/hook-dsh-normalize-file", ["hook-dsh-normalize-file", "hook-dsh-normalize-file"]],
];

const Sh = (Command, Args, Options = {}) => {
	const Result = ChildProcess.spawnSync(Command, Args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
		...Options,
	});
	return {
		status: Result.status,
		stdout: Result.stdout ?? "",
		stderr: Result.stderr ?? "",
	};
};

const Pnpm = (Args, Options = {}) => Sh("pnpm", Args, Options);

const ResolveDirs = () => {
	const Available = FileSystem.readdirSync(PackagesDir(), { withFileTypes: true })
		.filter((Entry) => Entry.isDirectory())
		.map((Entry) => Entry.name);
	return Bundles.map(([Name, Candidates]) => {
		const Dir = Candidates.find((Candidate) => Available.includes(Candidate));
		if (!Dir)
			throw new Error(
				`wiring: no source directory for ${Name} (tried ${Candidates.join(", ")})`,
			);
		const Manifest = JSON.parse(
			FileSystem.readFileSync(Path.join(PackagesDir(), Dir, "package.json"), "utf8"),
		);
		return { Name, Dir, Manifest };
	});
};

// The six-flavor fixture and its per-flavor counts (the same fixtures the
// smokes use, promoted to on-disk files - the plan's §2.4-5).
export const SixFixture =
	"\u2014dash \u2013dash \u201cquotes\u201d \u2026ellipsis\u00a0space\u200bzwj\uff1bfull\n";
export const SixNormalized = '-dash -dash "quotes" ...ellipsis spacezwj;full\n';
export const SixCounts = { dash: 2, quote: 2, ellipsis: 1, space: 1, invisible: 1, fullwidth: 1 };
// One stream event per flavor: a-b(1 dash) " q"(2 quotes) ...(1) nbsp(1 space)
// ZWJ(1 invisible) ;(1 fullwidth).
export const StreamText = "a\u2014b \u201c q\u201d \u2026 \u00a0 \u200b \uff1b";
export const StreamCounts = {
	dash: 1,
	quote: 2,
	ellipsis: 1,
	space: 1,
	invisible: 1,
	fullwidth: 1,
};
export const StreamLedger = {
	"normalize-dash": "normalized 1 dash char(s) in one stream",
	quotes: "normalized 2 quote char(s) in one stream",
	ellipsis: "normalized 1 ellipsis char(s) in one stream",
	spaces: "normalized 1 space char(s) in one stream",
	invisible: "normalized 1 invisible char(s) in one stream",
	fullwidth: "normalized 1 fullwidth char(s) in one stream",
};

const ExerciseSource =
	() => `// The wiring-exercise driver: a scratch-only plugin (NEVER shipped, never in
// the user's real profiles) that exercises the family's REAL flows through
// the harness's own event loop after boot, writes a JSON results marker, and
// leaves the shutdown to the suite (SIGTERM - the bounded profile shutdown).
// The flows mirror the plan's §2.4; the mode selects which flows run, so the
// observation-policy-disabled normalize-file boot runs only that flow.
import { mkdirSync, writeFileSync } from "node:fs";

const Delay = Number(process.env.DSH_WIRING_DELAY_MS || "4000");

export const name = "dsh-wiring-exercise";

export const inject = ["pluginFactory", "fs", "tools"];

export default { name, inject, apply: Apply };

function Apply(ctx) {
	setTimeout(() => {
		Run(ctx)
			.then((Results) => {
				writeFileSync(Marker(), JSON.stringify(Results, null, "\\t") + "\\n");
			})
			.catch((Cause) => {
				try {
					writeFileSync(
						Marker(),
						JSON.stringify({ fatal: String((Cause && Cause.stack) || Cause) }, null, "\\t") + "\\n",
					);
				} catch {}
				process.exit(1);
			});
	}, Delay);
}

const Marker = () => process.env.DSH_WIRING_DONE || "/tmp/dsh-wiring-exercise-done.json";

async function Run(ctx) {
	const Mode = process.env.DSH_WIRING_MODE || "main";
	const Tools = ctx.get("tools");
	const Root = ctx.root || ctx;
	const Signal = new AbortController().signal;
	const Call = (name, args) =>
		Tools.execute({ name: name, arguments: args, callId: "wiring-" + name, signal: Signal });
	const Results = { mode: Mode, steps: [] };
	const Step = async (name, fn) => {
		try {
			Results.steps.push({ name: name, ok: true, value: await fn() });
		} catch (Cause) {
			Results.steps.push({
				name: name,
				ok: false,
				error: String((Cause && Cause.message) || Cause),
				stack: String((Cause && Cause.stack) || Cause),
			});
		}
	};

	const Paths = JSON.parse(process.env.DSH_WIRING_PATHS || "{}");

	if (Mode === "normalize-file") {
		// The seed is created THROUGH the tool path (a plain-fs write is
		// unobserved and the fs guard refuses the overwrite); with the
		// observation policy disabled the normalize-file update then proceeds.
		await Step("normalize-file-seed", () =>
			Call("raw-write", { file_path: Paths.normalizeFileTarget, content: Paths.sixFixture }),
		);
		await Step("normalize-file", () =>
			Call("normalize-file", { file_path: Paths.normalizeFileTarget }),
		);
		return Results;
	}

	// 1 - the EVENT-PATH governed write: the factory's ONE shared write
	// executor (the built-in write's exact pipeline - resolve, the
	// fs/write-intent waterfall, writeText, the root fs/observed emit) with a
	// plain mutating actor. The governor's and the pinner's Wire registrations
	// hear it; with every dependency chain-governed the pass is governed and
	// the update stage stays off (no registry/network traffic).
	await Step("probe-event-write", async () => {
		mkdirSync(Paths.probeDir, { recursive: true });
		const State = ctx.pluginFactory.State(ctx, { log: false, logFile: "/dev/null" }, {
			module: "wiring-probe",
		});
		const Target = await ctx.fs.resolve(Paths.probeTarget);
		const Outcome = await ctx.pluginFactory.Write(State, Target, Paths.probeContent, {
			actor: { name: "write" },
		});
		return { version: (Outcome && Outcome.version) || null };
	});

	// 2 - the raw-write tool with the escape hatch: govern ABSENT, so the
	// wrapped actor's govern marker (false) routes this write's governance to
	// the direct path ONLY - the event path stays silent BY DESIGN.
	await Step("raw-write-manifest", () =>
		Call("raw-write", { file_path: Paths.packageJson, content: Paths.packageJsonContent }),
	);

	// 3 - the raw-write tool with normalize: the six-transform Rewrite chain.
	await Step("raw-write-normalize", () =>
		Call("raw-write", { file_path: Paths.normalizeFixture, content: Paths.sixFixture, normalize: true }),
	);

	// 4 - the llm/stream waterfall AT THE ROOT: every flavor's listener hears
	// it and logs its "normalized N ... char(s) in one stream" line.
	await Step("stream", async () => {
		const Stream = async function* () {
			yield { type: "text-delta", index: 0, text: Paths.streamText };
		};
		const Wrapped = await Root.waterfall("llm/stream", {}, Stream);
		let Count = 0;
		for await (const Chunk of Wrapped) Count += 1;
		return { chunks: Count };
	});

	// 5 - the cargo direct fold (chain canonicalization) and the refusal
	// attempt (a planned entry the raw text cannot locate - the dotted key).
	await Step("cargo-govern", () =>
		Call("raw-write", { file_path: Paths.cargoToml, content: Paths.cargoContent, govern: true }),
	);
	await Step("cargo-refusal-dotted", () =>
		Call("raw-write", { file_path: Paths.cargoRefusal, content: Paths.cargoRefusalContent, govern: true }),
	);
	await Step("cargo-refusal-pretty", () =>
		Call("raw-write", { file_path: Paths.cargoRefusal2, content: Paths.cargoRefusal2Content, govern: true }),
	);

	return Results;
}
`;

const ExerciseManifest = () =>
	JSON.stringify(
		{
			name: "@local/dsh-wiring-exercise",
			version: "0.0.1",
			private: true,
			type: "module",
			main: "./Target/Library.js",
			exports: { ".": "./Target/Library.js" },
		},
		null,
		"\t",
	) + "\n";

const ProfileManifest = (Deps) =>
	JSON.stringify(
		{
			name: "dsh-profile-dsh-test",
			private: true,
			dsh: {
				profile: {
					// The bundle list mirrors the live desktop profile: the core
					// package is a dependency only - it declares no dsh.bundle,
					// so listing it as a bundle makes the loader fail loud.
					bundles: [
						"@deepseek-ai/dsh-base",
						"@deepseek-ai/dsh-web-app",
						...Bundles.filter(([Name]) => Name !== "@playform/hook-dsh-core").map(
							([Name]) => Name,
						),
					],
				},
			},
			dependencies: Deps,
		},
		null,
		"\t",
	) + "\n";

const ProfilePatch = () =>
	`# The scratch profile's user layer: minimal, no personal config, no LLM
# provider - the flows under test need no model round-trip (plan §4).
[]
`;

// pnpm 11 reads its settings from pnpm-workspace.yaml (the package.json
// "pnpm" field is ignored); YAML forbids tab indentation, hence the spaces.
const WorkspaceSettings = (Overrides) =>
	[
		"packages:",
		"  - .",
		"nodeLinker: hoisted",
		"autoInstallPeers: false",
		"overrides:",
		...Object.entries(Overrides).map(([Key, Value]) => `  "${Key}": "${Value}"`),
		"",
	].join("\n");

const Overlay = (Home) =>
	`# The wiring overlay: the exercise driver + every family module's config
# with the logFile pointed into the scratch home (the "~" bundle-layer
# default does not resolve under a redirected DSH_HOME - the silent-catch
# ledger gap this battery documents) and the cargo bin pointed at a fake
# shim so the cargo update stage never touches a real toolchain. Each bare
# id: row REPLACES the composed entry config wholesale.
- insert:
    - id: dsh-wiring-exercise
      name: "@local/dsh-wiring-exercise"
- id: hook-dsh-package-governor
  config:
    log: true
    logFile: ${Home}/ledgers/governor.log
    updateCooldownMs: 3000
    strict: false
    mutationTools: [write, edit, str_replace_editor, raw-write]
    updateMode: programmatic
    policyFile: ""
    exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
- id: hook-dsh-package-pinner
  config:
    log: true
    logFile: ${Home}/ledgers/pinner.log
    mutationTools: [write, edit, str_replace_editor, raw-write]
    policyFile: ""
    sections: [dependencies, devDependencies, peerDependencies, optionalDependencies]
    exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
- id: hook-dsh-cargo-governor
  config:
    log: true
    logFile: ${Home}/ledgers/cargo-governor.log
    updateCooldownMs: 3000
    strict: false
    mutationTools: [write, edit, str_replace_editor, raw-write]
    cargoBin: ${Home}/fake-cargo
    updateMode: cargo
    policyFile: ""
    keepFile: ""
    exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
- id: hook-dsh-normalize-dash
  config:
    log: true
    logFile: ${Home}/ledgers/normalize-dash.log
    replacement: "-"
    normalizeReasoning: true
    normalizeToolArguments: true
- id: hook-dsh-normalize-quotes
  config:
    log: true
    logFile: ${Home}/ledgers/quotes.log
    normalizeReasoning: true
    normalizeToolArguments: true
- id: hook-dsh-normalize-ellipsis
  config:
    log: true
    logFile: ${Home}/ledgers/ellipsis.log
    replacement: "..."
    normalizeReasoning: true
    normalizeToolArguments: true
- id: hook-dsh-normalize-spaces
  config:
    log: true
    logFile: ${Home}/ledgers/spaces.log
    replacement: " "
    normalizeReasoning: true
    normalizeToolArguments: true
- id: hook-dsh-normalize-invisible
  config:
    log: true
    logFile: ${Home}/ledgers/invisible.log
    replacement: ""
    normalizeReasoning: true
    normalizeToolArguments: true
- id: hook-dsh-normalize-fullwidth
  config:
    log: true
    logFile: ${Home}/ledgers/fullwidth.log
    normalizeReasoning: true
    normalizeToolArguments: true
- id: hook-dsh-normalize-file
  config:
    log: true
    logFile: ${Home}/ledgers/normalize-file.log
    replacement: "-"
`;

const Registry = (Entries) =>
	JSON.stringify(
		{
			protoOrdinate: "@local/scratch-author",
			providers: ["@local/scratch-author"],
			chain: [],
			effectiveLatest: Entries,
			fallback: "ncu",
		},
		null,
		"\t",
	) + "\n";

const ProbeManifest = (LodashPin) =>
	'{\n  "name": "@local/scratch-probe",\n  "version": "0.1.0",\n  "dependencies": {\n    "lodash": "' +
	LodashPin +
	'"\n  }\n}\n';

const ChainManifest = () =>
	'{\n  "name": "@local/scratch-chain",\n  "version": "0.1.0",\n  "dependencies": {\n    "lodash": "1.0.0"\n  }\n}\n';

const CreateScratch = (Home) => {
	const Tarballs = Path.join(Home, "tarballs");
	const Profile = Path.join(Home, "profiles", "dsh-test");
	const Ledgers = Path.join(Home, "ledgers");
	FileSystem.mkdirSync(Tarballs, { recursive: true });
	FileSystem.mkdirSync(Profile, { recursive: true });
	FileSystem.mkdirSync(Ledgers, { recursive: true });

	// 1 - pack (Method 1: publish-identical tarballs, NO symlinks).
	const Sources = ResolveDirs();
	const TarballByPackage = {};
	for (const { Name, Dir } of Sources) {
		const Short = Name.split("/")[1];
		const Packed = Pnpm(["pack", "--pack-destination", Tarballs], {
			cwd: Path.join(PackagesDir(), Dir),
		});
		if (Packed.status !== 0) {
			throw new Error(`wiring: pnpm pack failed for ${Name}: ${Packed.stderr.trim()}`);
		}
		const Match = FileSystem.readdirSync(Tarballs)
			.filter((Entry) => Entry.startsWith(`playform-${Short}-`) && Entry.endsWith(".tgz"))
			.sort();
		if (Match.length === 0) {
			throw new Error(`wiring: no tarball produced for ${Name}`);
		}
		TarballByPackage[Name] = Path.join(Tarballs, Match.at(-1));
	}

	// 2 - the profile skeleton (§2.3): bundle list mirroring the live desktop
	// profile, the empty root, the minimal user layer, file: tarball deps,
	// and the exercise driver as a file: directory dependency (copied, never
	// linked).
	const Deps = {};
	for (const [Name] of Bundles) {
		Deps[Name] = "file:../../tarballs/" + Path.basename(TarballByPackage[Name]);
	}
	Deps["@local/dsh-wiring-exercise"] = "file:../../exercise";
	FileSystem.writeFileSync(Path.join(Profile, "package.json"), ProfileManifest(Deps));
	FileSystem.writeFileSync(Path.join(Profile, "cordis.yml"), "[]\n");
	FileSystem.writeFileSync(Path.join(Profile, "cordis.patch.yml"), ProfilePatch());
	FileSystem.writeFileSync(
		Path.join(Profile, "pnpm-workspace.yaml"),
		WorkspaceSettings({
			"@playform/hook-dsh-core":
				"file:../../tarballs/" + Path.basename(TarballByPackage["@playform/hook-dsh-core"]),
			"@playform/dsh-plugin-factory":
				"file:../../tarballs/" +
				Path.basename(TarballByPackage["@playform/dsh-plugin-factory"]),
		}),
	);

	// 3 - the exercise driver package (scratch-only) and the fake cargo shim.
	const Exercise = Path.join(Home, "exercise");
	FileSystem.mkdirSync(Path.join(Exercise, "Target"), { recursive: true });
	FileSystem.writeFileSync(Path.join(Exercise, "package.json"), ExerciseManifest());
	FileSystem.writeFileSync(Path.join(Exercise, "Target", "Library.js"), ExerciseSource());
	const FakeCargo = Path.join(Home, "fake-cargo");
	FileSystem.writeFileSync(FakeCargo, "#!/bin/sh\nexit 0\n", { mode: 0o755 });

	// 4 - the wiring overlays (main + the observation-policy-disabled
	// normalize-file boot).
	FileSystem.writeFileSync(Path.join(Home, "overlay.yml"), Overlay(Home));
	FileSystem.writeFileSync(
		Path.join(Home, "overlay-nf.yml"),
		Overlay(Home) + "- id: fs-observation-policy\n  disabled: true\n",
	);

	// 5 - install (file: copies - the no-symlink invariant is §2.2's).
	const Installed = Pnpm(["install"], { cwd: Profile });
	if (Installed.status !== 0) {
		throw new Error(
			`wiring: pnpm install failed in the scratch profile:\n${Installed.stderr}\n${Installed.stdout.slice(-2000)}`,
		);
	}

	// 6 - the exercise workspaces and their registries.
	const Work = Path.join(Home, "exercise-work");
	for (const Dir of ["chain", "refusal", "refusal2", "probe"]) {
		FileSystem.mkdirSync(Path.join(Work, Dir), { recursive: true });
	}
	FileSystem.writeFileSync(
		Path.join(Work, "chain", "registry.json"),
		Registry({ lodash: "1.2.3", serde: "1.2.3" }),
	);
	FileSystem.writeFileSync(
		Path.join(Work, "probe", "registry.json"),
		Registry({ lodash: "4.2.0" }),
	);

	return { Home, Profile, Tarballs, Ledgers, Work };
};

/** The scratch paths, creating the scratch on first use. `null` = skip. */
export const EnsureScratch = async () => {
	const Home = ScratchHome();
	if (!Home) return null;
	const Marker = Path.join(Home, ".wiring-ready.json");
	FileSystem.mkdirSync(Home, { recursive: true });
	if (!FileSystem.existsSync(Marker)) {
		const Preexisting = FileSystem.readdirSync(Home).length > 0;
		try {
			const Created = CreateScratch(Home);
			FileSystem.writeFileSync(
				Marker,
				JSON.stringify({ home: Home, ready: true }, null, "\t") + "\n",
			);
			return Created;
		} catch (Cause) {
			// A failed creation leaves no partial scratch behind (a retry
			// starts clean). Never delete a home the caller pointed at that
			// already carried content.
			if (!Preexisting) FileSystem.rmSync(Home, { recursive: true, force: true });
			throw Cause;
		}
	}
	return {
		Home,
		Profile: Path.join(Home, "profiles", "dsh-test"),
		Tarballs: Path.join(Home, "tarballs"),
		Ledgers: Path.join(Home, "ledgers"),
		Work: Path.join(Home, "exercise-work"),
	};
};

const PathsFor = (Scratch, Mode) => {
	const Work = Mode === "normalize-file" ? Path.join(Scratch.Home, "nf-work") : Scratch.Work;
	if (Mode === "normalize-file") {
		FileSystem.mkdirSync(Work, { recursive: true });
		return {
			work: Work,
			normalizeFileTarget: Path.join(Work, "normalize-file-target.md"),
			sixFixture: SixFixture,
		};
	}
	return {
		work: Work,
		probeDir: Path.join(Work, "probe"),
		probeTarget: Path.join(Work, "probe", "package.json"),
		probeContent: ProbeManifest("3.0.0"),
		packageJson: Path.join(Work, "chain", "package.json"),
		packageJsonContent: ChainManifest(),
		normalizeFixture: Path.join(Work, "normalized-fixture.md"),
		sixFixture: SixFixture,
		streamText: StreamText,
		cargoToml: Path.join(Work, "chain", "Cargo.toml"),
		cargoContent: '[dependencies]\nserde = "1.0"\n',
		cargoRefusal: Path.join(Work, "refusal", "Cargo.toml"),
		cargoRefusalContent: '[dependencies]\nleftover.version = "1.0"\n',
		cargoRefusal2: Path.join(Work, "refusal2", "Cargo.toml"),
		cargoRefusal2Content: '[dependencies]\nserde = { version = "1.0" }\nleftover = "2.0"\n',
	};
};

const Boot = async (Scratch, Overlay, Mode) => {
	const Paths = PathsFor(Scratch, Mode);
	const Done = Path.join(Paths.work, "done.json");
	const BootOut = Path.join(Paths.work, "boot.out");
	FileSystem.rmSync(Done, { force: true });
	const Child = ChildProcess.spawn(
		"dsh",
		["--profile", "dsh-test", "--patch", Overlay, "--no-open"],
		{
			cwd: Scratch.Home,
			env: {
				...process.env,
				DSH_HOME: Scratch.Home,
				DSH_WIRING_DONE: Done,
				DSH_WIRING_PATHS: JSON.stringify(Paths),
				DSH_WIRING_MODE: Mode,
				DSH_WIRING_DELAY_MS: "4000",
			},
			stdio: ["ignore", "pipe", "pipe"],
		},
	);
	let Output = "";
	Child.stdout.on("data", (Chunk) => {
		Output += Chunk;
	});
	Child.stderr.on("data", (Chunk) => {
		Output += Chunk;
	});
	const Deadline = Date.now() + 150_000;
	while (!FileSystem.existsSync(Done) && Date.now() < Deadline) {
		await delay(500);
	}
	const Appeared = FileSystem.existsSync(Done);
	Child.kill("SIGTERM");
	const Exited = await Promise.race([
		new Promise((resolve) => Child.on("close", resolve)),
		delay(15_000).then(() => {
			Child.kill("SIGKILL");
			return "killed";
		}),
	]);
	FileSystem.writeFileSync(BootOut, Output);
	if (!Appeared) {
		throw new Error(
			`wiring: the ${Mode} exercise boot produced no results marker (exit ${JSON.stringify(Exited)}):\n${Output.slice(-2000)}`,
		);
	}
	const Results = JSON.parse(FileSystem.readFileSync(Done, "utf8"));
	if (Results.fatal) throw new Error(`wiring: the ${Mode} exercise crashed:\n${Results.fatal}`);
	return { Paths, Results, BootOut };
};

const Cache = new Map();

/** The main exercise boot (cached per scratch). */
export const Exercise = async () => {
	const Scratch = await EnsureScratch();
	if (!Scratch) return null;
	const Key = `${Scratch.Home}:exercise`;
	if (!Cache.has(Key))
		Cache.set(Key, Boot(Scratch, Path.join(Scratch.Home, "overlay.yml"), "main"));
	return Cache.get(Key);
};

/** The observation-policy-disabled normalize-file boot (cached per scratch). */
export const NormalizeFileBoot = async () => {
	const Scratch = await EnsureScratch();
	if (!Scratch) return null;
	const Key = `${Scratch.Home}:normalize-file`;
	if (!Cache.has(Key)) {
		Cache.set(Key, Boot(Scratch, Path.join(Scratch.Home, "overlay-nf.yml"), "normalize-file"));
	}
	return Cache.get(Key);
};

/** `dsh --profile dsh-test --dump-config` (cached per variant). */
export const DumpConfig = async (Variant = "plain", OverlayPath = "") => {
	const Scratch = await EnsureScratch();
	if (!Scratch) return null;
	const Key = `${Scratch.Home}:dump:${Variant}`;
	if (!Cache.has(Key)) {
		const Args = ["--profile", "dsh-test", "--dump-config"];
		if (OverlayPath) Args.push("--patch", OverlayPath);
		const Result = Sh("dsh", Args, {
			cwd: Scratch.Home,
			env: { ...process.env, DSH_HOME: Scratch.Home },
		});
		if (Result.status !== 0) {
			throw new Error(`wiring: dump-config (${Variant}) failed:\n${Result.stderr}`);
		}
		Cache.set(Key, Result.stdout);
	}
	return Cache.get(Key);
};

/** `dsh --profile dsh-test --dump-config-schema`. */
export const DumpSchema = async () => {
	const Scratch = await EnsureScratch();
	if (!Scratch) return null;
	const Key = `${Scratch.Home}:schema`;
	if (!Cache.has(Key)) {
		const Result = Sh("dsh", ["--profile", "dsh-test", "--dump-config-schema"], {
			cwd: Scratch.Home,
			env: { ...process.env, DSH_HOME: Scratch.Home },
		});
		// The CLI exits non-zero on unrelated web-app entry validation
		// warnings even though the schema document is complete on stdout -
		// a live finding the battery records; the document is what matters.
		Cache.set(Key, Result.stdout);
	}
	return Cache.get(Key);
};

/** `dsh plugin --profile dsh-test why <pkg>` (the plugin-manager surface). */
export const PluginWhy = async (Pkg) => {
	const Scratch = await EnsureScratch();
	if (!Scratch) return null;
	const Result = Sh("dsh", ["plugin", "--profile", "dsh-test", "why", Pkg], {
		cwd: Scratch.Home,
		env: { ...process.env, DSH_HOME: Scratch.Home },
	});
	return { status: Result.status, stdout: Result.stdout, stderr: Result.stderr };
};

/** The raw bytes of one file inside a packed tarball (publish-identical proof). */
export const TarballFile = (Tarball, Entry) => {
	const Result = Sh("tar", ["-xOzf", Tarball, Entry]);
	if (Result.status !== 0)
		throw new Error(`wiring: tar -xOzf failed for ${Entry}: ${Result.stderr}`);
	return Result.stdout;
};

/** The no-symlink invariant (§2.2): real directories outside pnpm's own layout. */
export const SymlinksOutsideStore = (Home) => {
	const Result = Sh("find", [Home, "-type", "l"]);
	return Result.stdout
		.split("\n")
		.filter(
			(Line) =>
				Line && !Line.includes("node_modules/.pnpm") && !Line.includes("node_modules/.bin"),
		);
};

export { delay };
