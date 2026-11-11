import FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

import Knobs_ from "../../Target/Function/Knobs.js";
import { Expand } from "../../Target/Function/Write.js";
import type Agent from "../../Target/Interface/Agent.js";
import type Configuration from "../../Target/Interface/Configuration.js";
import type { Corpus } from "../../Target/Interface/Corpus.js";
import type Message from "../../Target/Interface/Message.js";
import type { ContentBlock } from "../../Target/Interface/Message.js";
import type UsageRecord from "../../Target/Interface/Record.js";
import type {
	FsEditOutcome,
	FsEditRequest,
	FsInfo,
	FsSlice,
	FsTarget,
	FsWriteIntent,
	FsWriteOutcome,
	LLMSlice,
	LoggerSlice,
	SkillsSlice,
	StreamFrame,
	StreamRequest,
} from "../../Target/Interface/Services.js";
import type { LoadedSkill, SkillRow } from "../../Target/Interface/Skill.js";

/**
 * @module Harness
 *
 * The shared harness for the skill-learn smokes: the fake context (fs, skills,
 * llm, logger, workingDirectory) and the counter every folder imports.
 *
 * @remarks
 *
 * WHY THERE IS NO SERVICE HERE: `Source/Library.ts` is written by a parallel
 * lane, and every folder in this suite asserts a LEAF, so the harness stops at
 * the seams that service will be handed. The sibling package's harness
 * constructs its service
 * (`Classic/packages/plugin-dsh-lesson-review/Source/Test/Harness.ts:32-38`);
 * this one exports the same helper names (`Make`, `FakeLLM`, `Seed`, `Exists`,
 * `Read`, `Messages`, `Check`, `CheckAsync`, `Finish`, `MakeCounter`, `Home`,
 * `Settle`) so a reader of both packages sees one pattern, and adds the fakes a
 * leaf needs (`FakeFs`, `FakeSkills`, `FakeAgent`, `FakeLogger`, `CorpusView`).
 *
 * THE HOME REDIRECT: every knob is a `~/.dsh/...` path, so the harness points
 * $HOME at a fresh OS temp directory BEFORE any leaf expands a path. The
 * plugin's own bookkeeping (the ledger, the blobs, the usage store, the
 * snapshots) then lands under that temp home through `node:fs`, exactly as it
 * does live, and the user's real home is never touched.
 *
 * THE FAKE FS IS A REAL FENCE, NOT A RECORDER. `createIfAbsent` refuses an
 * existing path, `replaceIfVersion` refuses an absent or moved one, and
 * `editText` checks the version BEFORE it matches and refuses a non-unique
 * anchor - the harness's own contract (`dsh-fs/lib/types/types.d.ts:105-116`,
 * `:162`). Every call is recorded with the intent and the version it carried, so
 * a folder can assert the fence AS DATA - which intent was passed, which version
 * was passed, whether a write was attempted at all - without re-implementing the
 * rule it checks.
 *
 * THE CORPUS IS THE FAKE FS, THE BOOKKEEPING IS THE REAL DISK. `Seed` puts a
 * `SKILL.md` in the fake tree, because every corpus read in this package goes
 * through `ctx.fs`; the usage store, the ledger, the blobs and the snapshots are
 * the plugin's own files and are written with `node:fs`, so their folders assert
 * against the temp home the way the live plugin would.
 */
/**
 * The fresh temp home: every `~/.dsh/...` path resolves inside it.
 */
export const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "skill-learn-smoke-"));
process.env["HOME"] = Home;

/**
 * The per-folder counter.
 */
export type Counter = { N: number; F: number };

export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/**
 * One check = the source suite's ok group. The callback carries that group's
 * assertions VERBATIM; a throw inside counts the whole group failed.
 */
export const Check = (Count: Counter, Label: string, Assertions: () => void): void => {
	Count.N++;
	try {
		Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/**
 * The async variant of Check, for folders whose assertions await.
 */
export const CheckAsync = async (
	Count: Counter,
	Label: string,
	Assertions: () => Promise<void>,
): Promise<void> => {
	Count.N++;
	try {
		await Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/**
 * End-of-folder guard and the runner's one printed line. A failed check prints
 * the throw and exits non-zero, so no `N PASS - <Name>` line is ever printed
 * for a folder that did not pass; a green folder prints exactly one line, which
 * the aggregate compares against its README count
 * (`Maintain/Common/Function/Expected.mjs:1-27`).
 *
 * The sibling prints the line in each `Test.ts` after `Finish` returns the
 * count. The print lives here instead so a folder cannot print a number that
 * differs from the counter it just finished.
 */
export const Finish = (Count: Counter, Name: string): number => {
	switch (true) {
		case Count.F !== 0:
			throw new Error(`${Name}: ${Count.F} failed check(s)`);
		default:
			break;
	}
	console.log(`${Count.N} PASS - ${Name}`);
	return Count.N;
};

/**
 * Flush a detached promise chain (the usage-store load and the write chain).
 */
export const Settle = async (): Promise<void> => {
	for (let Index = 0; Index < 4; Index++) {
		await new Promise<void>((Resolve) => setImmediate(Resolve));
	}
};

/**
 * The absolute spelling of a path: a relative one is taken from `<Home>/.dsh`.
 */
const Absolute = (Given: string): string => (Path.isAbsolute(Given) ? Given : Path.join(Home, ".dsh", Given));

/**
 * Whether a real file exists under the temp home (the bookkeeping assertions).
 */
export const Exists = (Given: string): boolean => FileSystem.existsSync(Absolute(Given));

/**
 * Read a real file under the temp home (the bookkeeping assertions).
 */
export const Read = (Given: string): string => FileSystem.readFileSync(Absolute(Given), "utf8");

/**
 * The resolved knob set: the REAL `Function/Knobs` reader, so a folder never
 * restates a default. The reader applies the section 9 defaults to a bare
 * construction and unwraps a volatile cell, which is exactly what the service
 * hands a leaf.
 */
export const Knobs = (Overrides: Record<string, unknown> = {}): Configuration => Knobs_(Overrides);

/**
 * The six state paths of one scenario, so no two checks share a ledger or a store.
 */
export interface StatePaths {
	readonly storagePath: string;
	readonly statePath: string;
	readonly ledgerPath: string;
	readonly blobRoot: string;
	readonly snapshotRoot: string;
	readonly reportsRoot: string;
}

/**
 * A fresh state root under the temp home, named by the scenario's tag.
 */
export const State = (Tag: string): StatePaths => {
	const Root = Path.join(Home, ".dsh", "skill-learn", Tag);
	return {
		storagePath: Path.join(Root, "usage.json"),
		statePath: Path.join(Root, "state.json"),
		ledgerPath: Path.join(Root, "ledger.jsonl"),
		blobRoot: Path.join(Root, "blobs"),
		snapshotRoot: Path.join(Root, "snapshots"),
		reportsRoot: Path.join(Root, "reports"),
	};
};

/**
 * One recorded filesystem call: the method, the path, and every intent it carried.
 */
export interface FsCall {
	readonly method: "resolve" | "stat" | "readText" | "listDir" | "writeText" | "editText" | "contains";
	readonly path: string;

	/**
	 * The intent kind a write carried, `edit` for an edit, and `""` for a read.
	 */
	readonly intent: string;

	/**
	 * The version a guarded write or an edit carried, or null.
	 */
	readonly version: string | null;

	/**
	 * The edit's `replaceAll`, or null for every other call.
	 */
	readonly replaceAll: boolean | null;

	/**
	 * The edit's anchor, or null for every other call.
	 */
	readonly oldString: string | null;
}

/**
 * The programmable parts of the fake filesystem.
 */
export interface FakeFsOptions {
	/**
	 * The files the tree starts with, keyed by absolute path.
	 */
	readonly files?: Record<string, string>;

	/**
	 * Bump every file's version right after a `stat` returns: the concurrent-writer shape.
	 */
	readonly bumpAfterStat?: boolean;

	/**
	 * The code the NEXT `writeText` throws, for the failed-write arm.
	 */
	readonly failWrite?: string;

	/**
	 * The code the NEXT `editText` throws, for the failed-edit arm.
	 */
	readonly failEdit?: string;
}

/**
 * The fake filesystem: the harness seam, its recorded calls, and the setup probes.
 */
export interface FakeFs extends FsSlice {
	/**
	 * Every call recorded so far, in order.
	 */
	readonly Calls: FsCall[];

	/**
	 * Put a file in the tree WITHOUT recording a call: scenario setup is not behaviour.
	 */
	Put(Path_: string, Text_: string): void;

	/**
	 * A file's text, or null when it is absent.
	 */
	Text(Path_: string): string | null;

	/**
	 * A file's version, or null when it is absent.
	 */
	Version(Path_: string): string | null;

	/**
	 * The recorded calls of one method.
	 */
	Of(Method: FsCall["method"]): readonly FsCall[];

	/**
	 * Forget the recorded calls, so a probe after the setup sees only the behaviour.
	 */
	Clear(): void;
}

/**
 * A harness failure carrying the typed code the fence reports.
 */
const Fail = (Code: string): Error => Object.assign(new Error(Code), { code: Code });

/**
 * One direct child of a listed directory, as the fake reports it.
 */
interface FakeEntry {
	readonly name: string;
	readonly type: "file" | "directory" | "other";
	readonly target: FsTarget;
}

/**
 * The fake filesystem. It enforces the two guarded intents and the literal
 * edit, because those are the harness's own rules and a fake that accepted
 * anything would make the fence untestable.
 */
export const FakeFs = (Options: FakeFsOptions = {}): FakeFs => {
	const Files = new Map<string, { readonly Text: string; readonly Version: string }>();
	const Calls: FsCall[] = [];
	let Sequence = 0;
	let FailWrite = Options.failWrite;
	let FailEdit = Options.failEdit;
	const Key = (Given: string): string => Path.resolve(Given);
	const Next = (): string => {
		Sequence += 1;
		return `v${Sequence}`;
	};
	const Log = (
		Method: FsCall["method"],
		Path_: string,
		Intent = "",
		Version: string | null = null,
		ReplaceAll: boolean | null = null,
		Old: string | null = null,
	): void => {
		Calls.push({ method: Method, path: Path_, intent: Intent, version: Version, replaceAll: ReplaceAll, oldString: Old });
	};
	const Fs_: FakeFs = {
		Calls,
		Put: (Path_: string, Text_: string): void => {
			Files.set(Key(Path_), { Text: Text_, Version: Next() });
		},
		Text: (Path_: string): string | null => Files.get(Key(Path_))?.Text ?? null,
		Version: (Path_: string): string | null => Files.get(Key(Path_))?.Version ?? null,
		Of: (Method: FsCall["method"]): readonly FsCall[] => Calls.filter((Call) => Call.method === Method),
		Clear: (): void => {
			Calls.length = 0;
		},
		resolve: async (Given: string): Promise<FsTarget> => {
			const Key_ = Key(Given);
			Log("resolve", Key_);
			return { targetKey: Key_, displayPath: Key_ };
		},
		stat: async (Target: FsTarget): Promise<FsInfo | undefined> => {
			const Key_ = Key(Target.displayPath);
			Log("stat", Key_);
			const Found = Files.get(Key_);
			if (Found !== undefined) {
				const Answer: FsInfo = { version: Found.Version, type: "file" };
				// The bump lands AFTER the answer is read, so the caller holds the old token.
				if (Options.bumpAfterStat === true) {
					Files.set(Key_, { Text: Found.Text, Version: Next() });
				}
				return Answer;
			}
			const Prefix = `${Key_}${Path.sep}`;
			for (const Absolute_ of Files.keys()) {
				if (Absolute_.startsWith(Prefix)) {
					return { version: "directory", type: "directory" };
				}
			}
			return undefined;
		},
		readText: async (Target: FsTarget): Promise<string> => {
			const Key_ = Key(Target.displayPath);
			Log("readText", Key_);
			const Found = Files.get(Key_);
			if (Found === undefined) {
				throw Fail("FS_NOT_OBSERVED");
			}
			return Found.Text;
		},
		listDir: async (Target: FsTarget): Promise<readonly FakeEntry[]> => {
			const Key_ = Key(Target.displayPath);
			Log("listDir", Key_);
			const Prefix = `${Key_}${Path.sep}`;
			const Names = new Map<string, "file" | "directory">();
			for (const Absolute_ of Files.keys()) {
				if (!Absolute_.startsWith(Prefix)) continue;
				const Parts = Absolute_.slice(Prefix.length).split(Path.sep);
				const Name = Parts[0] ?? "";
				if (Name === "") continue;
				Names.set(Name, Parts.length === 1 ? "file" : "directory");
			}
			if (Names.size === 0) {
				throw Fail("FS_NOT_OBSERVED");
			}
			return [...Names.entries()].map(([Name, Type]) => {
				const Child = Path.join(Key_, Name);
				return { name: Name, type: Type, target: { targetKey: Child, displayPath: Child } };
			});
		},
		writeText: async (Target: FsTarget, Content: string, Intent?: FsWriteIntent): Promise<FsWriteOutcome> => {
			const Key_ = Key(Target.displayPath);
			const Kind = Intent === undefined ? "none" : Intent.kind;
			const Token = Intent !== undefined && Intent.kind === "replaceIfVersion" ? Intent.version : null;
			Log("writeText", Key_, Kind, Token);
			if (FailWrite !== undefined) {
				const Code = FailWrite;
				FailWrite = undefined;
				throw Fail(Code);
			}
			const Found = Files.get(Key_);
			if (Kind === "createIfAbsent" && Found !== undefined) {
				throw Fail("FS_NOT_OBSERVED");
			}
			if (Kind === "replaceIfVersion") {
				if (Found === undefined) {
					throw Fail("FS_STALE_VERSION");
				}
				if (Token !== null && Found.Version !== Token) {
					throw Fail("FS_STALE_VERSION");
				}
			}
			const Before = Found?.Text ?? null;
			const Next_ = Next();
			Files.set(Key_, { Text: Content, Version: Next_ });
			return {
				operation: Before === null ? "create" : "update",
				version: Next_,
				before: Before,
				after: Content,
			};
		},
		editText: async (
			Target: FsTarget,
			Edit: FsEditRequest,
			Expected?: { readonly version: string },
		): Promise<FsEditOutcome> => {
			const Key_ = Key(Target.displayPath);
			const Token = Expected === undefined ? null : Expected.version;
			Log("editText", Key_, "edit", Token, Edit.replaceAll, Edit.oldString);
			if (FailEdit !== undefined) {
				const Code = FailEdit;
				FailEdit = undefined;
				throw Fail(Code);
			}
			const Found = Files.get(Key_);
			if (Found === undefined) {
				throw Fail("FS_NOT_OBSERVED");
			}
			// The version is checked BEFORE the match, the harness's own order.
			if (Token !== null && Found.Version !== Token) {
				throw Fail("FS_STALE_VERSION");
			}
			const Count = Edit.oldString === "" ? 0 : Found.Text.split(Edit.oldString).length - 1;
			if (Count === 0) {
				throw Fail("FS_EDIT_NOT_FOUND");
			}
			if (Count > 1 && !Edit.replaceAll) {
				throw Fail("FS_AMBIGUOUS_EDIT");
			}
			const After = Edit.replaceAll
				? Found.Text.split(Edit.oldString).join(Edit.newString)
				: Found.Text.replace(Edit.oldString, Edit.newString);
			const Next_ = Next();
			Files.set(Key_, { Text: After, Version: Next_ });
			return { version: Next_, before: Found.Text, after: After };
		},
		contains: (Parent: FsTarget, Child: FsTarget): boolean => {
			const Left = Key(Parent.displayPath);
			const Right = Key(Child.displayPath);
			Log("contains", Right);
			return Right === Left || Right.startsWith(`${Left}${Path.sep}`);
		},
		processPath: (Target: FsTarget): string => Key(Target.displayPath),
	};
	for (const [Path_, Text_] of Object.entries(Options.files ?? {})) {
		Fs_.Put(Path_, Text_);
	}
	return Fs_;
};

/**
 * The programmable parts of the fake catalog.
 */
export interface FakeSkillsOptions {
	/**
	 * The rows `list` returns, verbatim.
	 */
	readonly rows?: readonly SkillRow[];

	/**
	 * The skills `get` resolves, keyed by name; the body is the loaded content.
	 */
	readonly skills?: Record<string, string>;
}

/**
 * The fake catalog: the rows, the loaded bodies, and a call log.
 */
export interface FakeSkills extends SkillsSlice {
	/**
	 * One entry per call: `list`, `get:<name>`, or `invalidateCache`.
	 */
	readonly Calls: string[];

	/**
	 * Put a loaded skill in the catalog without recording a call.
	 */
	Put(Name: string, Content: string): void;
}

export const FakeSkills = (Options: FakeSkillsOptions = {}): FakeSkills => {
	const Rows: SkillRow[] = [...(Options.rows ?? [])];
	const Loaded = new Map<string, LoadedSkill>();
	const Calls: string[] = [];
	const Base = Expand(Knobs().skillsRoot);
	const Skills_: FakeSkills = {
		Calls,
		Put: (Name: string, Content: string): void => {
			Loaded.set(Name, {
				name: Name,
				description: "",
				content: Content,
				resourceBase: { path: Path.join(Base, Name) },
				path: Path.join(Base, Name, "SKILL.md"),
			});
		},
		list: async (): Promise<readonly SkillRow[]> => {
			Calls.push("list");
			return Rows;
		},
		get: async (Name: string): Promise<LoadedSkill | undefined> => {
			Calls.push(`get:${Name}`);
			return Loaded.get(Name);
		},
		invalidateCache: (): void => {
			Calls.push("invalidateCache");
		},
	};
	for (const [Name, Content] of Object.entries(Options.skills ?? {})) {
		Skills_.Put(Name, Content);
	}
	return Skills_;
};

/**
 * The programmable parts of the fake model.
 */
export interface FakeLLMOptions {
	/**
	 * Throw synchronously out of `stream`: the provider-exploded arm.
	 */
	readonly fail?: boolean;

	/**
	 * Yield no frame at all: the empty-reply arm.
	 */
	readonly silent?: boolean;

	/**
	 * Yield exactly these frames, so a folder can prove which arms are read.
	 */
	readonly frames?: readonly StreamFrame[];

	/**
	 * One reply per call, in order; the shipped reply answers any call past the list.
	 */
	readonly replies?: readonly string[];
}

/**
 * The fake model: the reply split across two `text-delta` frames, and every request recorded.
 */
export interface FakeLLM extends LLMSlice {
	readonly Calls: StreamRequest[];
}

export const FakeLLM = (Reply: string, Options: FakeLLMOptions = {}): FakeLLM => {
	const Calls: StreamRequest[] = [];
	const Split = (Text_: string): readonly StreamFrame[] => [
		{ type: "text-delta", text: Text_.slice(0, 12) },
		{ type: "text-delta", text: Text_.slice(12) },
	];
	return {
		Calls,
		stream: (Request: StreamRequest): AsyncIterable<StreamFrame> => {
			Calls.push(Request);
			if (Options.fail === true) {
				throw new Error("provider exploded");
			}
			const Frames =
				Options.frames ??
				(Options.silent === true
					? []
					: Split(Options.replies === undefined ? Reply : (Options.replies[Calls.length - 1] ?? Reply)));
			return (async function* () {
				for (const Frame of Frames) yield Frame;
			})();
		},
	};
};

/**
 * The fake logger: the service's ledger lines, once `Library.ts` is wired.
 */
export interface FakeLogger extends LoggerSlice {
	readonly Lines: string[];
	readonly Warns: string[];
	readonly Errors: string[];
	readonly Debugs: string[];
}

export const FakeLogger = (): FakeLogger => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Errors: string[] = [];
	const Debugs: string[] = [];
	return {
		Lines,
		Warns,
		Errors,
		Debugs,
		info: (Format: unknown): void => {
			Lines.push(String(Format));
		},
		warn: (Format: unknown): void => {
			Warns.push(String(Format));
		},
		error: (Format: unknown): void => {
			Errors.push(String(Format));
		},
		debug: (Format: unknown): void => {
			Debugs.push(String(Format));
		},
	};
};

/**
 * The recorded ledger lines without the neutral ` (logFile ...)` suffix.
 */
export const Messages = (Logger_: FakeLogger): string[] =>
	Logger_.Lines.map((Line) => Line.replace(/ \(logFile .*\)$/, ""));

/**
 * The programmable parts of the fake agent.
 */
export interface FakeAgentOptions {
	readonly id?: string;

	/**
	 * The route's provider; omitted together with `model` for the no-route agent.
	 */
	readonly provider?: string;
	readonly model?: string;
	readonly messages?: readonly Message[];

	/**
	 * Throw synchronously out of `runMaintenance`: the busy agent.
	 */
	readonly busy?: boolean;

	/**
	 * Throw out of `deriveMessages`: the disposed session.
	 */
	readonly deriveThrows?: boolean;
}

/**
 * The fake agent: the derived history, the route, and the maintenance claim.
 */
export interface FakeAgent extends Agent {
	/**
	 * One entry per claimed maintenance run, so a folder can prove the claim happened.
	 */
	readonly Claims: string[];
}

export const FakeAgent = (Options: FakeAgentOptions = {}): FakeAgent => {
	const Derived = Options.messages ?? [];
	const Claims: string[] = [];
	const Route: Agent["options"] =
		Options.provider === undefined || Options.model === undefined
			? {}
			: { provider: Options.provider, model: Options.model };
	return {
		id: Options.id ?? "session-1",
		Claims,
		options: Route,
		session: {
			deriveMessages: (): readonly Message[] => {
				if (Options.deriveThrows === true) {
					throw new Error("the session is disposed");
				}
				return Derived;
			},
		},
		status: "idle",
		// NOT an async function: the harness throws SYNCHRONOUSLY when a turn or
		// another task owns the agent, and the gate reads that throw as `busy`.
		runMaintenance: <Result>(Task: (Signal: AbortSignal) => Promise<Result>): Promise<Result> => {
			if (Options.busy === true) {
				throw new Error("the agent is not idle");
			}
			Claims.push("claimed");
			return Task(new AbortController().signal);
		},
		whenIdle: async (): Promise<void> => {
			/* the fake is always idle */
		},
	};
};

/**
 * One message carrying one text block.
 */
export const Say = (Role: Message["role"], Text_: string): Message => ({
	role: Role,
	content: [{ type: "text", text: Text_ }],
});

/**
 * One assistant message carrying tool-call blocks, with `null` for a nameless call.
 */
export const Call = (Names: readonly (string | null)[]): Message => ({
	role: "assistant",
	content: Names.map((Name): ContentBlock => (Name === null ? { type: "tool-call" } : { type: "tool-call", name: Name })),
});

/**
 * One assistant message carrying a text block AND tool-call blocks.
 */
export const Turn = (Text_: string, Names: readonly (string | null)[]): Message => ({
	role: "assistant",
	content: [
		{ type: "text", text: Text_ },
		...Names.map((Name): ContentBlock => (Name === null ? { type: "tool-call" } : { type: "tool-call", name: Name })),
	],
});

/**
 * A message built from data, for a block the plugin's own type does not declare.
 */
export const Foreign = (Role: string, Blocks: readonly Record<string, unknown>[]): Message =>
	JSON.parse(JSON.stringify({ role: Role, content: Blocks }));

/**
 * The corpus a judge or a write reads: a literal map, as Interface/Corpus.ts documents.
 */
export interface CorpusSeed {
	/**
	 * The current body of each skill, keyed by name.
	 */
	readonly bodies?: Record<string, string>;

	/**
	 * The body the confirm prompt carried, keyed by name.
	 */
	readonly carried?: Record<string, string>;

	/**
	 * The support files, keyed by `<name>/<filePath>`.
	 */
	readonly support?: Record<string, string>;

	/**
	 * The path the catalog resolves, keyed by name, when it is not the corpus default.
	 */
	readonly resolved?: Record<string, string>;

	/**
	 * The usage records, keyed by name.
	 */
	readonly records?: Record<string, UsageRecord>;
}

/**
 * The judge's read-only view of a corpus held as literal maps.
 */
export const CorpusView = (Configuration_: Configuration, Seed: CorpusSeed = {}): Corpus => {
	const Bodies = Seed.bodies ?? {};
	const Carried = Seed.carried ?? {};
	const Support = Seed.support ?? {};
	const Resolved = Seed.resolved ?? {};
	const Records = Seed.records ?? {};
	const Root = Expand(Configuration_.skillsRoot);
	return {
		resolve: (Name: string): string | null => {
			const Given = Resolved[Name];
			if (Given !== undefined) return Given;
			return Bodies[Name] === undefined ? null : Path.join(Root, Name, "SKILL.md");
		},
		body: (Name: string): string | null => Bodies[Name] ?? null,
		carried: (Name: string): string | null => Carried[Name] ?? null,
		support: (Name: string, FilePath: string): string | null => Support[`${Name}/${FilePath}`] ?? null,
		record: (Name: string): UsageRecord | null => Records[Name] ?? null,
		contains: (Parent: string, Child: string): boolean => {
			const Left = Path.resolve(Parent);
			const Right = Path.resolve(Child);
			return Right === Left || Right.startsWith(`${Left}${Path.sep}`);
		},
	};
};

/**
 * A corpus fixture: one skill directory with a `SKILL.md` in the fake tree.
 */
export const Seed = (Fs_: FakeFs, Name: string, Body: string): string => {
	const Directory = Path.join(Home, ".dsh", "skills", Name);
	Fs_.Put(Path.join(Directory, "SKILL.md"), Body);
	return Directory;
};

/**
 * The parts a fake context assembles.
 */
export interface MakeOptions {
	readonly fs?: FakeFsOptions;
	readonly skills?: FakeSkillsOptions;
	readonly reply?: string;
	readonly llm?: FakeLLMOptions;
}

/**
 * The fake context: the seams a leaf is handed, plus the `get` probe.
 */
export interface FakeContext {
	readonly fs: FakeFs;
	readonly skills: FakeSkills;
	readonly llm: FakeLLM;
	readonly logger: FakeLogger;
	readonly workingDirectory: { readonly ensure: (Agent_: Agent) => Promise<string> };
	readonly get: (Name: string) => unknown;
}

/**
 * The fake ctx: `get` answers each seam by name, so a leaf that probes
 * `ctx.llm` or `ctx.logger` finds the fake and a leaf that probes an absent
 * seam finds `undefined` (the no-llm arm).
 */
export const Make = (Options: MakeOptions = {}): FakeContext => {
	const Fs_ = FakeFs(Options.fs ?? {});
	const Skills_ = FakeSkills(Options.skills ?? {});
	const LLM_ = FakeLLM(Options.reply ?? "", Options.llm ?? {});
	const Logger_ = FakeLogger();
	const Working = {
		ensure: async (_Agent: Agent): Promise<string> => Path.join(Home, "work"),
	};
	const get = (Name: string): unknown => {
		switch (true) {
			case Name === "fs":
				return Fs_;
			case Name === "skills":
				return Skills_;
			case Name === "llm":
				return LLM_;
			case Name === "logger":
				return Logger_;
			case Name === "workingDirectory":
				return Working;
			default:
				return undefined;
		}
	};
	return { fs: Fs_, skills: Skills_, llm: LLM_, logger: Logger_, workingDirectory: Working, get };
};
