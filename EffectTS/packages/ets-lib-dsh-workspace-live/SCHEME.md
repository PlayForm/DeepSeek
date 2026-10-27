# SCHEME - @playform/lib-dsh-workspace-live

The shared client library of the Workspace Plugin Family's live view.

**No Config, no apply** - the `lib-dsh-*` role: not a plugin bundle, no loader contract, no cordis
patch.

The consumers keep their own ledger strings, tools, and configs.

## The exported surface

| Export          | Signature                                                                                  | Notes                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SectionKind`   | `"packet" \| "map" \| "focus" \| "neighbors" \| "evidence" \| "open" \| "stale" \| "note"` | What the section presents.                                                                                                                            |
| `Section`       | `{ id, kind, title, lines, version? }`                                                     | One framed section; `lines` are pre-wrapped by the producer.                                                                                          |
| `PacketView`    | `{ workspace, indexRevision, scope, map, focus?, neighbors, evidence, open, stale? }`      | The orientation packet's shape (V4-1 §3.5).                                                                                                           |
| `Render`        | `(section: Section) => string`                                                             | The framer: `--- WORKSPACE SECTION <id> (<kind>) - <title>[@ <version>] ---` ... `--- END WORKSPACE SECTION <id> ---`. Empty sections render as `""`. |
| `CollapseEntry` | `{ text, collapsed }`                                                                      | One collapsed entry.                                                                                                                                  |
| `Collapse`      | `(sections: Section[], budgetBytes: number) => CollapseEntry[]`                            | Renders in order; overflow sections become one-line summaries (`<id> (<kind>) collapsed: <title>`), never dropped.                                    |
| `Packet`        | `(view: PacketView) => string`                                                             | The fixed eight-line grammar; absent bands render `<TAG> (none)`; `STALE` renders only when the caller's version differs.                             |

## Composition contracts

- The **version stamp** is the index revision (or event sequence) the section reflects.

    The stable-until-event rule: re-render is justified only by a version change.

- The **token budget** is the caller's concern (it owns the counter seam), and `Collapse` takes
  bytes only.

- Every helper is **pure and harness-free**, and it is usable outside the harness.
