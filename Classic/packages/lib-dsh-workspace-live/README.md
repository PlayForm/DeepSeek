# @playform/lib-dsh-workspace-live

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/LIVE](../../Documentation/Plans/Workspace-Family/LIVE.md)

## The role

The workspace-live **LIBRARY** (the `lib-dsh-*` role) provides the shared client machinery of the Workspace Plugin Family's live view: the operational-view **section types** and the **render helpers**.

It has no Config and no apply, because the library is not a plugin bundle (no loader contract, no cordis patch); it is publishable on its own, and the consumers keep their own ledger strings, tools, and configs.

## The surfaces (the exports)

| Export     | Role                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Section`  | The operational-view section types (`SectionKind`, `Section`, `PacketView`).                                             |
| `Render`   | The section framer: one `Section` → one framed text block, version-stamped.                                              |
| `Collapse` | The budget collapse: overflow sections become one-line summaries, never dropped.                                         |
| `Packet`   | The orientation-packet renderer: the fixed eight-line grammar (WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE). |

The library has no Config, no tool, no service, and no ledger, because it is not a plugin bundle.

The packet format is `Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` section 3.5 (the orient step of the orient → drill → act loop).

The library is extracted per the SHARED-LIBRARY.md rule, and the Classic and EffectTS twins follow the family contract.

## The configuration

No Config exists: the library is not a plugin bundle (no loader contract, no cordis patch), and the consumers keep their own configs.

## The ledger

No ledger exists: the consumers keep their own ledger strings.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the library build (ESM `Target/`, Test tree excluded), the Test build, the harness selfcheck, and the Test type-check.

The smoke suite is the end-phase deliverable (see The plan).

## Consumers

- `@playform/plugin-dsh-workspace` - the workspace agent's operational view.
- `@playform/client-dsh-workspace-live` and the `client-dsh-*` panel family - the client half (the end-phase wires the real imports).

## The plan

This is a planned PoC (`tier: 2-planned` in `Temporary/npm-bootstrap/MANIFEST.json`), and the smoke suite is the end-phase deliverable.

The packet format is [WORKSPACE-FAMILY-V4-1](../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) section 3.5.

## License

CC0-1.0.
