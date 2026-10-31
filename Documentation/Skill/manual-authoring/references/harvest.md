# The Harvest

This file lists what the content pass reads before it writes a line, and the questions the reading
must answer.

## The rule

Read the package, the core it delegates to, the tests, the harness docs, the twin, the siblings, and
the diagram; answer the questions in writing before the first write.

A source that is opened but not read is not a source; read the file, not its head.

## The detail

| Read | For |
| --- | --- |
| `Classic/packages/<slug>/Source/Function/Apply.ts` | The seam, the flags, the dispatch, the ledger line. |
| `Classic/packages/<slug>/Source/Function/Normalize.ts` | The table and the replace law. |
| `Classic/packages/<slug>/Source/Function/Chunk.ts` | The chunk classifier. |
| `Classic/packages/<slug>/Source/Variable/Config.ts` | Every knob and its default. |
| `Classic/packages/lib-dsh-core/Source/` | The real dispatch the package delegates to. |
| `Classic/packages/<slug>/Source/Test/Stream-Contract/Test.ts` | The exact ledger line and the assertions. |
| `EffectTS/packages/ets-<slug>/Source/` | The twin, and every difference. |
| `~/Developer/Documentation/Module/deepseek-harness/docs/` | The seam's contract and the waterfall order. |
| `Diagram/` | The flow the sheet draws. |
| the sibling packages | The ledger strings and the bundle order. |

The questions: which seam, which dispatch, which chunk kind, which replace law, which flags, which
exemptions, which default, what an empty string does, the exact ledger line, the exact activation
line, the sibling order, and the twin difference.

The templater's harvest (calls 35-58) found the sheet's claims wrong in three places: the stream
exemptions are three tool names, not "an edit call, a raw-marked call, or a listed tool result";
`live-containers` is at `system-prompt/assemble`, not on `llm/stream`; and the seam's listener does
not prepend.

The evidence is `Documentation/Design/Dissection-Templater.md`, section 2, phase C.
