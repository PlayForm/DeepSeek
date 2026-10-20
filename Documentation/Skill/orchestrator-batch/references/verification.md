# Verification: The Lanes' Arbiters and the Non-Execution Law

## The arbiters are the lanes' own

Every activation carries the arbiter mandate: the lane runs its own
verification and reports the printed numbers.

- A code lane runs its bundle's smoke suite and reports the printed total.
- A site lane runs `cd Site && pnpm prepublishOnly` and reports the built
  page count and the changed strings.
- A docs lane re-reads the changed span and reports the anchors.

The lane has the freshest build, the full context of its change, and the
ability to iterate. Centralizing verification in the parent would turn the
parent into a build server and separate the evidence from the work.

## The non-execution law

The parent does not execute the project. Forbidden under the parent's
name:

- builds and site builds;
- site or source edits;
- measurement runs;
- pre-investigation of the surfaces named in feedback.

The parent's hands-on work is limited to:

1. relaying the user's feedback verbatim to the lanes;
2. keeping the records;
3. read-only spot checks over committed or built output.

The law came from a slip: the parent ran a build that cleared the site's
`Target/`, destroying the lanes' arbiter state, and pre-investigated
feedback surfaces before relaying. The user mandated the boundary on
2026-10-09.

## Printed totals beat prose

A suite's printed total is emitted by the verifier itself. A prose claim
("all tests pass", "795 checks") can be optimistic, misremembered, or
aspirational. The rule is asymmetric: printed totals are trusted;
contradicting prose is discarded. The 795/808 incident is the precedent:
prose numbers that arithmetic on the real counts could not support.

## The read-only spot check

The only sanctioned hands-on act. It is a grep over committed or built
output:

```sh
grep -r "the string the lane said it removed" Site/Target/
git show HEAD:path/to/file | grep "expected"
```

It is never a run, never an edit, never a fresh build.

## Relaying feedback

Relay the user's words verbatim. A paraphrase is a lossy translation:
"looks wrong" is not "is wrong". Pre-investigating before relaying also
risks the parent concluding "no fix needed" and never relaying, which
steals the user's decision.

## The exception

If the user explicitly instructs the parent to perform a specific act
("run the build yourself"), that instruction overrides the standing law
for that one act. It must be explicit and it does not generalize.

## Failure modes

- Pre-investigating feedback: latency, bias, and a colored relay.
- Trusting prose over printed totals: phantom numbers propagate.
- Spot checks drifting into edits or runs: the boundary is crossed.
- Paraphrasing: the lane fixes something the user did not say.
