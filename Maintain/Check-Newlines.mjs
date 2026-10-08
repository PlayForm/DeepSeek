#!/usr/bin/env node
//===============================================================================
// Check-Newlines.mjs - the EOF-newline gate for the DeepSeek monorepo.
//===============================================================================
//
// Usage:
//   node Maintain/Check-Newlines.mjs          # check mode (exit 1 on violations)
//   node Maintain/Check-Newlines.mjs --fix    # append the missing final LF
//
// Every TRACKED text file (git ls-files) must end with a single LF newline:
//   - a missing final newline        -> violation
//   - trailing blank lines (2+ LF)   -> violation
//   - CRLF line endings (a \r byte)  -> violation
//   - trailing whitespace on a line  -> violation
//
// Excluded by rule - the same set as .prettierignore and Format.sh:
//   - **/*.md       the byte-integrity-protected prose - NEVER touched
//   - Site/         its own repository with its own prettier config
//   - Test/         the frozen fixtures
//   - the build output + deps (Target/, target/, dist/, .turbo/, .cache/,
//     node_modules) - generated, not source
//   - empty files   no content, nothing to end
//
// --fix appends the missing final LF only; the other violation classes are
// reported, not auto-fixed (prettier + Format.sh's dos2unix step own them).
//===============================================================================

import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";

const Fix = process.argv.includes("--fix");

const Excluded = (Path) =>
	Path.endsWith(".md") ||
	Path.startsWith("Site/") ||
	Path.startsWith("Test/") ||
	Path.split("/").some(
		(Segment) =>
			Segment === "node_modules" ||
			Segment === "Target" ||
			Segment === "target" ||
			Segment === "dist" ||
			Segment === ".turbo" ||
			Segment === ".cache",
	);

const Files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
	.split("\0")
	.filter(Boolean)
	.filter((Path) => !Excluded(Path));

let Violations = 0;
let Fixed = 0;

for (const Path of Files) {
	let Content;
	try {
		if (statSync(Path).size === 0) continue;
		Content = readFileSync(Path, "utf8");
	} catch {
		continue;
	}

	const Problems = [];
	if (!Content.endsWith("\n")) Problems.push("missing final LF");
	else if (Content.endsWith("\n\n")) Problems.push("trailing blank lines");
	if (Content.includes("\r")) Problems.push("CRLF");
	if (/[ \t]+(?=\n|$)/.test(Content)) Problems.push("trailing whitespace");

	if (Problems.length === 0) continue;

	if (Fix && Problems.includes("missing final LF")) {
		writeFileSync(Path, Content + "\n");
		Fixed += 1;
		Problems.splice(Problems.indexOf("missing final LF"), 1);
	}

	if (Problems.length > 0) {
		Violations += 1;
		console.log(`${Path}: ${Problems.join(", ")}`);
	}
}

if (Fix && Fixed > 0) console.log(`Fixed the missing final LF in ${Fixed} file(s).`);
if (Violations > 0) {
	console.error(`EOF-newline check failed: ${Violations} file(s) with violations.`);
	process.exit(1);
}
console.log(`EOF-newline check clean: ${Files.length} tracked text file(s) scanned.`);
