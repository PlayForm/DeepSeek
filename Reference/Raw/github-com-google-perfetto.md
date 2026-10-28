[**770** Branches](https://github.com/google/perfetto/branches)[](https://github.com/google/perfetto/tags)
Go to file
Open more actions menu
[perfetto-automation[bot]](https://github.com/google/perfetto/commits?author=perfetto-automation%5Bbot%5D)
and
perfetto-automation[bot]
Open commit detailssuccess
Oct 28, 2026
[f5cb507](https://github.com/google/perfetto/commit/f5cb5074e59208ec89c65aeeed53cc9cf6204cd5) · Oct 28, 2026
[83,467 Commits](https://github.com/google/perfetto/commits/main/)
Open commit details
83,467 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   |  [perfetto: check benchmark instruction counts on every commit (](https://github.com/google/perfetto/commit/56a6c7310773b54284bcf6aa684b6b4454fc3598 "perfetto: check benchmark instruction counts on every commit \(#7857\)

**Summary**

Adds a check, run on every commit, of how many instructions each
benchmark runs.

**Why**

Wall time on shared CI machines is too noisy to catch the few-percent
regressions which add up. Instruction counts under callgrind are stable
to a fraction of a percent, so a per-commit check can catch them.

**Changes**

- **`tools/bench_instructions`** runs `perfetto_benchmarks` under
callgrind, collecting only each benchmark's timed loop for a single
iteration, so each benchmark runs once. It compares the counts against
`test/benchmark_instructions.txt` and fails when one moves by more than
a threshold, either way. The fix is to update the baseline in the same
commit, so the baseline's history records each commit's cost.
  - `--update` rewrites the baseline.
- A `?` in the baseline marks a count not measured yet, which is
reported rather than checked.
- **The baseline** starts with the executor benchmarks.
- **CI:** an `instructions` job in `linux-tests.yml`. The sandbox image
gains valgrind from the distribution's packages, so installing it is
quick. Until an image with valgrind is deployed, the job skips the check
with a warning instead of failing.")[#7857](https://github.com/google/perfetto/pull/7857)[)](https://github.com/google/perfetto/commit/56a6c7310773b54284bcf6aa684b6b4454fc3598 "perfetto: check benchmark instruction counts on every commit \(#7857\)

**Summary**

Adds a check, run on every commit, of how many instructions each
benchmark runs.

**Why**

Wall time on shared CI machines is too noisy to catch the few-percent
regressions which add up. Instruction counts under callgrind are stable
to a fraction of a percent, so a per-commit check can catch them.

**Changes**

- **`tools/bench_instructions`** runs `perfetto_benchmarks` under
callgrind, collecting only each benchmark's timed loop for a single
iteration, so each benchmark runs once. It compares the counts against
`test/benchmark_instructions.txt` and fails when one moves by more than
a threshold, either way. The fix is to update the baseline in the same
commit, so the baseline's history records each commit's cost.
  - `--update` rewrites the baseline.
- A `?` in the baseline marks a count not measured yet, which is
reported rather than checked.
- **The baseline** starts with the executor benchmarks.
- **CI:** an `instructions` job in `linux-tests.yml`. The sandbox image
gains valgrind from the distribution's packages, so installing it is
quick. Until an image with valgrind is deployed, the job skips the check
with a warning instead of failing.")  | Oct 12, 2026  |  
|   | Oct 28, 2026  |  
|   |   |  [bazel: document how to override @perfetto_cfg with bzlmod (](https://github.com/google/perfetto/commit/c8d91f8441e577217258de84703d2123567a3961 "bazel: document how to override @perfetto_cfg with bzlmod \(#7507\)

The README only describes how WORKSPACE-based embedders replace the
@perfetto_cfg repository. With bzlmod the repository is created by the
perfetto_cfg_ext module extension, so a local_repository with the same
name does not replace it: the root module has to use override_repo.

Tested by overriding default_copts from a module depending on Perfetto
and checking, with aquery, that the flag reaches Perfetto's compile
actions.

Bug: https://github.com/google/perfetto/issues/2787")[#7507](https://github.com/google/perfetto/pull/7507)[)](https://github.com/google/perfetto/commit/c8d91f8441e577217258de84703d2123567a3961 "bazel: document how to override @perfetto_cfg with bzlmod \(#7507\)

The README only describes how WORKSPACE-based embedders replace the
@perfetto_cfg repository. With bzlmod the repository is created by the
perfetto_cfg_ext module extension, so a local_repository with the same
name does not replace it: the root module has to use override_repo.

Tested by overriding default_copts from a module depending on Perfetto
and checking, with aquery, that the flag reaches Perfetto's compile
actions.

Bug: https://github.com/google/perfetto/issues/2787")  | Sep 21, 2026  |  
|   |   | [Move binder libraries into perfetto binary and save ~5 MB of ram](https://github.com/google/perfetto/commit/6d84853a0a2596f633ed48da83b71bc2c8d8deba "Move binder libraries into perfetto binary and save ~5 MB of ram

This change moves the dependencies on libandroir,libbinder & friends
from libtraced_shared.so to the perfetto binary.
Thankfully, in fact, only the short lived client binary requires
those.
Doing so causes a memory reduction of our traced and traced_probes
of roughly 2.5 MB private dirty memory for each of our two daemon
\(traced, traced_probes\).
The memory is mostly coming from relocations and initializers
coming from the tree of recursive dependencies of those libraries.
For the moment that causes a binary size hit of +268 KB

Memory
------
Before:
  Shared_Clean:       7900 kB
  Shared_Dirty:         80 kB
  Private_Clean:       156 kB
  Private_Dirty:      3176 kB

After:
  Shared_Clean:       1224 kB
  Shared_Dirty:         80 kB
  Private_Clean:       160 kB
  Private_Dirty:       528 kB  !!!

Binary size
-----------
Before:
  bin/traced:                 12 KB
  bin/traced_probes:          12 KB
  bin/perfetto:               12 KB
  lib64/libtraced_shared.so:  468 KB
  *TOTAL*:                    504 KB

After:
  bin/traced:                 12 KB
  bin/traced_probes:          12 KB
  bin/perfetto:               280 KB
  lib64/libtraced_shared.so:  468 KB
  *TOTAL*:                    772 KB
Change-Id: I72bc05a68edf9b485775c51e7e2f18f29594458b")  | Jan 17, 2018  |  
|   |   |  [perfetto: suppress -Wdeprecated-declarations in abseil_config (](https://github.com/google/perfetto/commit/5e7e6a5ad2dbd8e3a8bf888fa692e157840e13d1 "perfetto: suppress -Wdeprecated-declarations in abseil_config \(#8221\)

libstdc++ 12.0-12.3 marks std::get_temporary_buffer as deprecated but
still calls it unguarded from std::stable_sort's internals
\(bits/stl_tempbuf.h\). Building protobuf's message_differencer.cc against
those headers with clang and -Werror fails. This is fixed upstream in
libstdc++ 12.4 and 13.

The LUCI official Linux builder now has libstdc++ 12.3 installed, which
breaks the SDK generation step \(tools/gen_amalgamated builds against the
system libstdc++\). Suppress the warning for these third-party targets.")[#8221](https://github.com/google/perfetto/pull/8221)[)](https://github.com/google/perfetto/commit/5e7e6a5ad2dbd8e3a8bf888fa692e157840e13d1 "perfetto: suppress -Wdeprecated-declarations in abseil_config \(#8221\)

libstdc++ 12.0-12.3 marks std::get_temporary_buffer as deprecated but
still calls it unguarded from std::stable_sort's internals
\(bits/stl_tempbuf.h\). Building protobuf's message_differencer.cc against
those headers with clang and -Werror fails. This is fixed upstream in
libstdc++ 12.4 and 13.

The LUCI official Linux builder now has libstdc++ 12.3 installed, which
breaks the SDK generation step \(tools/gen_amalgamated builds against the
system libstdc++\). Suppress the warning for these third-party targets.")  | Oct 23, 2026  |  
|   |   |  [perfetto: bump the Rust SDK crate versions for tracing v2 (](https://github.com/google/perfetto/commit/e4f0b74db29904095fe9161a748c9a84a4733dda "perfetto: bump the Rust SDK crate versions for tracing v2 \(#8144\)

perfetto-sdk now uses PerfettoDsSetSupportsTracingV2\(\) and the encoding
field of PerfettoPbMsgWriter, which the published perfetto-sdk-sys 1.3.0
does not have, so both crates need a new release.

perfetto-sdk-sys goes to 2.0.0 because its bindings renamed
PerfettoStreamWriter to PerfettoPbMsgWriter and changed the signature of
PerfettoDsTracerImplPacketBegin\(\), which breaks direct users of the sys
crate. perfetto-sdk only gains API, so it goes to 1.2.0.")[#8144](https://github.com/google/perfetto/pull/8144)[)](https://github.com/google/perfetto/commit/e4f0b74db29904095fe9161a748c9a84a4733dda "perfetto: bump the Rust SDK crate versions for tracing v2 \(#8144\)

perfetto-sdk now uses PerfettoDsSetSupportsTracingV2\(\) and the encoding
field of PerfettoPbMsgWriter, which the published perfetto-sdk-sys 1.3.0
does not have, so both crates need a new release.

perfetto-sdk-sys goes to 2.0.0 because its bindings renamed
PerfettoStreamWriter to PerfettoPbMsgWriter and changed the signature of
PerfettoDsTracerImplPacketBegin\(\), which breaks direct users of the sys
crate. perfetto-sdk only gains API, so it goes to 1.2.0.")  | Oct 20, 2026  |  
|   | Oct 28, 2026  |  
|   |   |  [perfetto: Integrate tracing v2 with the SDK (](https://github.com/google/perfetto/commit/f71d0790b10f5b7030db8e5208af20a68eca9f44 "perfetto: Integrate tracing v2 with the SDK \(#7700\)

Select v2 once per instance in the muxer and initialize its ring buffer
before publishing the instance. Preserve that choice on failure and
propagate packet encoding through the C SDK.")[#7700](https://github.com/google/perfetto/pull/7700)[)](https://github.com/google/perfetto/commit/f71d0790b10f5b7030db8e5208af20a68eca9f44 "perfetto: Integrate tracing v2 with the SDK \(#7700\)

Select v2 once per instance in the muxer and initialize its ring buffer
before publishing the instance. Preserve that choice on failure and
propagate packet encoding through the C SDK.")  | Oct 15, 2026  |  
|  [tp: move ProtoToArgsParser from util/ to importers/proto/ (](https://github.com/google/perfetto/commit/45a9dd6f530cdae6978d9b4cca321694d13f788b "tp: move ProtoToArgsParser from util/ to importers/proto/ \(#8248\)

Only importers use ProtoToArgsParser, but it lived in util/, which
cannot
depend on importers/ without a GN cycle. That is why its Delegate also
carries the packet sequence state, interned-message lookup and JSON
expansion: the parser could not reach those itself, so every delegate
had
to supply them.

Moving the parser next to its users lets a follow-up give it direct
access
to that state and shrink the delegate down to an arg sink. This change
is
only the move. The single use from importers/common was an unused
alias, which is deleted.")[#8248](https://github.com/google/perfetto/pull/8248)[)](https://github.com/google/perfetto/commit/45a9dd6f530cdae6978d9b4cca321694d13f788b "tp: move ProtoToArgsParser from util/ to importers/proto/ \(#8248\)

Only importers use ProtoToArgsParser, but it lived in util/, which
cannot
depend on importers/ without a GN cycle. That is why its Delegate also
carries the packet sequence state, interned-message lookup and JSON
expansion: the parser could not reach those itself, so every delegate
had
to supply them.

Moving the parser next to its users lets a follow-up give it direct
access
to that state and shrink the delegate down to an arg sink. This change
is
only the move. The single use from importers/common was an unused
alias, which is deleted.")  | Oct 27, 2026  |  
|   |   |  [perfetto: support big-endian in trace_processor_shell paths (](https://github.com/google/perfetto/commit/624afa18b239d8a28d0e24adde572abece09b32b "perfetto: support big-endian in trace_processor_shell paths \(#8256\)

In https://github.com/nodejs/node/pull/65794, we're trying to test our
Perfetto integration on several platforms, one of which is s390x
\(support was added by https://github.com/google/perfetto/pull/7449\) but
the cross-compilation fails when it reaches little-endian assertions.

I've tasked an LLM-agent to make a patch, and here's what it came up
with. I've validated that I was able to cross-compile for s390x.")[#8256](https://github.com/google/perfetto/pull/8256)[)](https://github.com/google/perfetto/commit/624afa18b239d8a28d0e24adde572abece09b32b "perfetto: support big-endian in trace_processor_shell paths \(#8256\)

In https://github.com/nodejs/node/pull/65794, we're trying to test our
Perfetto integration on several platforms, one of which is s390x
\(support was added by https://github.com/google/perfetto/pull/7449\) but
the cross-compilation fails when it reaches little-endian assertions.

I've tasked an LLM-agent to make a patch, and here's what it came up
with. I've validated that I was able to cross-compile for s390x.")  | Oct 26, 2026  |  
|   |   |  [tp: add railroad diagrams to the pipe syntax reference (](https://github.com/google/perfetto/commit/a9a9cca3cd89b7aa6790ee500bbf2962463fe4ce "tp: add railroad diagrams to the pipe syntax reference \(#8113\)

**Summary**

Draws the pipe syntax reference's grammar as railroad diagrams, the
way SQLite and other engines document their syntax.

**Why**

The bracketed text grammar, such as `\[<qualifier>.\]* \[EXCEPT \(<col_1>
\[, ...\]\)\] \[REPLACE \(<col> AS <target> \[, ...\]\)\]`, takes careful reading
to see what is optional and what repeats. A diagram shows it at a
glance.

**Changes**

- perfetto.dev renders a ```railroad code block to an inline SVG at
  build time. The block is an expression over the railroad-diagrams
  constructors, e.g. `Diagram\(Terminal\('FROM'\), NonTerminal\('source'\)\)`.
  ```railroad <name> labels the diagram with a rule name, and
  `Link\(item, href\)` makes a box a link.
- Adds railroad-diagrams 1.0.0 to the site. It has no dependencies.
- The syntax reference has a diagram for every source and stage, and
  for shared rules such as `<source>`, `<column>` and
  `<aggregate-list>`. Long rules are split into smaller ones so each
  diagram fits the page. The diagrams replace the text grammars.
- The list of stages links each one to its section.

**Testing**

Built the site and checked every diagram renders and fits the content
column.")[#8113](https://github.com/google/perfetto/pull/8113)[)](https://github.com/google/perfetto/commit/a9a9cca3cd89b7aa6790ee500bbf2962463fe4ce "tp: add railroad diagrams to the pipe syntax reference \(#8113\)

**Summary**

Draws the pipe syntax reference's grammar as railroad diagrams, the
way SQLite and other engines document their syntax.

**Why**

The bracketed text grammar, such as `\[<qualifier>.\]* \[EXCEPT \(<col_1>
\[, ...\]\)\] \[REPLACE \(<col> AS <target> \[, ...\]\)\]`, takes careful reading
to see what is optional and what repeats. A diagram shows it at a
glance.

**Changes**

- perfetto.dev renders a ```railroad code block to an inline SVG at
  build time. The block is an expression over the railroad-diagrams
  constructors, e.g. `Diagram\(Terminal\('FROM'\), NonTerminal\('source'\)\)`.
  ```railroad <name> labels the diagram with a rule name, and
  `Link\(item, href\)` makes a box a link.
- Adds railroad-diagrams 1.0.0 to the site. It has no dependencies.
- The syntax reference has a diagram for every source and stage, and
  for shared rules such as `<source>`, `<column>` and
  `<aggregate-list>`. Long rules are split into smaller ones so each
  diagram fits the page. The diagrams replace the text grammars.
- The list of stages links each one to its section.

**Testing**

Built the site and checked every diagram renders and fits the content
column.")  | Oct 20, 2026  |  
|   |   |   | Oct 28, 2026  |  
|   |   |   | Oct 28, 2026  |  
|  [Add MD file to notify about SDK move (](https://github.com/google/perfetto/commit/f6d82460ec55f78526aa05aca7d5e9bed3250244 "Add MD file to notify about SDK move \(#5030\)

This is to reduce the surprise factor for next releases
and tell people where the SDK moved.")[#5030](https://github.com/google/perfetto/pull/5030)[)](https://github.com/google/perfetto/commit/f6d82460ec55f78526aa05aca7d5e9bed3250244 "Add MD file to notify about SDK move \(#5030\)

This is to reduce the surprise factor for next releases
and tell people where the SDK moved.")  | Mar 5, 2026  |  
|  [tp: let args messages with pid/tid fields take the flat path (](https://github.com/google/perfetto/commit/34af185cc1eca05dc85bb9ecb387dd2b2567278a "tp: let args messages with pid/tid fields take the flat path \(#8272\)

A message with a pid or tid field was never flat-eligible, so every
such message went through the generic work loop: a work item per field,
key strings rebuilt and a descriptor lookup per field, and the "utid" /
"upid" keys rebuilt and interned on every occurrence. The flat path now
takes them, with the suffixed key interned once per field when the flat
message is prepared, and cached on the path node on the generic path
too. The same args are emitted in the same order.")[#8272](https://github.com/google/perfetto/pull/8272)[)](https://github.com/google/perfetto/commit/34af185cc1eca05dc85bb9ecb387dd2b2567278a "tp: let args messages with pid/tid fields take the flat path \(#8272\)

A message with a pid or tid field was never flat-eligible, so every
such message went through the generic work loop: a work item per field,
key strings rebuilt and a descriptor lookup per field, and the "utid" /
"upid" keys rebuilt and interned on every occurrence. The flat path now
takes them, with the suffixed key interned once per field when the flat
message is prepared, and cached on the path node on the generic path
too. The same args are emitted in the same order.")  | Oct 28, 2026  |  
|   | Oct 27, 2026  |  
|   |   |   | Jun 21, 2023  |  
|   |   |   | Oct 28, 2026  |  
|  [ui: Add missing category column to slice area aggregation (](https://github.com/google/perfetto/commit/15010533b275181cdd593027908704369d1c99b5 "ui: Add missing category column to slice area aggregation \(#8291\)

The Slices area-selection aggregation tab exposes a Category column in
its datagrid schema, but the SQL tables backing it never selected
`category`. Grouping by \(or filtering/showing\) Category therefore failed
with:

```
error: no such column: base.category
```

This threads `category` through the source dataset schema \(so it
survives the interval intersection in `createIITable`\), the coalesced
slice table and the final aggregation table.

Reported in #1340.")[#8291](https://github.com/google/perfetto/pull/8291)[)](https://github.com/google/perfetto/commit/15010533b275181cdd593027908704369d1c99b5 "ui: Add missing category column to slice area aggregation \(#8291\)

The Slices area-selection aggregation tab exposes a Category column in
its datagrid schema, but the SQL tables backing it never selected
`category`. Grouping by \(or filtering/showing\) Category therefore failed
with:

```
error: no such column: base.category
```

This threads `category` through the source dataset schema \(so it
survives the interval intersection in `createIITable`\), the coalesced
slice table and the final aggregation table.

Reported in #1340.")  | Oct 28, 2026  |  
|   |   |  [bazel: upgrade to bazel 8 and migrate to fully bzlmod based setup (](https://github.com/google/perfetto/commit/24e524ce6fd82fa0d5423e0aeb4f7e42126182f6 "bazel: upgrade to bazel 8 and migrate to fully bzlmod based setup \(#4108\)

This CL uprevs us to the latest version of Bazel and switches us over to
a full bzlmod setup. bzlmod is the only way to build with Bazel 8,
WORKSPACE based building is not supported and is already bit-rotting in
many places.

Keep the perfetto_deps\(\) fallback for anyone still using workspace based
usage of Perfetto but ideally they would also need to switch to bzlmod
on new versions of Perfetto.")[#4108](https://github.com/google/perfetto/pull/4108)  | Dec 17, 2025  |  
|   |   |  [bazel: upgrade rules_android to fix Dalvik downloads (](https://github.com/google/perfetto/commit/2a9c760a2bcaa51f5dd7d8097bea87812775e93a "bazel: upgrade rules_android to fix Dalvik downloads \(#7686\)

Bazel builds are failing due to 503 for the Dalvik archive download.
Upgrade rules_android to 0.7.3, which uses the Bazel mirror with a
pinned checksum, and refresh the lockfile.

Uprev the language used to Java 21 for the tool side because new
rules_android uses records.

Upstream report: https://github.com/bazelbuild/rules_android/issues/465")[#7686](https://github.com/google/perfetto/pull/7686)[)](https://github.com/google/perfetto/commit/2a9c760a2bcaa51f5dd7d8097bea87812775e93a "bazel: upgrade rules_android to fix Dalvik downloads \(#7686\)

Bazel builds are failing due to 503 for the Dalvik archive download.
Upgrade rules_android to 0.7.3, which uses the Bazel mirror with a
pinned checksum, and refresh the lockfile.

Uprev the language used to Java 21 for the tool side because new
rules_android uses records.

Upstream report: https://github.com/bazelbuild/rules_android/issues/465")  | Sep 29, 2026  |  
|   |   |  [bazel: upgrade to bazel 8 and migrate to fully bzlmod based setup (](https://github.com/google/perfetto/commit/24e524ce6fd82fa0d5423e0aeb4f7e42126182f6 "bazel: upgrade to bazel 8 and migrate to fully bzlmod based setup \(#4108\)

This CL uprevs us to the latest version of Bazel and switches us over to
a full bzlmod setup. bzlmod is the only way to build with Bazel 8,
WORKSPACE based building is not supported and is already bit-rotting in
many places.

Keep the perfetto_deps\(\) fallback for anyone still using workspace based
usage of Perfetto but ideally they would also need to switch to bzlmod
on new versions of Perfetto.")[#4108](https://github.com/google/perfetto/pull/4108)  | Dec 17, 2025  |  
|   |   | [Perfetto: first commit. Introduce build files](https://github.com/google/perfetto/commit/ae2879e9cc05e716a208420e238d9980016a5981 "Perfetto: first commit. Introduce build files

This CL sets up the directory structure, build files and
README for Perfetto. The build files are complete enough
to build a hello-world unittest, gtest, gmock and protobuf
from Linux and Mac OSX without depending on any external
tool. This will allow to build the project without a full
Android checkouot and hence being able to get test coverage
on other waterfalls \(Chrome, Travis CI\) and with a larger
set of compiler toolchains.
The plan is to generate Android.bp build files in the
next CLs to build the same targets also from the Android tree.

Change-Id: I7a15dcfdb24d5f857fc8c3a70757745741b92545")  | Sep 27, 2017  |  
|   |   | [tp: make all global counter tracks have a group](https://github.com/google/perfetto/commit/4f658e3b30bb064b34a2c743bb2d2d1cc8b812f1 "tp: make all global counter tracks have a group

This prevents the explosion of top level counter tracks which we've
observed recently.

Change-Id: Ic38583b00c1091ca12a42d0f6dbca37e154fd119")  | May 2, 2023  |  
|   |   | [ui: Git blame - ignore prettier & eslint formatting commits](https://github.com/google/perfetto/commit/1769343f09d1318622ff22583017e3092c6a57e3 "ui: Git blame - ignore prettier & eslint formatting commits

Change-Id: Ie7374f8395bfa36c46660cd9b61ebe87d788c231")  | Mar 18, 2024  |  
|   |   |  [CI: revive ci.perfetto.dev (](https://github.com/google/perfetto/commit/432dc503b35623a26b483d7bbfa89e1256c33e17 "CI: revive ci.perfetto.dev \(#1237\)

Turn it into a frontend for github")[#1237](https://github.com/google/perfetto/pull/1237)[)](https://github.com/google/perfetto/commit/432dc503b35623a26b483d7bbfa89e1256c33e17 "CI: revive ci.perfetto.dev \(#1237\)

Turn it into a frontend for github")  | Apr 10, 2025  |  
|   |   |  [tp: migrate PerfettoSQL parser to syntaqlite (](https://github.com/google/perfetto/commit/b811f204487042ebb779b8ae6d9a6654478a4689 "tp: migrate PerfettoSQL parser to syntaqlite \(#5445\)

Replaces the handrolled Lemon grammar under `perfetto_sql/grammar/`
and the vendored-SQLite-based tokenizer in
`perfetto_sql/tokenizer/tokenize_internal.c` with the standalone
syntaqlite parser \(pulled in via `buildtools/syntaqlite`\).

`PerfettoSqlParser` now walks the syntaqlite AST for PerfettoSQL
statements \(`CREATE PERFETTO {TABLE,VIEW,FUNCTION,MACRO,INDEX}`,
`INCLUDE PERFETTO MODULE`, etc.\) instead of its own recursive-descent
code, and defers to SQLite for everything else.

The legacy preprocessor is retained as-is on this PR; killing it is
stacked on top in #5472.

Codegen tooling moves from `tools/update_sql_parsers.py` to
`tools/gen_syntaqlite_parser`.")[#5445](https://github.com/google/perfetto/pull/5445)[)](https://github.com/google/perfetto/commit/b811f204487042ebb779b8ae6d9a6654478a4689 "tp: migrate PerfettoSQL parser to syntaqlite \(#5445\)

Replaces the handrolled Lemon grammar under `perfetto_sql/grammar/`
and the vendored-SQLite-based tokenizer in
`perfetto_sql/tokenizer/tokenize_internal.c` with the standalone
syntaqlite parser \(pulled in via `buildtools/syntaqlite`\).

`PerfettoSqlParser` now walks the syntaqlite AST for PerfettoSQL
statements \(`CREATE PERFETTO {TABLE,VIEW,FUNCTION,MACRO,INDEX}`,
`INCLUDE PERFETTO MODULE`, etc.\) instead of its own recursive-descent
code, and defers to SQLite for everything else.

The legacy preprocessor is retained as-is on this PR; killing it is
stacked on top in #5472.

Codegen tooling moves from `tools/update_sql_parsers.py` to
`tools/gen_syntaqlite_parser`.")  | Apr 20, 2026  |  
|   |   |   | Sep 8, 2026  |  
| [Use python3 for GN actions.](https://github.com/google/perfetto/commit/e1b9f409e1bc85f1c9de20b71f279eb12c39c721 "Use python3 for GN actions.

Change-Id: Id0d49d9415a4af0d86c87a6c760c00387b2ec781")  | Apr 19, 2021  |  
|   |   |   | Apr 19, 2023  |  
|   |   |  [perfetto: add agents symlink (](https://github.com/google/perfetto/commit/ef9a24c4b9736a7feb3e34b1735032ba5836cc9c "perfetto: add agents symlink \(#7746\)")[#7746](https://github.com/google/perfetto/pull/7746)[)](https://github.com/google/perfetto/commit/ef9a24c4b9736a7feb3e34b1735032ba5836cc9c "perfetto: add agents symlink \(#7746\)")  | Oct 2, 2026  |  
|   |   |  [tp: add an EmptySource to the executor (](https://github.com/google/perfetto/commit/f9efede90541fb517398eb765b614ce67214b9d4 "tp: add an EmptySource to the executor \(#8293\)

**Why**

The dataframe planner knows some conditions match no rows, such as IS
NULL on a column with no nulls. The executor needs a source for these
plans.

**Changes**

- `EmptySource` produces no batches. Operators after it still finish,
  so an aggregate without keys still outputs a row.

**Testing**

- Unit test that operators after it finish on every run.")[#8293](https://github.com/google/perfetto/pull/8293)[)](https://github.com/google/perfetto/commit/f9efede90541fb517398eb765b614ce67214b9d4 "tp: add an EmptySource to the executor \(#8293\)

**Why**

The dataframe planner knows some conditions match no rows, such as IS
NULL on a column with no nulls. The executor needs a source for these
plans.

**Changes**

- `EmptySource` produces no batches. Operators after it still finish,
  so an aggregate without keys still outputs a row.

**Testing**

- Unit test that operators after it finish on every run.")  | Oct 28, 2026  |  
|   |   |  [tp: add dump_process_metadata to AndroidProcessStateConfig (](https://github.com/google/perfetto/commit/f0e69ecb45b59faaf5ea0fbf67b41ade51a3579f "tp: add dump_process_metadata to AndroidProcessStateConfig \(#7352\)

Add AndroidProcessStateConfig proto and wire it into DataSourceConfig
\(field 145\) for the "android.process_state" data source.

This flag allows omitting process metadata \(process name, start time,
start seq id\) from process state snapshots by default to save bandwidth,
while allowing clients to enable it if ftrace is not used.")[#7352](https://github.com/google/perfetto/pull/7352)[)](https://github.com/google/perfetto/commit/f0e69ecb45b59faaf5ea0fbf67b41ade51a3579f "tp: add dump_process_metadata to AndroidProcessStateConfig \(#7352\)

Add AndroidProcessStateConfig proto and wire it into DataSourceConfig
\(field 145\) for the "android.process_state" data source.

This flag allows omitting process metadata \(process name, start time,
start seq id\) from process state snapshots by default to save bandwidth,
while allowing clients to enable it if ftrace is not used.")  | Sep 8, 2026  |  
|   |   |  [tp: add an EmptySource to the executor (](https://github.com/google/perfetto/commit/f9efede90541fb517398eb765b614ce67214b9d4 "tp: add an EmptySource to the executor \(#8293\)

**Why**

The dataframe planner knows some conditions match no rows, such as IS
NULL on a column with no nulls. The executor needs a source for these
plans.

**Changes**

- `EmptySource` produces no batches. Operators after it still finish,
  so an aggregate without keys still outputs a row.

**Testing**

- Unit test that operators after it finish on every run.")[#8293](https://github.com/google/perfetto/pull/8293)[)](https://github.com/google/perfetto/commit/f9efede90541fb517398eb765b614ce67214b9d4 "tp: add an EmptySource to the executor \(#8293\)

**Why**

The dataframe planner knows some conditions match no rows, such as IS
NULL on a column with no nulls. The executor needs a source for these
plans.

**Changes**

- `EmptySource` produces no batches. Operators after it still finish,
  so an aggregate without keys still outputs a row.

**Testing**

- Unit test that operators after it finish on every run.")  | Oct 28, 2026  |  
|   |   |  [tp: add wattson plugin for compressed curve data (](https://github.com/google/perfetto/commit/c44bc4b4f46d8c39f13470105e69dc8bd2280f4f "tp: add wattson plugin for compressed curve data \(#5611\)

Replaces ~315 KB of stdlib SQL `VALUES` rows with a new plugin under
`src/trace_processor/plugins/wattson/` that ships per-\(device,
curve_type\) data as 5 zlib-compressed C++ blobs \(~35 KB total\). The five
`wattson.curves.*` stdlib modules become one-line wrappers over new
`_wattson_curves_*\(\)` table functions registered by the plugin.

Also adds `AdhocDataframeBuilderOptions::emit_auto_id` so callers that
supply their own primary key \(like `StaticTableFunctionModule`'s
synthetic `_auto_id`\) can opt out of the implicit column.

All 21 `Wattson*` diff tests pass.

## Stack
- #5610 — `perfetto: add perfetto_cpp_blob_header codegen primitive`
- **#5611 — this PR**")[#5611](https://github.com/google/perfetto/pull/5611)[)](https://github.com/google/perfetto/commit/c44bc4b4f46d8c39f13470105e69dc8bd2280f4f "tp: add wattson plugin for compressed curve data \(#5611\)

Replaces ~315 KB of stdlib SQL `VALUES` rows with a new plugin under
`src/trace_processor/plugins/wattson/` that ships per-\(device,
curve_type\) data as 5 zlib-compressed C++ blobs \(~35 KB total\). The five
`wattson.curves.*` stdlib modules become one-line wrappers over new
`_wattson_curves_*\(\)` table functions registered by the plugin.

Also adds `AdhocDataframeBuilderOptions::emit_auto_id` so callers that
supply their own primary key \(like `StaticTableFunctionModule`'s
synthetic `_auto_id`\) can opt out of the implicit column.

All 21 `Wattson*` diff tests pass.

## Stack
- #5610 — `perfetto: add perfetto_cpp_blob_header codegen primitive`
- **#5611 — this PR**")  | Apr 29, 2026  |  
|   |   |  [tools: roll GN to latest revision (2574 / 127dd2a6d582) (](https://github.com/google/perfetto/commit/1641c14a5864025f9f975426b843257142228905 "tools: roll GN to latest revision \(2574 / 127dd2a6d582\) \(#7492\)

Update GN in tools/install-build-deps from 1968 \(0725d782\) to 2574
\(git_revision:127dd2a6d582528d6d61c4d838dc17385ef31abd\) directly from
chrome-infra-packages \(CIPD\) across all supported host platforms, and
reformat all .gn and .gni files in the repository with the updated
binary.

Why this is needed:
- Upstream GN CL https://gn-review.googlesource.com/c/gn/+/25621 updated
`gn format` to always insert a blank line before target declarations.
- Chromium CL
https://chromium-review.googlesource.com/c/chromium/src/+/8350948 ran
the updated `gn format` across all Chromium build files, adding a blank
line between `import\(...\)` and `perfetto_sql_source_set\(...\)` in
`base/tracing/stdlib/chrome/BUILD.gn`.
- Perfetto's older pinned 2022 GN binary \(1968 / 0725d782\) formatted
that file without the blank line, causing Copybara imports \(#7473\) to
fail `tools/run_presubmit`.

CHROME_STDLIB_MANUAL_ROLL=Reformat BUILD.gn with updated GN")[#7492](https://github.com/google/perfetto/pull/7492)[)](https://github.com/google/perfetto/commit/1641c14a5864025f9f975426b843257142228905 "tools: roll GN to latest revision \(2574 / 127dd2a6d582\) \(#7492\)

Update GN in tools/install-build-deps from 1968 \(0725d782\) to 2574
\(git_revision:127dd2a6d582528d6d61c4d838dc17385ef31abd\) directly from
chrome-infra-packages \(CIPD\) across all supported host platforms, and
reformat all .gn and .gni files in the repository with the updated
binary.

Why this is needed:
- Upstream GN CL https://gn-review.googlesource.com/c/gn/+/25621 updated
`gn format` to always insert a blank line before target declarations.
- Chromium CL
https://chromium-review.googlesource.com/c/chromium/src/+/8350948 ran
the updated `gn format` across all Chromium build files, adding a blank
line between `import\(...\)` and `perfetto_sql_source_set\(...\)` in
`base/tracing/stdlib/chrome/BUILD.gn`.
- Perfetto's older pinned 2022 GN binary \(1968 / 0725d782\) formatted
that file without the blank line, causing Copybara imports \(#7473\) to
fail `tools/run_presubmit`.

CHROME_STDLIB_MANUAL_ROLL=Reformat BUILD.gn with updated GN")  | Sep 18, 2026  |  
|   |   |  [perfetto: backport v59.0 and v59.1 CHANGELOG cuts to main (](https://github.com/google/perfetto/commit/b1c4878721f67c71ae6998b66e976fd490ca8d63 "perfetto: backport v59.0 and v59.1 CHANGELOG cuts to main \(#8290\)

The v59.0 \(#8207\) and v59.1 \(#8226\) CHANGELOG cuts only landed on
canary,
leaving main with everything still under "Unreleased". Bring main in
line
with canary so no changes exist on canary that aren't on main.

The v59.1 and v59.0 sections are copied verbatim from canary. Entries
for
changes that landed on main after the canary cut \(16a2abddb8\) stay under
"Unreleased"; the two v59.0 entries that main had since extended
\(hideStatusbar route arg, Android Java SDK dropped events\) are split so
the
newer parts are listed as separate Unreleased entries.

The LUCI build fixes cherry-picked to canary in #8225 are already on
main
as #8213 and #8221.")[#8290](https://github.com/google/perfetto/pull/8290)[)](https://github.com/google/perfetto/commit/b1c4878721f67c71ae6998b66e976fd490ca8d63 "perfetto: backport v59.0 and v59.1 CHANGELOG cuts to main \(#8290\)

The v59.0 \(#8207\) and v59.1 \(#8226\) CHANGELOG cuts only landed on
canary,
leaving main with everything still under "Unreleased". Bring main in
line
with canary so no changes exist on canary that aren't on main.

The v59.1 and v59.0 sections are copied verbatim from canary. Entries
for
changes that landed on main after the canary cut \(16a2abddb8\) stay under
"Unreleased"; the two v59.0 entries that main had since extended
\(hideStatusbar route arg, Android Java SDK dropped events\) are split so
the
newer parts are listed as separate Unreleased entries.

The LUCI build fixes cherry-picked to canary in #8225 are already on
main
as #8213 and #8221.")  | Oct 26, 2026  |  
|   |   |  [Add mayzneranna to external contributors (](https://github.com/google/perfetto/commit/6e80d80ce34e00e072df6576d9afd176a50330bc "Add mayzneranna to external contributors \(#5688\)")[#5688](https://github.com/google/perfetto/pull/5688)[)](https://github.com/google/perfetto/commit/6e80d80ce34e00e072df6576d9afd176a50330bc "Add mayzneranna to external contributors \(#5688\)")  | May 1, 2026  |  
|   |   | [Add buganizer component ID to DIR_METADATA](https://github.com/google/perfetto/commit/56a7149ec6d45f07e5a8e5b158d0b56b50537f72 "Add buganizer component ID to DIR_METADATA

Bug: chromium:341800538
Change-Id: I09eda17aece57f6a1a7cbec7d138fc0f65f283ee")  | Nov 18, 2024  |  
|   |   |  [tools: move pfsql out of trace processor (](https://github.com/google/perfetto/commit/37aabef7286f6406c0fa1488235cacd13334fe30 "tools: move pfsql out of trace processor \(#7218\)

Move pfsql into src/tools and extract the reusable PerfettoSQL
parser and intrinsic macro expansion code into src/perfetto_sql.
This keeps offline SQL analysis separate from the Trace Processor
runtime while allowing both consumers to share the language frontend.

Add a presubmit check that prevents targets outside
src/trace_processor from depending on Trace Processor internals.
Dependencies on src/trace_processor/util and explicitly grandfathered
existing edges remain allowed.")[#7218](https://github.com/google/perfetto/pull/7218)[)](https://github.com/google/perfetto/commit/37aabef7286f6406c0fa1488235cacd13334fe30 "tools: move pfsql out of trace processor \(#7218\)

Move pfsql into src/tools and extract the reusable PerfettoSQL
parser and intrinsic macro expansion code into src/perfetto_sql.
This keeps offline SQL analysis separate from the Trace Processor
runtime while allowing both consumers to share the language frontend.

Add a presubmit check that prevents targets outside
src/trace_processor from depending on Trace Processor internals.
Dependencies on src/trace_processor/util and explicitly grandfathered
existing edges remain allowed.")  | Aug 25, 2026  |  
|   |   | [Add METADATA to perfetto: Apache2=NOTICE](https://github.com/google/perfetto/commit/4c887a6475f7345257b5fbf8477232bc8ff2f24a "Add METADATA to perfetto: Apache2=NOTICE

Bug: 68860345
Bug: 69058154
Bug: 151953481

Test: no code changes
Change-Id: I700cb1adec8d0f919d21cd43aa9cde15293087ce")  | Apr 29, 2020  |  
|   |   |  [bazel: upgrade rules_android to fix Dalvik downloads (](https://github.com/google/perfetto/commit/2a9c760a2bcaa51f5dd7d8097bea87812775e93a "bazel: upgrade rules_android to fix Dalvik downloads \(#7686\)

Bazel builds are failing due to 503 for the Dalvik archive download.
Upgrade rules_android to 0.7.3, which uses the Bazel mirror with a
pinned checksum, and refresh the lockfile.

Uprev the language used to Java 21 for the tool side because new
rules_android uses records.

Upstream report: https://github.com/bazelbuild/rules_android/issues/465")[#7686](https://github.com/google/perfetto/pull/7686)[)](https://github.com/google/perfetto/commit/2a9c760a2bcaa51f5dd7d8097bea87812775e93a "bazel: upgrade rules_android to fix Dalvik downloads \(#7686\)

Bazel builds are failing due to 503 for the Dalvik archive download.
Upgrade rules_android to 0.7.3, which uses the Bazel mirror with a
pinned checksum, and refresh the lockfile.

Uprev the language used to Java 21 for the tool side because new
rules_android uses records.

Upstream report: https://github.com/bazelbuild/rules_android/issues/465")  | Sep 29, 2026  |  
|   |   |  [bazel: upgrade rules_android to fix Dalvik downloads (](https://github.com/google/perfetto/commit/2a9c760a2bcaa51f5dd7d8097bea87812775e93a "bazel: upgrade rules_android to fix Dalvik downloads \(#7686\)

Bazel builds are failing due to 503 for the Dalvik archive download.
Upgrade rules_android to 0.7.3, which uses the Bazel mirror with a
pinned checksum, and refresh the lockfile.

Uprev the language used to Java 21 for the tool side because new
rules_android uses records.

Upstream report: https://github.com/bazelbuild/rules_android/issues/465")[#7686](https://github.com/google/perfetto/pull/7686)[)](https://github.com/google/perfetto/commit/2a9c760a2bcaa51f5dd7d8097bea87812775e93a "bazel: upgrade rules_android to fix Dalvik downloads \(#7686\)

Bazel builds are failing due to 503 for the Dalvik archive download.
Upgrade rules_android to 0.7.3, which uses the Bazel mirror with a
pinned checksum, and refresh the lockfile.

Uprev the language used to Java 21 for the tool side because new
rules_android uses records.

Upstream report: https://github.com/bazelbuild/rules_android/issues/465")  | Sep 29, 2026  |  
|   |   |   | Nov 16, 2017  |  
|   |   |   | Jul 6, 2026  |  
|   |   |  [perfetto: switch to distributed github owner files (](https://github.com/google/perfetto/commit/59ee46f40e21df0858c1f81ddd5f2f6ffbeefa8d "perfetto: switch to distributed github owner files \(#3723\)

This CL implements the flow described in \[1\]. It makes it possible to
maintain owners files without needing to touch the central CODEOWNERS
file.

A PR with update is sent every Monday, Wednesday and Friday.

\[1\] https://github.com/google/perfetto/pull/3447#issuecomment-3462769450

CHROME_STDLIB_MANUAL_ROLL=intentional change, copybara change in
cl/833999390")[#3723](https://github.com/google/perfetto/pull/3723)[)](https://github.com/google/perfetto/commit/59ee46f40e21df0858c1f81ddd5f2f6ffbeefa8d "perfetto: switch to distributed github owner files \(#3723\)

This CL implements the flow described in \[1\]. It makes it possible to
maintain owners files without needing to touch the central CODEOWNERS
file.

A PR with update is sent every Monday, Wednesday and Friday.

\[1\] https://github.com/google/perfetto/pull/3447#issuecomment-3462769450

CHROME_STDLIB_MANUAL_ROLL=intentional change, copybara change in
cl/833999390")  | Nov 19, 2025  |  
| [PerfettoIntegrationTests.xml](https://github.com/google/perfetto/blob/main/PerfettoIntegrationTests.xml "PerfettoIntegrationTests.xml")  | [PerfettoIntegrationTests.xml](https://github.com/google/perfetto/blob/main/PerfettoIntegrationTests.xml "PerfettoIntegrationTests.xml")  | [Run perfetto_integrationtests from /data/local/tests.](https://github.com/google/perfetto/commit/ab23f44a92b86780ca566af84ad44d622cb6c023 "Run perfetto_integrationtests from /data/local/tests.

This way they get labeled as shell_test_data_file rather than
shell_data_file. That lets us grant more fine-grained SELinux
permissions that are restricted to tests.

Also, the plan is to make this the default path in the long run,
see https://android.googlesource.com/platform/build/soong/+/3b933d31657253e547caab38ef151c7d0e08856d/cc/test.go#349


Test: HEAPPROFD_TEST_PROFILE_OUT=/data/local/tmp ./perfetto_integrationtests/arm64/perfetto_integrationtests --gtest_filter='Run/HeapprofdEndToEnd.*'
      verify profile has proper symbols
Change-Id: I3fd590e8a0ea4b22720853ad24a0cd0f19f49353")  | Feb 9, 2021  |  
|   |   |  [Update README.chromium to include Update Mechanism (](https://github.com/google/perfetto/commit/38b6b320958a2b6d4614ff598e1077c48578d8ab "Update README.chromium to include Update Mechanism \(#5108\)

Update Mechanism is now a required field
https://chromium.googlesource.com/chromium/src/+/main/docs/adding_to_third_party.md?pli=1#update-mechanism


Setting version to N/A as per the template instructions
https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/README.chromium.template")[#5108](https://github.com/google/perfetto/pull/5108)[)](https://github.com/google/perfetto/commit/38b6b320958a2b6d4614ff598e1077c48578d8ab "Update README.chromium to include Update Mechanism \(#5108\)

Update Mechanism is now a required field
https://chromium.googlesource.com/chromium/src/+/main/docs/adding_to_third_party.md?pli=1#update-mechanism


Setting version to N/A as per the template instructions
https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/README.chromium.template")  | Mar 13, 2026  |  
|   |   |   | Nov 7, 2025  |  
|   |   |  [Revert CtsPerfettoBootTimeTraceHostTestCases (](https://github.com/google/perfetto/commit/aefd868b3f5bb39c7ce2b1f5bf6d5ebd317e08dd "Revert CtsPerfettoBootTimeTraceHostTestCases \(#4036\)

reverts PR:

- go/pgh/3923

- go/pgh/3988

CTS failures b/465871343")[#4036](https://github.com/google/perfetto/pull/4036)[)](https://github.com/google/perfetto/commit/aefd868b3f5bb39c7ce2b1f5bf6d5ebd317e08dd "Revert CtsPerfettoBootTimeTraceHostTestCases \(#4036\)

reverts PR:

- go/pgh/3923

- go/pgh/3988

CTS failures b/465871343")  | Dec 8, 2025  |  
|   |   |  [bazel: upgrade to bazel 8 and migrate to fully bzlmod based setup (](https://github.com/google/perfetto/commit/24e524ce6fd82fa0d5423e0aeb4f7e42126182f6 "bazel: upgrade to bazel 8 and migrate to fully bzlmod based setup \(#4108\)

This CL uprevs us to the latest version of Bazel and switches us over to
a full bzlmod setup. bzlmod is the only way to build with Bazel 8,
WORKSPACE based building is not supported and is already bit-rotting in
many places.

Keep the perfetto_deps\(\) fallback for anyone still using workspace based
usage of Perfetto but ideally they would also need to switch to bzlmod
on new versions of Perfetto.")[#4108](https://github.com/google/perfetto/pull/4108)  | Dec 17, 2025  |  
|   |   | [Replace writepid with task_profiles command for cgroup migration](https://github.com/google/perfetto/commit/a08f53bc59b30d83041038a47c80a36baabec99b "Replace writepid with task_profiles command for cgroup migration

writepid command usage to join a cgroup has been deprecated in favor
of a more flexible approach using task_profiles. This way cgroup path
is not hardcoded and cgroup changes can be easily made. Replace
writepid with task_profiles command to migrate between cgroups.

Bug: 191283136
Test: build and boot
Signed-off-by: Suren Baghdasaryan <surenb@google.com>
Change-Id: I990015c5b1dcb66855f036ca0c74508143f3b19a")  | Jun 23, 2021  |  
|   |   |   | Jun 18, 2024  |  
|   |   |  [perfetto.rc: set user statsd for perfetto_upload_after_reboot (](https://github.com/google/perfetto/commit/8d16d93eca7ea083bd66520bb0f0f3bef16c1eed "perfetto.rc: set user statsd for perfetto_upload_after_reboot \(#8003\)

What
---
Currently we are successfully recovering and uploading reboot traces
from field trace.
However, no statsd atom is reported from the
`perfetto_upload_after_reboot` service.

Why
---
Previously the service had `user shell`.
When uploading the traces, `system_server` allows traces from `user
shell`, so traces are uploaded.
But `statsd` does not include `user shell` in its allowed_log_source, so
those atoms are skipped by statsd.
```
$ adb shell dumpsys stats --metadata | grep -E "allowed source"
 allowed source:0 1000 1001 1002 1003 1027 1066 1067 1068 1069 1073 10130 10178 10201 10204 10214 10220 10295 10316 10322 10349 10356 10368 10370
# shell \(2000\) is not listed, statsd\(1066\) is 
```

Fix
---
set `user statsd` to be authenticated by statsd while pushing the atoms.

Verify
---
```
# 229 is proto number for `PerfettoUploaded`
# Before \(running as user shell / uid=2000\): all 3 recovery atoms are skipped
$ adb shell start perfetto_upload_after_reboot
$ adb shell dumpsys stats --metadata | grep "Atom 229->"
Atom 229->\(total count\)19, \(error count\)0, \(drop count\)0, \(skip count\)16 \(peak rate\)6

# After \(running as user statsd / uid=1066\): total count increases while skip count stays unchanged
$ adb shell "su statsd,shell /system/bin/perfetto --upload-after-reboot"
$ adb shell dumpsys stats --metadata | grep "Atom 229->"
Atom 229->\(total count\)25, \(error count\)0, \(drop count\)0, \(skip count\)16 \(peak rate\)6
```

Note: this will not create any issue for the persistent file since now
it's permission is set to `0666`,
user statsd \(with group shell\) can access and unlink it.

Bug: b/382209797#comment26
Test: statsd atoms and persistent trace lifecycle events are logged")[#8003](https://github.com/google/perfetto/pull/8003)[)](https://github.com/google/perfetto/commit/8d16d93eca7ea083bd66520bb0f0f3bef16c1eed "perfetto.rc: set user statsd for perfetto_upload_after_reboot \(#8003\)

What
---
Currently we are successfully recovering and uploading reboot traces
from field trace.
However, no statsd atom is reported from the
`perfetto_upload_after_reboot` service.

Why
---
Previously the service had `user shell`.
When uploading the traces, `system_server` allows traces from `user
shell`, so traces are uploaded.
But `statsd` does not include `user shell` in its allowed_log_source, so
those atoms are skipped by statsd.
```
$ adb shell dumpsys stats --metadata | grep -E "allowed source"
 allowed source:0 1000 1001 1002 1003 1027 1066 1067 1068 1069 1073 10130 10178 10201 10204 10214 10220 10295 10316 10322 10349 10356 10368 10370
# shell \(2000\) is not listed, statsd\(1066\) is 
```

Fix
---
set `user statsd` to be authenticated by statsd while pushing the atoms.

Verify
---
```
# 229 is proto number for `PerfettoUploaded`
# Before \(running as user shell / uid=2000\): all 3 recovery atoms are skipped
$ adb shell start perfetto_upload_after_reboot
$ adb shell dumpsys stats --metadata | grep "Atom 229->"
Atom 229->\(total count\)19, \(error count\)0, \(drop count\)0, \(skip count\)16 \(peak rate\)6

# After \(running as user statsd / uid=1066\): total count increases while skip count stays unchanged
$ adb shell "su statsd,shell /system/bin/perfetto --upload-after-reboot"
$ adb shell dumpsys stats --metadata | grep "Atom 229->"
Atom 229->\(total count\)25, \(error count\)0, \(drop count\)0, \(skip count\)16 \(peak rate\)6
```

Note: this will not create any issue for the persistent file since now
it's permission is set to `0666`,
user statsd \(with group shell\) can access and unlink it.

Bug: b/382209797#comment26
Test: statsd atoms and persistent trace lifecycle events are logged")  | Oct 25, 2026  |  
|   |   |  [perfetto: remove the launched use_unix_socket_inotify aconfig flag (](https://github.com/google/perfetto/commit/498f4f4d68ea2eeb7715ed212b304e48362f96fe "perfetto: remove the launched use_unix_socket_inotify aconfig flag \(#7971\)

The `perfetto.flags.use_unix_socket_inotify` flag is fully launched and
eligible for cleanup \(Gantry: Standard Trunk Stable read-only launch\).

Remove its aconfig declaration and the non-Android fallback macro, and
have `WatchUnixSocketCreation\(\)` check the GN buildflag
`PERFETTO_ENABLE_SOCK_INOTIFY` directly. That buildflag already carried
the value for non-Android builds and is set to 1 in the checked-in
Android build config, so behaviour is unchanged on every platform;
chromium, where inotify is blocked by the sandbox, keeps it disabled via
`enable_perfetto_sock_inotify`.

Verified: no remaining references to the flag; `perfetto_unittests`
\(`UnixSocketTest.*`\), `traced`, `traced_probes` and `perfetto` build.

Bug: 556149051")[#…](https://github.com/google/perfetto/pull/7971)  | Oct 16, 2026  |  
|   |   |  [persistent_cfg: drop instead of stall for sf ProtoVM layers (](https://github.com/google/perfetto/commit/0e862b34dc535750f47eb7e30195b1eaeed15841 "persistent_cfg: drop instead of stall for sf ProtoVM layers \(#8142\)

Sets buffer_exhausted_policy: BUFFER_EXHAUSTED_DROP on the MODE_PROTOVM
android.surfaceflinger.layers source. SurfaceFlinger writes ProtoVM
patches from its main thread, so the default stall-then-drop policy
blocks that thread when its shared memory buffer is full. With drop,
SurfaceFlinger skips patches for 30 s and then writes one full-state
patch. SurfaceFlinger builds without a configurable policy ignore the
field.")[#8142](https://github.com/google/perfetto/pull/8142)[)](https://github.com/google/perfetto/commit/0e862b34dc535750f47eb7e30195b1eaeed15841 "persistent_cfg: drop instead of stall for sf ProtoVM layers \(#8142\)

Sets buffer_exhausted_policy: BUFFER_EXHAUSTED_DROP on the MODE_PROTOVM
android.surfaceflinger.layers source. SurfaceFlinger writes ProtoVM
patches from its main thread, so the default stall-then-drop policy
blocks that thread when its shared memory buffer is full. With drop,
SurfaceFlinger skips patches for 30 s and then writes one full-state
patch. SurfaceFlinger builds without a configurable policy ignore the
field.")  | Oct 21, 2026  |  
|   |   |  [tperf: android: add capability for direct /proc/pid/[s]maps access (](https://github.com/google/perfetto/commit/b24facb29cb65bc9736ae8378151d0a49bc48c82 "tperf: android: add capability for direct /proc/pid/\[s\]maps access \(#7510\)

Also make traced set the necessary sysprop to start traced_perf if there are
any "linux.smaps" data sources active, exactly as it currently does for the
perf data sources \(the daemon is only started when needed\).")[#…](https://github.com/google/perfetto/pull/7510)  | Sep 24, 2026  |  
| View all files |  
# Perfetto - System profiling, app tracing and trace analysis
Perfetto is an open-source suite of SDKs, daemons and tools which use **tracing** to help developers understand the behaviour of complex systems and root-cause functional and performance issues on client and embedded systems.
It is a production-grade tool that is the default tracing system for the **Android operating system** and the **Chromium browser**.
## Core Components
Perfetto is not a single tool, but a collection of components that work together:
  * **High-performance tracing daemons:** For capturing tracing information from many processes on a single machine into a unified trace file.
  * **Low-overhead tracing SDK:** A C++17 library for direct userspace-to-userspace tracing of timings and state changes in your application.
  * **Extensive OS-level probes:** For capturing system-wide context on Android and Linux (e.g. scheduling states, CPU frequencies, memory profiling, callstack sampling).
  * **Browser-based UI:** A powerful, fully local UI for visualizing and exploring large, multi-GB traces on a timeline. It works in all major browsers, requires no installation, and can open traces from other tools.
  * **SQL-based analysis library:** A powerful engine that allows you to programmatically query traces using SQL to automate analysis and extract custom metrics.


## Why Use Perfetto?
Perfetto was designed to be a versatile and powerful tracing system for a wide range of use cases.
  * **For Android App & Platform Developers:** Debug and root-cause functional and performance issues like slow startups, dropped frames (jank), animation glitches, low memory kills, and ANRs. Profile both Java/Kotlin and native C++ memory usage with heap dumps and profiles.
  * **For C/C++ Developers (Linux, macOS, Windows):** Use the [Tracing SDK](https://github.com/google/perfetto/blob/main/docs/instrumentation/tracing-sdk.md) to instrument your application with custom trace points to understand its execution flow, find performance bottlenecks, and debug complex behavior. On Linux, you can also perform detailed CPU and native heap profiling.
  * **For Linux Kernel & System Developers:** Get deep insights into kernel behavior. Perfetto acts as an efficient userspace daemon for `ftrace`, allowing you to visualize scheduling, syscalls, interrupts, and custom kernel tracepoints on a timeline.
  * **For Chromium Developers:** Perfetto is the tracing backend for `chrome://tracing`. Use it to debug and root-cause issues in the browser, V8, and Blink.
  * **For Performance Engineers & SREs:** Analyze and visualize a wide range of profiling and tracing formats, not just Perfetto's. Use the powerful SQL interface to programmatically analyze traces from tools like **Linux perf** , **macOS Instruments** , **Chrome JSON traces** , and more.


## Getting Started
We've designed our documentation to guide you to the right information as quickly as possible, whether you're a newcomer to performance analysis or an experienced developer.
  1. **New to tracing?** If you're unfamiliar with concepts like tracing and profiling, start here:
     * [**What is Tracing?**](https://perfetto.dev/docs/tracing-101) - A gentle introduction to the world of performance analysis.
  2. **Ready to dive in?** Our "Getting Started" guide is the main entry point for all users. It will help you find the right tutorials and documentation for your specific needs:
     * [**How do I start using Perfetto?**](https://perfetto.dev/docs/getting-started/start-using-perfetto) - Find your path based on your role and goals (e.g., Android App Developer, C/C++ Developer, etc.).
  3. **Want the full overview?** For a comprehensive look at what Perfetto is, why it's useful, and who uses it, see our main documentation page:
     * [**Perfetto Documentation Home**](https://perfetto.dev/docs/)


## Debian Distribution
For users interested in the Debian distribution of Perfetto, the official source of truth and packaging efforts are maintained at [Debian Perfetto Salsa Repository](https://salsa.debian.org/debian/perfetto)
## Community & Support
Have questions? Need help?
  * **[GitHub Discussions](https://github.com/google/perfetto/discussions/categories/q-a):** For Q&A and general discussions.
  * For bug reports.
  * For live chat with the community and developers.


We follow [Google's Open Source Community Guidelines](https://opensource.google/conduct/).
## About
Production-grade client-side tracing, profiling, and analysis for complex software systems.
**6.7k** stars
**81** watching
[ forks](https://github.com/google/perfetto/forks)
## 
[ Perfetto v59.1Latest Oct 27, 2026 ](https://github.com/google/perfetto/releases/tag/v59.1)
## 
## Languages
  * [C++54.3%](https://github.com/google/perfetto/search?l=c%2B%2B)
  * [TypeScript24.3%](https://github.com/google/perfetto/search?l=typescript)
  * [Python13%](https://github.com/google/perfetto/search?l=python)
  * [C3.4%](https://github.com/google/perfetto/search?l=c)
  * [Starlark1.4%](https://github.com/google/perfetto/search?l=starlark)
  * [SCSS1.2%](https://github.com/google/perfetto/search?l=scss)
  * [Other2.4%](https://github.com/google/perfetto/search?l=Other)


You can’t perform that action at this time. 
