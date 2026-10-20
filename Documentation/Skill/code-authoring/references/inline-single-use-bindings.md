# Inline Every Single-Use Binding

> Source: SKILL.md, Section 2 (Writing style), rule 4.

## The Rule

No sloppy intermediate variables. A binding survives only when:

1. it is used MORE THAN ONCE, or
2. it names a setup-time invariant (a documented exception).

Everything else is inlined at its single use site.

## Why Single-Use Bindings Are Noise

1. **A variable used once adds a line and a name without adding
   information.** The reader must hold the binding in mind, find its
   one use, and mentally inline it anyway. The code forced the reader
   to do the compiler's work.

2. **Names create false interfaces.** A single-use binding looks like
   a concept (`const result = ...`) and invites other code to start
   using it, growing coupling around an accident of phrasing. Inline
   expressions have no surface to couple to.

3. **The atomized tree shrinks the need.** With one definition per file
   (see ./references/one-definition-per-file.md), functions are
   short; intermediate scaffolding that made sense in a 200-line
   function is pure noise in a 10-line one.

4. **Inline flows read top-to-bottom.** The single-use inline shows the
   actual data flow: argument to call to return. A named binding breaks
   the flow with a detour (definition ... later ... use).

## The Two Documented Exceptions

### Exception 1: Used more than once

The binding carries real reuse:

```
const ledger = await LoadLedger(ctx);        // used 3 times below
return Validate(ledger) + Sum(ledger) + Persist(ledger);
```

### Exception 2: Setup-time invariant

A binding that names a value fixed at setup which the rest of the code
must treat as stable - even if technically used once - because the NAME
is the documentation of the invariant:

```
const Root = ResolvePluginRoot(Environment);  // invariant: computed once
// ...long body that must not recompute or mutate it...
```

The exception is documented in the code with a comment when it is not
obvious, and the binding must be genuinely invariant (never reassigned,
never mutated).

## Examples

### Bad (single-use bindings)

```
const content = await read(file);
await write(file, content);
```

### Good (inlined)

```
await write(file, await read(file));
```

### Bad (naming a trivial expression)

```
const isEmpty = items.length === 0;
if (isEmpty) return null;
```

### Good (inline the condition; the boolean name added nothing)

```
if (items.length === 0) return null;
```

## The Judgment Call

Not every multi-word expression should be inlined blindly. If inlining
makes a line so dense it cannot be read, OR the expression encodes a
subtle condition that the name explains (not just repeats), the binding
may survive - but that is the exception requiring justification, not
the default. The test: does the NAME add information the EXPRESSION
does not already show? If no, inline.

## Failure Modes

- Mechanical inlining destroying readability: nesting three calls with
  distinct failure semantics on one line.
- "Temporary" variables that quietly gain second and third uses - at
  that moment they become legal, but the code should be re-read to see
  if the reuse is a design smell.
- Preserving bindings "in case" of future reuse - speculative reuse is
  not reuse; inline now, extract when the second use actually arrives.

## Arbiters

- Review: every binding is either used more than once, is a documented
  invariant, or is inlined.
- Grep-read of each leaf: `const X =` followed by exactly one use of X
  with no invariant role is a finding.
