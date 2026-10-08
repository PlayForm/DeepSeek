# Package 1 — The family snapshot

> The handoff's opening package: what the family is, where it lives, and its commit state at the
> handoff's writing (2026-10-04). Part of `Documentation/Handoff/` — see `../Overview.md` for the
> snapshot/verified-state/architecture overview, `../Packages/Package-01.md` …
> `../Packages/Package-13.md` for the session packages, `../Register.md` for the future-work
> register, and `../Lessons.md` for the working lessons.

---

**Five bundles + the factory** — all under `~/.dsh/profiles/desktop/bundles/` (one git repo:
`~/.dsh`):

| Bundle                      | Identity                                                            | Mission                                                                                                                                             | Layout                                              |
| --------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `dsh-plugin-factory`        | `@playform/dsh-plugin-factory` v0.1.0 · service `ctx.pluginFactory` | the furnace: 15 methods centralizing the shared machinery                                                                                           | class/service plugin, `Source/` TS, `Target/` built |
| `dsh-hook-package-governor` | `@playform/dsh-hook-package-governor`                               | package.json chain-canonicalize + ncu update (programmatic/bin)                                                                                     | thin module + transform leaf + engines              |
| `dsh-hook-package-pinner`   | `@playform/dsh-hook-package-pinner`                                 | package.json static pinning (`^`/`~`/`=` stripped), keep-list                                                                                       | thin module, P-only                                 |
| `dsh-hook-cargo-governor`   | `@playform/dsh-hook-cargo-governor`                                 | Cargo.toml chain + full-version normalization + `cargo upgrade`                                                                                     | thin module + TOML transform + engine               |
| `dsh-hook-mdash`            | `@playform/dsh-hook-mdash`                                          | model-output dash normalization ([llm/stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)) | thin module, NON-manifest consumer                  |

**Terminology**: the factory's consumers are **MODULES** (renamed from "flavor" — the spec docs say
Module; the CODE still says `Flavor` — see [Package 4 §4.1](Package-04.md) for the exact rename
scope). The factory produces modules.

**Repo**: `~/.dsh` git — committed at `859f16a`
(`refactor(factory): convert the governance trio into plugin-factory flavors and add the mdash output normalizer`) +
`49e5b3d` (`feat(factory): introduce the dsh-plugin-factory service bundle`) — the working tree is
CLEAN. The private home repo — NEVER commit it unprompted.
