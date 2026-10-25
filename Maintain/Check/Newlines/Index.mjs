#!/usr/bin/env node
//===============================================================================
// Maintain/Check/Newlines/Index.mjs - the EOF-newline gate for the DeepSeek monorepo.
//===============================================================================
//
// Usage:
//   node Maintain/Check/Newlines/Index.mjs          # check mode (exit 1 on violations)
//   node Maintain/Check/Newlines/Index.mjs --fix    # append the missing final LF
//
// Every TRACKED text file (git ls-files) must end with a single LF newline:
//   - a missing final newline        -> violation
//   - trailing blank lines (2+ LF)   -> violation
//   - CRLF line endings (a \r byte)  -> violation
//   - trailing whitespace on a line  -> violation
//
// Excluded by rule - the same set as .prettierignore and Maintain/Format/Index.sh:
//   - **/*.md       the byte-integrity-protected prose - NEVER touched
//   - Site/         its own repository with its own prettier config
//   - Test/         the frozen fixtures
//   - the build output + deps (Target/, target/, dist/, .turbo/, .cache/,
//     node_modules) - generated, not source
//   - empty files   no content, nothing to end
//
// --fix appends the missing final LF only; the other violation classes are
// reported, not auto-fixed (prettier + Maintain/Format/Index.sh's dos2unix step own them).
//===============================================================================
import Collect from "./Function/Collect.mjs";
import Run from "./Function/Run.mjs";

const Fix = process.argv.includes("--fix");
const Files = Collect();
const { Violations, Fixed } = Run(Files, Fix);

if (Fix && Fixed > 0) console.log(`Fixed the missing final LF in ${Fixed} file(s).`);
if (Violations > 0) {
	console.error(`EOF-newline check failed: ${Violations} file(s) with violations.`);
	process.exit(1);
}
console.log(`EOF-newline check clean: ${Files.length} tracked text file(s) scanned.`);
