#!/usr/bin/env node

import { fileURLToPath } from "node:url";

import { featuresOf } from "../../Maintain/Icon/Feature.mjs";
import { packages } from "../../Maintain/Icon/Index.mjs";
import { profileOf, structureOf } from "../../Maintain/Icon/Infer.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));
const Roles = [
	"interceptor",
	"transformer",
	"router",
	"store",
	"renderer",
	"governor",
	"orchestrator",
	"analyzer",
];
const Fields = [
	"role",
	"flow",
	"stateful",
	"streaming",
	"branching",
	"containment",
	"weight",
	"evidence",
	"confidence",
];

const Results = [];
const record = (Name, Ok, Detail) => {
	Results.push({ Name, Ok });
	console.log(`${Ok ? "PASS" : "FAIL"}  ${Name}${Detail === "" ? "" : ` - ${Detail}`}`);
};

const Rows = packages(Root).map((Package) => {
	const Entry = featuresOf(Root, Package.dir);
	return { dir: Package.dir, profile: profileOf(structureOf(Root, Package.dir), Entry) };
});

const countOf = (Key) => {
	const Counts = new Map();
	for (const Row of Rows) {
		const Value = String(Row.profile[Key]);
		Counts.set(Value, (Counts.get(Value) ?? 0) + 1);
	}
	return [...Counts].sort((Left, Right) => (Left[0] < Right[0] ? -1 : 1));
};

const print = (Title, Entries) => {
	console.log(`${Title}:`);
	for (const [Value, Count] of Entries) {
		console.log(`  ${String(Value).padEnd(14)} ${Count}`);
	}
};

console.log(`profiles: ${Rows.length} packages, ${Roles.length} roles\n`);
print(
	"role distribution",
	Roles.map((Role) => [Role, Rows.filter((Row) => Row.profile.role === Role).length]),
);
console.log("");
print("flow distribution", countOf("flow"));
console.log("");
print("weight distribution", countOf("weight"));

console.log("\nexamples:");
console.log("  dir | role | flow | branching | containment | evidence");
const Step = Math.floor(Rows.length / 6);
for (const Index of [0, Step, Step * 2, Step * 3, Step * 4, Step * 5]) {
	const Row = Rows[Index];
	console.log(
		`  ${Row.dir} | ${Row.profile.role} | ${Row.profile.flow} | ${Row.profile.branching} | ${Row.profile.containment} | ${Row.profile.evidence.join("; ")}`,
	);
}
console.log("");

const Missing = Rows.filter((Row) => Fields.some((Field) => Row.profile[Field] === undefined));
record(
	"fields: every profile carries all nine fields",
	Missing.length === 0,
	Missing.length === 0 ? "" : Missing.slice(0, 3).map((Row) => Row.dir).join(", "),
);

const Silent = Rows.filter(
	(Row) => !Array.isArray(Row.profile.evidence) || Row.profile.evidence.length === 0,
);
record(
	"evidence: every profile names its facts",
	Silent.length === 0,
	Silent.length === 0 ? "" : Silent.slice(0, 3).map((Row) => Row.dir).join(", "),
);

const Thin = Roles.filter(
	(Role) => Rows.filter((Row) => Row.profile.role === Role).length < 2,
);
record(
	"roles: every role holds at least two packages",
	Thin.length === 0,
	Thin.length === 0 ? `${Roles.length} roles populated` : `under two: ${Thin.join(", ")}`,
);

record("coverage: 102 packages profiled", Rows.length === 102, `${Rows.length} packages`);

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} profile checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
