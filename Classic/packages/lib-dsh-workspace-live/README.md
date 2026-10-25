# @playform/lib-dsh-workspace-live

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/LIVE](../../Documentation/Plans/Workspace-Family/LIVE.md)

## The role

The workspace-live **LIBRARY** (the `lib-dsh-*` role): the shared client machinery of the Workspace
Plugin Family's live view - the operational-view **section types** and the **render helpers**. No
Config, no apply: the library is not a plugin bundle (no loader contract, no cordis patch); it is
publishable on its own and the consumers keep their own ledger strings, tools and configs.

## The surfaces (the exports)

| Export     | Role                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Section`  | The operational-view section types (`SectionKind`, `Section`, `PacketView`).                                             |
| `Render`   | The section framer: one `Section` → one framed text block, version-stamped.                                              |
| `Collapse` | The budget collapse: overflow sections become one-line summaries, never dropped.                                         |
| `Packet`   | The orientation-packet renderer: the fixed eight-line grammar (WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE). |

The library has no Config, no tool, no service and no ledger: it is not a plugin bundle.

The packet format is `Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` section 3.5 (the orient step of
the orient → drill → act loop). The library is extracted per the SHARED-LIBRARY.md rule; the Classic
and EffectTS twins follow the family contract.

## Consumers

- `@playform/plugin-dsh-workspace` - the workspace agent's operational view.
- `@playform/client-dsh-workspace-live` and the `client-dsh-*` panel family - the client half (the
  end-phase wires the real imports).

## The plan

Planned PoC (`tier: 2-planned` in `Temporary/npm-bootstrap/MANIFEST.json`); the smoke suite is the
end-phase deliverable. The packet format is
[WORKSPACE-FAMILY-V4-1](../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) section 3.5.

## License

CC0-1.0.
