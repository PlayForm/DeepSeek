# switch (true) Guards: Rust-Style Return-in-Every-Arm

> Source: SKILL.md, Section 2 (Writing style), rule 5.

## The Rule

Convert `if (existsSync(Candidate)) return Candidate;` chains into
Rust-style `switch (true)` with returns inside every arm:

```typescript
switch (true) {
  case existsSync(Candidate): return Candidate;
  case existsSync(Fallback): return Fallback;
  default: throw new Error("no candidate found");
}
```

## Why `switch (true)`

1. **The guards become a table.** Each `case` is one line: condition ->
   result. The reader scans a column of conditions and a column of
   outcomes, instead of parsing nested `if/else if` trees with braces
   at varying depths.

2. **Every arm returns.** The structure makes the exhaustive shape
   visible: each arm either returns or the `default` does. A `case`
   without a return is an obvious anomaly; in an `if` chain, a missing
   return is invisible until the function falls off the end.

3. **Rust-style ergonomics.** The form mirrors Rust's `match` arms
   (`cond => return value`), keeping the JavaScript code visually
   aligned with the Rust-style tree aesthetic the skill's structure
   follows.

4. **Guards stay flat.** `if/else if` chains nest; `switch (true)`
   arms do not. Adding a new guard is adding one case line, never
   re-nesting a tree.

## When to Use It

Use the form when a function's body IS a sequence of guard conditions
each mapping to a return - candidate resolution, fallback ladders,
priority checks, pattern dispatch.

Do NOT force it onto:

- a single `if` (a table with one row is just an `if`),
- loops or accumulations (the form is for dispatch, not iteration),
- conditions with side effects between them (arms should return; if an
  arm needs to "do more than return", the logic likely belongs in its
  own definition - see ./references/one-definition-per-file.md).

## Examples

### Bad (the if-chain)

```typescript
if (existsSync(Candidate)) return Candidate;
if (existsSync(Local)) return Local;
if (Exists(Installed)) return Installed;
throw new Error("not found");
```

### Good (switch (true))

```typescript
switch (true) {
  case existsSync(Candidate): return Candidate;
  case existsSync(Local): return Local;
  case Exists(Installed): return Installed;
  default: throw new Error("not found");
}
```

### Good (default throws - the exhaustive close)

The `default` arm is part of the pattern: every path returns or throws.
An implicit fall-through end is not allowed.

## Failure Modes

- Arms with side effects hiding behind a return (one arm writes a file,
  another doesn't) - the table should be uniform; heterogeneous arms
  are a design smell to re-atomize.
- Fall-through abuse (arms relying on the next arm's logic) -
  forbidden; each arm is self-contained.
- Using `switch (true)` as a general control-flow style for non-guard
  logic - it is a guard-chain form, not a replacement for all `if`.

## Arbiters

- Review: guard chains in the codebase appear as `switch (true)` with
  every arm returning and a `default` present.
- Any `if (...) return ...; if (...) return ...;` sequence of three or
  more is a finding to convert.
