[**9** Branches](https://github.com/open-telemetry/semantic-conventions-genai/branches)[](https://github.com/open-telemetry/semantic-conventions-genai/tags)
Go to file
Open more actions menu
and
Open commit detailssuccess
Oct 27, 2026
[e19717d](https://github.com/open-telemetry/semantic-conventions-genai/commit/e19717d65f890955777b044bca2a3cd71ae8b498) · Oct 27, 2026
[680 Commits](https://github.com/open-telemetry/semantic-conventions-genai/commits/main/)
Open commit details
680 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   |   | Oct 27, 2026  |  
|   |   |   | Oct 27, 2026  |  
|   | Oct 27, 2026  |  
|   |   |   | Oct 27, 2026  |  
| [policies/check/json-schema-annotations](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/policies/check/json-schema-annotations "This path skips through empty directories")  | [policies/check/json-schema-annotations](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/policies/check/json-schema-annotations "This path skips through empty directories")  | [Add json-schema annotation for complex attributes, render boilerplate…](https://github.com/open-telemetry/semantic-conventions-genai/commit/791c341968d4d14cdc4d26f5c59fe690a7fcba5b "Add json-schema annotation for complex attributes, render boilerplate note in templates \(#330\)

* Add json-schema annotation for complex attributes, render boilerplate note in templates

* return deserialization for tool args and result

* make json schemas path configurable in model.py

* update ci")  | Jun 25, 2026  |  
|   |   |   | Oct 27, 2026  |  
| [templates/registry](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/templates/registry "This path skips through empty directories")  | [templates/registry](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/templates/registry "This path skips through empty directories")  |   | Oct 27, 2026  |  
|   |   | [Prepare standalone GenAI semantic conventions repo](https://github.com/open-telemetry/semantic-conventions-genai/commit/ebe3d1fb9fdda3398099e11ef91c4c490912f88d "Prepare standalone GenAI semantic conventions repo")  | May 5, 2026  |  
|   |   |   | Jun 19, 2026  |  
|   |   |  [Run the reference scenarios under the conformance runner (](https://github.com/open-telemetry/semantic-conventions-genai/commit/46d43c8949afb53765a202e89f4534eeb75ca3fa "Run the reference scenarios under the conformance runner \(#442\)

* Run the reference scenarios under the conformance runner

Adopt the runner, mock LLM server and GenAI advice policies from
open-telemetry/semantic-conventions-conformance and drop this repo's
copies. The checkout is fetched at the CONFORMANCE_REF pinned in
versions.env; nothing is vendored.

* Resolve the coverage model on demand instead of committing it

* Address review feedback

- Resolve the coverage model on first use rather than at import, so
  importing the package does no work and needs no network.
- Report a failure to bootstrap the runner as a CLI error, not a trace.
- Cover the registry-name to report-key mapping for spans and events.
- Name the full path when the checkout has no coverage model script.

* feedback")[#442](https://github.com/open-telemetry/semantic-conventions-genai/pull/442)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/46d43c8949afb53765a202e89f4534eeb75ca3fa "Run the reference scenarios under the conformance runner \(#442\)

* Run the reference scenarios under the conformance runner

Adopt the runner, mock LLM server and GenAI advice policies from
open-telemetry/semantic-conventions-conformance and drop this repo's
copies. The checkout is fetched at the CONFORMANCE_REF pinned in
versions.env; nothing is vendored.

* Resolve the coverage model on demand instead of committing it

* Address review feedback

- Resolve the coverage model on first use rather than at import, so
  importing the package does no work and needs no network.
- Report a failure to bootstrap the runner as a CLI error, not a trace.
- Cover the registry-name to report-key mapping for spans and events.
- Name the full path when the checkout has no coverage model script.

* feedback")  | Aug 9, 2026  |  
|   |   |  [[tests] Add golden tests for the GenAI JSON schemas (](https://github.com/open-telemetry/semantic-conventions-genai/commit/321662ba7d19a7a965d74bf11832e3d8ea887fda "\[tests\] Add golden tests for the GenAI JSON schemas \(#583\)

* Add golden tests for the GenAI JSON schemas

## Description

Part of https://github.com/open-telemetry/semantic-conventions-genai/issues/527

We have a bunch of JSON Schemas \(e.g. \[`gen-ai-input-messages.json`\]\(https://github.com/open-telemetry/semantic-conventions-genai/blob/main/model/gen-ai/gen-ai-input-messages.json\)\), but no tested examples of documents passing/failing validation.

- Adds golden YAML files under `docs/gen-ai/non-normative/tests/cases/` which contain a JSON document and expected errors \(or no errors\).
- `uv run pytest --update-snapshots` regenerates the errors
- `make test-json-schemas` tests that the goldens match the expectation in CI.

Only four cases here to keep the diff reviewable; the rest of the schemas get cases in a follow-up.

## Motivation

- validate changes to the JSON schemas, ensuring they don't break existing documents \(will use in https://github.com/open-telemetry/semantic-conventions-genai/pull/584\)
- help show intentional new error classes
- Act as non-normative examples for each schema of valid/invalid documents

## Prototype

N/A.

## Checklist

- \[x\] Motivation section filled in above \(n/a\)
- \[ \] Reference scenarios updated for affected libraries \(n/a\)
- \[ \] Towncrier fragment added under `changelog.d/` \(n/a\)

* Update docs/gen-ai/non-normative/pyproject.toml

Co-authored-by: Liudmila Molkova <neskazu@gmail.com>

---------

Co-authored-by: Liudmila Molkova <neskazu@gmail.com>")[#583](https://github.com/open-telemetry/semantic-conventions-genai/pull/583)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/321662ba7d19a7a965d74bf11832e3d8ea887fda "\[tests\] Add golden tests for the GenAI JSON schemas \(#583\)

* Add golden tests for the GenAI JSON schemas

## Description

Part of https://github.com/open-telemetry/semantic-conventions-genai/issues/527

We have a bunch of JSON Schemas \(e.g. \[`gen-ai-input-messages.json`\]\(https://github.com/open-telemetry/semantic-conventions-genai/blob/main/model/gen-ai/gen-ai-input-messages.json\)\), but no tested examples of documents passing/failing validation.

- Adds golden YAML files under `docs/gen-ai/non-normative/tests/cases/` which contain a JSON document and expected errors \(or no errors\).
- `uv run pytest --update-snapshots` regenerates the errors
- `make test-json-schemas` tests that the goldens match the expectation in CI.

Only four cases here to keep the diff reviewable; the rest of the schemas get cases in a follow-up.

## Motivation

- validate changes to the JSON schemas, ensuring they don't break existing documents \(will use in https://github.com/open-telemetry/semantic-conventions-genai/pull/584\)
- help show intentional new error classes
- Act as non-normative examples for each schema of valid/invalid documents

## Prototype

N/A.

## Checklist

- \[x\] Motivation section filled in above \(n/a\)
- \[ \] Reference scenarios updated for affected libraries \(n/a\)
- \[ \] Towncrier fragment added under `changelog.d/` \(n/a\)

* Update docs/gen-ai/non-normative/pyproject.toml

Co-authored-by: Liudmila Molkova <neskazu@gmail.com>

---------

Co-authored-by: Liudmila Molkova <neskazu@gmail.com>")  | Oct 12, 2026  |  
|   |   |  [Add Towncrier changelog management (](https://github.com/open-telemetry/semantic-conventions-genai/commit/df4a3c10398b14841f6922c712c42dc31618acaf "Add Towncrier changelog management \(#275\)

* Add Towncrier changelog management

* Add changelog fragment review instruction

* Address review comment: document changelog fragment types

* Potential fix for pull request finding

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>

---------

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>")[#275](https://github.com/open-telemetry/semantic-conventions-genai/pull/275)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/df4a3c10398b14841f6922c712c42dc31618acaf "Add Towncrier changelog management \(#275\)

* Add Towncrier changelog management

* Add changelog fragment review instruction

* Address review comment: document changelog fragment types

* Potential fix for pull request finding

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>

---------

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>")  | Jun 10, 2026  |  
|   |   |   | Jun 26, 2026  |  
|   |   |  [Make reference scenario review instructions actionable (](https://github.com/open-telemetry/semantic-conventions-genai/commit/110e8ca819079f8a25f63856053dc21efdf07fba "Make reference scenario review instructions actionable \(#455\)

* Make reference scenario review instructions actionable

* clean up more, drop duplicated file

* Address Copilot review feedback

- Fix link in reference/AGENTS.md to point to .github/skills/reference/SKILL.md
- Expand skill description to include 'evaluating' so reviews trigger it
- Restore public entry point requirement in scenario guidance
- Expand source list to include exceptions and library state

* up

* feedback")[#455](https://github.com/open-telemetry/semantic-conventions-genai/pull/455)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/110e8ca819079f8a25f63856053dc21efdf07fba "Make reference scenario review instructions actionable \(#455\)

* Make reference scenario review instructions actionable

* clean up more, drop duplicated file

* Address Copilot review feedback

- Fix link in reference/AGENTS.md to point to .github/skills/reference/SKILL.md
- Expand skill description to include 'evaluating' so reviews trigger it
- Restore public entry point requirement in scenario guidance
- Expand source list to include exceptions and library state

* up

* feedback")  | Aug 27, 2026  |  
|   |   |   | May 1, 2019  |  
|   |   |   | Oct 27, 2026  |  
|   |   |   | Jun 4, 2026  |  
|   |   |  [Add Towncrier changelog management (](https://github.com/open-telemetry/semantic-conventions-genai/commit/df4a3c10398b14841f6922c712c42dc31618acaf "Add Towncrier changelog management \(#275\)

* Add Towncrier changelog management

* Add changelog fragment review instruction

* Address review comment: document changelog fragment types

* Potential fix for pull request finding

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>

---------

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>")[#275](https://github.com/open-telemetry/semantic-conventions-genai/pull/275)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/df4a3c10398b14841f6922c712c42dc31618acaf "Add Towncrier changelog management \(#275\)

* Add Towncrier changelog management

* Add changelog fragment review instruction

* Address review comment: document changelog fragment types

* Potential fix for pull request finding

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>

---------

Co-authored-by: Copilot Autofix powered by AI <175728472+Copilot@users.noreply.github.com>")  | Jun 10, 2026  |  
|   |   |   | Oct 2, 2026  |  
|   |   |  [Update dependency open-telemetry/weaver to v0.26.0 (](https://github.com/open-telemetry/semantic-conventions-genai/commit/fee465db333bdd6a7d2faa320edab5cf3101a4f4 "Update dependency open-telemetry/weaver to v0.26.0 \(#494\)

* Update dependency open-telemetry/weaver to v0.26.0

* Apply suggestion from @lmolkova

---------

Co-authored-by: renovate\[bot\] <29139614+renovate\[bot\]@users.noreply.github.com>
Co-authored-by: Liudmila Molkova <neskazu@gmail.com>")[#494](https://github.com/open-telemetry/semantic-conventions-genai/pull/494)[)](https://github.com/open-telemetry/semantic-conventions-genai/commit/fee465db333bdd6a7d2faa320edab5cf3101a4f4 "Update dependency open-telemetry/weaver to v0.26.0 \(#494\)

* Update dependency open-telemetry/weaver to v0.26.0

* Apply suggestion from @lmolkova

---------

Co-authored-by: renovate\[bot\] <29139614+renovate\[bot\]@users.noreply.github.com>
Co-authored-by: Liudmila Molkova <neskazu@gmail.com>")  | Sep 3, 2026  |  
| View all files |  
#  OpenTelemetry GenAI Semantic Conventions
Semantic Conventions for Generative AI (GenAI), including spans, metrics, and events for GenAI clients, MCP (Model Context Protocol), and provider-specific conventions (OpenAI, etc.).
This repository extends the [OpenTelemetry Semantic Conventions](https://github.com/open-telemetry/semantic-conventions) with GenAI-specific conventions, using [Weaver](https://github.com/open-telemetry/weaver) to manage dependencies on the core semantic conventions.
## Schema URL
TODO
## Read the docs
The human-readable version of the semantic conventions resides in the [docs](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs) folder. Major parts of these Markdown documents are generated from the YAML definitions located in the [model](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/model) folder.
Reference implementations and their tooling live under [reference](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/reference). For the Python reference compliance matrix and per-signal support reports, see [reference/README.md](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/reference/README.md). For contribution guidance specific to that project, see [reference/CONTRIBUTING.md](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/reference/CONTRIBUTING.md).
## Contributing
See [CONTRIBUTING.md](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/CONTRIBUTING.md).
## About
**488** stars
**8** watching
[ forks](https://github.com/open-telemetry/semantic-conventions-genai/forks)
## 
No releases published
## 
## Languages
  * [Python93.3%](https://github.com/open-telemetry/semantic-conventions-genai/search?l=python)
  * [Jinja5.2%](https://github.com/open-telemetry/semantic-conventions-genai/search?l=jinja)
  * [Makefile1.3%](https://github.com/open-telemetry/semantic-conventions-genai/search?l=makefile)
  * [Other0.2%](https://github.com/open-telemetry/semantic-conventions-genai/search?l=Other)


You can’t perform that action at this time. 
