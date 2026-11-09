/**
 * @module Test
 *
 * The shipped posture: the schema's defaults, the knob reader's defaults, and
 * the identity places.
 *
 * @remarks
 * The schema is the truth (`Source/Variable/Configuration.ts:5-7`), and the knob
 * reader exists because a bare construction never passes through Schemastery.
 * Two readers of one table is a duplicate by construction, so this folder
 * compares BOTH to one written-out table of plan section 9 - a drift in either
 * one fails here rather than at the first live review.
 *
 * `enabled: false` is the idle-forever posture, and `write: auto` is the one
 * verdict that differs from the lesson-review sibling: this plugin publishes its
 * own judged operations behind the fence rather than queueing them for
 * acceptance. `commit` and `spawn` stay `approve` because the plugin never
 * commits and never spawns an agent.
 */
import assert from "node:assert/strict";
import FileSystem from "node:fs";

import Configuration from "../../../Target/Variable/Configuration.js";
import { Check, Finish, Knobs, MakeCounter } from "../Harness.js";

/** One member of a value read from JSON or from a resolved schema cell. */
const Member = (Value: unknown, Key: string): unknown => {
	if (typeof Value !== "object" || Value === null) return undefined;
	return Reflect.get(Value, Key);
};

/** Unwrap one resolved schema cell: a volatile cell carries its value behind `get`. */
const Cell = (Value: unknown): unknown => {
	if (typeof Value !== "object" || Value === null || !("get" in Value)) return Value;
	const Reader = Value.get;
	return typeof Reader === "function" ? Reader.call(Value) : Value;
};

/** The resolved schema as a plain map, because Schemastery types a module's own fields as unknown. */
const Values = (Given: unknown): Map<string, unknown> => {
	const Map_ = new Map<string, unknown>();
	if (typeof Given !== "object" || Given === null) return Map_;
	for (const Key of Object.keys(Given)) Map_.set(Key, Reflect.get(Given, Key));
	return Map_;
};

/** The 29 scalar defaults of plan section 9, written out: the contract, not a mirror. */
const Scalars = {
	enabled: false,
	logFile: "~/.dsh/playform/plugin-dsh-skill-learn.log",
	domain: "skillLearn",
	storagePath: "~/.dsh/skill-learn/usage.json",
	statePath: "~/.dsh/skill-learn/state.json",
	ledgerPath: "~/.dsh/skill-learn/ledger.jsonl",
	blobRoot: "~/.dsh/skill-learn/blobs",
	snapshotRoot: "~/.dsh/skill-learn/snapshots",
	reportsRoot: "~/.dsh/skill-learn/reports",
	snapshotKeep: 5,
	skillsRoot: "~/.dsh/skills",
	archiveRoot: "~/.dsh/skills/.archive",
	agreementPath: "~/.dsh/AGENTS.md",
	intervalIterations: 15,
	maxOperations: 8,
	maxOperationsPerRun: 4,
	maxWritesPerSession: 6,
	digestTail: 24,
	digestUserChars: 300,
	digestAssistantChars: 200,
	maxInputChars: 120_000,
	maxTokens: 4000,
	maxSkillChars: 100_000,
	staleAfterDays: 14,
	archiveAfterDays: 30,
	curateIntervalHours: 168,
	consolidate: false,
	provider: "",
	model: "",
};

/** The eight policy verdicts: the D6 block, with this package's `write: auto`. */
const Policy = {
	read: "auto",
	index: "auto",
	record: "auto",
	suggest: "auto",
	write: "auto",
	commit: "approve",
	spawn: "approve",
	message: "auto",
};

/** The ten path knobs of section 9. */
const Paths: readonly (keyof typeof Scalars)[] = [
	"logFile",
	"storagePath",
	"statePath",
	"ledgerPath",
	"blobRoot",
	"snapshotRoot",
	"reportsRoot",
	"skillsRoot",
	"archiveRoot",
	"agreementPath",
];

/** The fourteen numeric knobs of section 9. */
const Numbers: readonly (keyof typeof Scalars)[] = [
	"snapshotKeep",
	"intervalIterations",
	"maxOperations",
	"maxOperationsPerRun",
	"maxWritesPerSession",
	"digestTail",
	"digestUserChars",
	"digestAssistantChars",
	"maxInputChars",
	"maxTokens",
	"maxSkillChars",
	"staleAfterDays",
	"archiveAfterDays",
	"curateIntervalHours",
];

/** The two booleans and the three strings of section 9. */
const Flags: readonly (keyof typeof Scalars)[] = ["enabled", "consolidate"];
const Texts: readonly (keyof typeof Scalars)[] = ["domain", "provider", "model"];

/** The schema's resolved cells, and the knob reader's values. */
const Resolved = Values(Configuration({}));
const Default = (Key: string): unknown => Cell(Resolved.get(Key));
const Reader = Knobs({});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	Check(Count, "P1: `enabled` is false in both the schema and the reader", () => {
		assert.equal(Default("enabled"), false, "the idle-forever posture");
		assert.equal(Reader.enabled, false, "a loaded plugin ships disabled");
	});

	Check(Count, "P2: `write` is auto, and `commit` and `spawn` stay approve", () => {
		const FromSchema = Default("policy");
		assert.equal(Member(FromSchema, "write"), "auto", "the review publishes behind the fence");
		assert.equal(Member(FromSchema, "commit"), "approve", "the plugin never commits");
		assert.equal(Member(FromSchema, "spawn"), "approve", "and never spawns an agent");
		assert.equal(Reader.policy.write, "auto");
		assert.equal(Reader.policy.commit, "approve");
		assert.equal(Reader.policy.spawn, "approve");
	});

	Check(Count, "P3: the eight policy verdicts are the shipped posture", () => {
		assert.deepEqual(Default("policy"), Policy, "the schema fills the block");
		assert.deepEqual(Reader.policy, Policy, "and the reader carries it");
	});

	Check(Count, "P4: the ten path defaults are the family's own", () => {
		for (const Key of Paths) {
			assert.equal(Default(Key), Scalars[Key], `${Key} is the shipped path`);
			assert.equal(typeof Scalars[Key], "string", `${Key} is a path`);
		}
	});

	Check(Count, "P5: the fourteen numeric defaults are the shipped budgets", () => {
		for (const Key of Numbers) {
			assert.equal(Default(Key), Scalars[Key], `${Key} is the shipped number`);
			assert.equal(typeof Scalars[Key], "number", `${Key} is a number`);
		}
	});

	Check(Count, "P6: the two booleans and the three strings are the shipped values", () => {
		for (const Key of [...Flags, ...Texts]) {
			assert.equal(Default(Key), Scalars[Key], `${Key} is the shipped value`);
		}
	});

	Check(Count, "P7: the identity places agree", () => {
		const Manifest: unknown = JSON.parse(
			FileSystem.readFileSync(new URL("../../../package.json", import.meta.url), "utf8"),
		);
		const Name = Member(Manifest, "name");
		assert.equal(Name, "@playform/plugin-dsh-skill-learn", "identity place one: the package name");
		assert.equal(Default("domain"), "skillLearn", "identity place three: the service name and ledger prefix");
		assert.equal(
			Default("logFile"),
			`~/.dsh/playform/${String(Name).replace("@playform/", "")}.log`,
			"identity place four: the log file default is the package's own name",
		);
		const Patch = FileSystem.readFileSync(new URL("../../../cordis.patch.yml", import.meta.url), "utf8");
		assert.equal(
			Patch.includes(`id: ${String(Name).replace("@playform/", "")}`),
			true,
			"the loader entry id is the package's short name",
		);
		assert.equal(Patch.includes(`name: "${String(Name)}"`), true, "and the row names the package in full");
		assert.equal(Patch.includes("domain: skillLearn"), true, "the patch and the schema agree on the domain");
	});

	Check(Count, "P8: the knob reader agrees with the schema's 29 scalar defaults", () => {
		assert.deepEqual(
			Object.fromEntries(Object.entries(Reader).filter(([Key]) => Key !== "policy")),
			Scalars,
			"one table, two readers: a drift in either one fails here",
		);
	});

	Check(Count, "P9: a partial override merges, a bad number falls back, and a cell is unwrapped", () => {
		assert.deepEqual(
			Knobs({ policy: { write: "approve" } }).policy,
			{ ...Policy, write: "approve" },
			"a partial override replaces one verdict and keeps the rest",
		);
		assert.equal(Knobs({ digestTail: "nonsense" }).digestTail, 24, "a string is not a tail");
		assert.equal(Knobs({ maxOperations: 99 }).maxOperations, 8, "the prompt states eight, so eight is the ceiling");
		assert.equal(Knobs({ staleAfterDays: 0 }).staleAfterDays, 1, "the day thresholds are floored at one");
		assert.equal(Knobs({ enabled: { get: () => true } }).enabled, true, "a volatile cell is unwrapped before it is read");
	});

	return Finish(Count, "Policy-Defaults");
};

// Standalone entry: `node Target/Test/Policy-Defaults/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
