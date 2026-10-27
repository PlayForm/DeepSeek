---
title: SQL files - one statement per file, loaded beside its module
category: Plans
kind: queued-plan
date: 2026-10-27
status: planned
registry: Documentation/Plans/SQL-FILES-RFC.md
index: Documentation/INDEX.md
statuses:
    - name: the problem (SQL embedded in TypeScript)
      state: resolved
      evidence: section 1
    - name: the three loading mechanisms and the spike result
      state: resolved
      evidence: section 3 - the build-time mechanisms are rejected by evidence
    - name: the recommended mechanism (runtime read beside the built module)
      state: resolved
      evidence: section 4
    - name: the directory layout and the grouped views
      state: resolved
      evidence: section 5
    - name: the migration sequence per module
      state: resolved
      evidence: section 6
    - name: the acceptance checks
      state: resolved
      evidence: section 7
    - name: the implementation
      state: open
      evidence: section 8 - this RFC proposes; it does not build
---

# SQL files - one statement per file, loaded beside its module

> Every SQL statement in the plugin family currently lives inside a TypeScript template literal.
> That costs the reader syntax highlighting, the editor's SQL diagnostics, and the ability to
> comment a statement without the comment becoming a JavaScript comment; it costs the reviewer a
> diff that a TypeScript highlighter renders as one long string. This RFC proposes moving each
> statement into its own `.sql` file beside the module that runs it, loading it at run time, and
> grouping the views and the migrations by directory.

## 1. The problem

The cost ledger is the first package where SQL is a large share of the code rather than a
convenience: 144 SQL-bearing lines across 13 modules, with `Schema.ts` alone holding 53 (thirteen
tables, four views, the migration ladder).

Three costs follow from embedding it.

1. **The reader loses the language.** A `.ts` file renders `SELECT ... FROM ... JOIN` as a string.
   No highlighting, no bracket matching, no table or column completion, no `EXPLAIN`-shaped tooling.
2. **The comment belongs to the wrong language.** A `--` comment inside a template literal is SQL
   the database will parse; a `//` comment above it is TypeScript the database will never see. The
   two cannot be mixed cleanly, so the statement's own documentation lives outside the statement.
3. **The grouping is invisible.** The DDL is an ordered array, the views are four more array
   entries, the report queries are inline in a factory, and the migration rungs are three more
   arrays. Nothing on disk says "these are the views" or "this is the v2 to v3 rung".

## 2. The shape the refactor wants

```text
Source/Function/
  Sql/
    Table/          Price.sql, Call.sql, Touch.sql, ... one per table
    View/           FileCost.sql, ModelCost.sql, SessionCost.sql, ClientCost.sql, FileLifetime.sql
    Migration/      001-Base.sql, 002-Analytics.sql, 003-Factor.sql, 004-Telemetry.sql
    Query/          File.sql, Project.sql, Client.sql, Model.sql, Stages.sql, Edits.sql, ...
    Write/          InsertCall.sql, InsertTouch.sql, InsertEdit.sql, UpsertSession.sql, ...
  Schema.ts         the loader that reads Table/ in name order and View/ in name order
  Report.ts         the loader that reads Query/ by name
```

Each `.sql` file is one statement, its comments are SQL comments, and the directory is the grouping.
A file's name is its identifier: `View/FileCost.sql` is read by `Sql("View/FileCost")`.

## 3. The three mechanisms, and what the spike found

A spike was built on 2026-10-27 inside the package and deleted afterwards; its output is quoted here
because it decides the design.

### A. Build-time text import - rejected

`import Sql from "./Query.sql"` with `loader: { ".sql": "text" }` in the package's `ESBuild.ts`.

Result: `Target/Text.js` came out as `import o from"./Query.sql";var t=o;export{t as default};` -
the import survived as a runtime import, and Node failed with `Cannot find module .../Query.sql`.

Two independent reasons, both structural:

- **The family builds with `bundle: false`.** ESBuild transforms each source file in isolation and
  leaves every import external, so it never loads `Query.sql` and the `loader` key has nothing to
  act on. This is not a configuration mistake; it is the build's contract, and every package depends
  on it (each Source file becomes its own Target file).
- **The package's `plugins` array is replaced, not merged.** `@playform/build` merges the package
  config with `deepmergeIntoCustom({ mergeArrays: false })`, so the default `plugins: [Target]` wins
  and a resolver plugin written in the package is discarded. A second spike run with an
  `onResolve`/`onLoad` plugin confirmed it: the config's plain keys took effect (`outdir` moved the
  output, `banner` appeared), the plugin did not.

### B. Runtime read beside the built module - viable

`readFileSync(new URL("./Query.sql", import.meta.url), "utf8")` with the file copied into `Target`
by the package's `prepublishOnly.sh`.

Nothing in the build has to change: the copy is one line after the `Build` step, `package.json`
already ships `Target`, and the loader reads the file once per statement and caches the string. The
path is relative to the built module, so it works from `Target`, from a test run against `Target`,
and from an installed package.

The failure mode is a missing copy, which is loud and immediate (a named error naming the path) and
can be made impossible by a smoke that walks every `.sql` under `Source` and asserts its `Target`
twin exists.

### C. Codegen into a TypeScript barrel - viable fallback

A `Maintain` script reads `Source/Function/Sql/**/*.sql` and writes `Source/Variable/Sql.ts` with
one exported constant per statement, run as the first step of `prepublishOnly.sh` and checked in CI
by regenerating and diffing.

No runtime filesystem access, no copy step, no change to the build. The cost is a generated file in
the tree and a second thing to remember, and the diff of a generated barrel is exactly as unreadable
as the template literals it replaces - which is the original complaint, moved rather than solved.

## 4. The recommendation

**Mechanism B.** It satisfies the request literally (a file per statement, beside the module, loaded
dynamically), keeps one source of truth per statement, and needs no change to a build chain that
thirteen packages depend on. Mechanism C stays documented as the fallback if the copy step proves
fragile in the published package.

The loader is one module, `Source/Function/Sql.ts`:

```ts
export default (Name: string): string => {
	const Cached = Cache.get(Name);
	if (Cached !== undefined) return Cached;
	const Path = new URL(`./Sql/${Name}.sql`, import.meta.url);
	const Text = readFileSync(Path, "utf8");
	Cache.set(Name, Text);
	return Text;
};
```

The cache is module-scoped because the statements never change at run time; a missing file throws
`dsh-cost: missing SQL statement <Name> at <path>`, which names the copy step in the error.

## 5. The layout and the grouped views

- `Table/` holds one file per table in creation order, the order encoded in the file name
  (`001-Price.sql` ... `013-Cursor.sql`) so `Schema` reads the directory sorted rather than holding
  an array that can drift from the files.
- `View/` holds the views, grouped because a view is read by a report and written by a migration and
  the two readers should find it in one place. `FileLifetime.sql` joins this group when v2 adds it.
- `Migration/` holds one file per rung (`002-Analytics.sql` is the v1 to v2 rung, `003-Factor.sql`
  the v2 to v3, `004-Telemetry.sql` the v3 to v4), and `Open.ts` reads the rung by version number
  rather than holding a third array.
- `Query/` and `Write/` hold the runtime statements, named for what they return or do.

A statement that is assembled from parts - the rollup's five scope upserts differ only in the
`Scope` literal and the join - stays one file with a `?` for the scope, and the caller passes the
literal. A file that needs two statements stays two files; the loader is cheap and the cache makes
the second read free.

## 6. The migration sequence

One module per step, each step green before the next, because a half-moved module is a package that
builds and returns wrong rows.

| Step | Module                                                                                           | Statements | Note                                                        |
| ---- | ------------------------------------------------------------------------------------------------ | ---------: | ----------------------------------------------------------- |
| 1    | `Schema.ts`                                                                                      |         53 | the tables and views; `Ddl` becomes a directory read        |
| 2    | `Open.ts`                                                                                        |          3 | the pragmas stay inline (they are settings, not statements) |
| 3    | `Drain.ts`                                                                                       |         21 | the insert and upsert set                                   |
| 4    | `Report.ts`                                                                                      |         13 | the query set                                               |
| 5    | `Rollup.ts`                                                                                      |         12 | five upserts, one file with a scope parameter               |
| 6    | `Export.ts`                                                                                      |         11 | the read set                                                |
| 7    | `Annotate.ts`, `Apply.ts`, `Assess.ts`, `Recompute.ts`, `Price.ts`, `Backfill.ts`, `Forecast.ts` |         24 | the tail                                                    |
| 8    | `prepublishOnly.sh`                                                                              |          - | the copy step and the twin check                            |

## 7. The acceptance checks

1. `rg -n "SELECT |INSERT |CREATE TABLE|ALTER TABLE" Source --glob '!*.sql'` returns nothing outside
   `Sql.ts` and the pragmas in `Open.ts`.
2. The suite is the same count as before the refactor, all green - the statements are the same
   statements.
3. A smoke walks every `.sql` under `Source/Function/Sql` and asserts its `Target` twin exists and
   is non-empty, so a forgotten copy fails in the suite rather than in the first query.
4. A second smoke opens a fresh ledger and runs the `Schema` directory read, asserting the table
   count and the view count match the files on disk.
5. The published `files` list still ships `Target`, and the copy step runs inside `prepublishOnly`
   so an installed package carries its SQL.

## 8. What this RFC does not do

It does not implement the refactor. It records the spike, the mechanisms, the layout and the order
so that the implementation is a mechanical pass with a known answer to the only question that could
have sunk it - whether the build can load a `.sql` file - and that question now has evidence rather
than an assumption.
