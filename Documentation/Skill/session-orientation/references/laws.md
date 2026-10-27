# The Laws (Short Form, With Owners)

Five laws bind every agent in this repository.

Each has one owner skill; the owner states the rule, and every other skill points to it.

This file is the index a session can hold in memory.

## 1. The file-write law

All file content goes through the `write`, `raw-write`, or `edit` tool API.

Never `sed`, `awk`, `perl`, `python` in-place, or heredoc surgery.

Reads go through the `read`, `grep`, and `glob` tools, never `cat` or `head`.

Owner: `code-authoring`. Short form: the tools are the observable, governed path; the terminal runs
commands, not content.

## 2. The byte-integrity law

Never write NUL bytes or control characters outside `\n`, `\r`, `\t`.

Never build content through NUL-separated conventions.

After any bulk transformation, scan the touched files for NUL bytes and valid UTF-8 before reporting
done.

Owner: `code-authoring`. Short form: a NUL byte is the signature of a broken pipeline, not a format
choice.

## 3. The git law

Git is read-only checks: `status`, `log`, `diff`, `show`, `rev-parse`, `ls-files`, `fetch`.

Never `add`, `commit`, `reset`, `push`, `tag`, `rm`, `checkout`, `branch`, `merge`, `stash`, or
`clean`.

A finished deliverable is reported as READY-TO-COMMIT with the file list and a suggested message;
the user commits.

Owner: `code-authoring`. Short form: the user owns every mutation.

## 4. The routing law

Every delegation passes `provider`, `model`, and `reasoning_effort` explicitly.

Exploration is `@cf/zai-org/glm-5.3-flash` at `low`; semantic coding at `high`; planning and the
deepest reasoning on the DeepSeek lane at `max`.

Only the three catalog models may be requested.

Owner: `task-routing`. Short form: omission is not neutral; it inherits the expensive lane.

## 5. The ledger-string law

Every activation line, refusal line, chain-pass line, and journal record is byte-identical across
the two release trees and across refactors.

Rename mechanics, never strings.

The smokes assert the strings.

Owner: `plugin-system`. Short form: the strings are the contract.

## The two verification laws

These are not file rules but they decide when work is done.

## 6. The smoke-arbiter law

After every package change, the bundle's smoke suite passes with zero assertion changes.

Additive coverage is allowed; weakening is not.

A failing smoke means the change is wrong, not the smoke.

Owner: `smoke-writing`. Short form: the suites judge the change, never the reverse.

## 7. The build-as-verification law (the site)

The site is verified by building it (`cd Site && pnpm prepublishOnly`) and inspecting the built HTML
and CSS in `Site/Target/`.

No dev server, no `tsc`, no source-only claims.

Owner: `site-authoring`. Short form: the built output is the arbiter.

## When a law conflicts with a request

The user's explicit instruction wins for the task it names.

Record the deviation and resume the law afterwards.

Do not generalize one exception into a new rule.
