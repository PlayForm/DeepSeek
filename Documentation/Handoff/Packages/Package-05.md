# Package 5 — THE DISCIPLINE & WORKING PROTOCOLS

> The operating manuals and the hard-earned agent protocols. Part of `Documentation/Handoff/` — see
> `../Overview.md`. The later sessions' working lessons are collected in [`../Lessons.md`](../Lessons.md).

## The skills (the operating manuals — READ them first in any session)

- `~/.dsh/skills/code-authoring/SKILL.md` — the tool discipline (content edits ONLY via write/edit;
  content reads ONLY via read/grep/glob; `rm` allowed as a command; terminal = builds/tests/metadata
  only; THE MECHANISM: terminal edits are invisible to the plugin system — [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) fires only
  on tool-layer writes) + §1b the GUARDIAN vision (the future programmatic enforcement: a
  tools/pre-execute guardian detecting terminal file-edit commands; Mode A surface-the-error; Mode B
  the silent rewrite flag — implementation deferred) + the atomized Rust-style writing conventions
  (one definition per file, nameless defaults, single-word PascalCase, switch(true), inlined
  single-use bindings).
- `~/.dsh/skills/plugin-development/SKILL.md` — the DSH plugin API contract
    - the 19-item pitfalls catalog (all live-verified; #17 carries the jobs REFUTATION).
- `~/.dsh/skills/task-routing/SKILL.md` — the model-routing policy (coder → glm-5.3-flash high;
  explorer → glm-5.3-flash low; main = deepseek-v4-flash max; pass provider/model/reasoning_effort
  explicitly).

## The agent protocols (learned the hard way)

1. **ONE FILE PER RESPONSE** — every coder agent prompt carries it; agents that batch die more
   often.
2. **The crash pattern** — agents die mid-flight with NO closing message (API request timeouts). The
   recovery: check the on-disk state (tsc first), relaunch with a RESUME prompt (read-first,
   complete-partial, finish-the-rest) or take over directly. THREE agents died and were recovered
   this way (pinner adoption, cargo adoption, pinner refactor, cargo refactor).
3. **The vacuously-green smoke trap** — a smoke whose fixture wiring is wrong can pass checks
   without exercising the code (the cargo smoke's `boot()` never assigned the listener — checks 1–12
   passed vacuously). When a smoke "passes but the world is weird", verify the harness wiring first.
4. **The rebuild-trap** — `grep -c X && build` silently skips the build when grep exits 1 (zero
   matches). Run builds as standalone commands.
5. **The ledger strings are the contract** — byte-identical everywhere; the smokes are the arbiter.
   Rename ONLY the mechanics, never the strings (the literal "cargo flavor" wording inside cargo's
   activation line is a string, not terminology).
