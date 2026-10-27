# Curated notes

The shelf's distilled layer: one note per topic, each stating a decision, the sources behind it, and
the extracts that matter. These are the project's own writing, not copies of pages - the pages live
in `Raw/` and are indexed by `../README.md`.

A note is not a source: it never earns a row in `../statuses.json`, and a note that summarises five
pages leaves five rows, not six.

| Note                                           | Topic                            | Decides                                                                                           |
| ---------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| [AgentMetering.md](AgentMetering.md)           | Coding agent usage metering      | How existing coding agents meter a request, and where per-file metering has no precedent          |
| [AnnotationFormats.md](AnnotationFormats.md)   | Per-language annotation          | How a cost comment is written into Rust, TypeScript, Python and Markdown without changing meaning |
| [CompositionModel.md](CompositionModel.md)     | Icon composition                 | The relationships, voids and detail profiles the icon grammar composes from                       |
| [CostAllocation.md](CostAllocation.md)         | FinOps allocation and chargeback | The allocation strategies, the shared-cost policy, and the Shapley efficiency axiom               |
| [GenerativeExamples.md](GenerativeExamples.md) | Generative constructions         | The two Paper.js constructions the icon pipeline borrows                                          |
| [LedgerStorage.md](LedgerStorage.md)           | Cost ledger storage              | SQLite posture, temporal modelling, event sourcing and double-entry booking                       |
| [PaletteDirection.md](PaletteDirection.md)     | Palette                          | The fire-lit cavern direction and the tone set it produces                                        |
| [PictogramLanguage.md](PictogramLanguage.md)   | Pictogram language               | The 14 motif families and the primitives they are built from                                      |
| [ProviderPricing.md](ProviderPricing.md)       | Provider pricing                 | Each provider's token buckets, cache multipliers, tiers and time-of-day rates                     |
| [ReverseEngineering.md](ReverseEngineering.md) | Reverse engineering              | How a reference motif becomes a construction hypothesis                                           |
| [SiteStructure.md](SiteStructure.md)           | Site structure                   | Navigation grouping, footer as sitemap, card anatomy, and the per-item page rule                  |
| [TelemetryStandards.md](TelemetryStandards.md) | LLM telemetry                    | The OpenTelemetry GenAI fields, the inclusive-versus-exclusive trap, and the LiteLLM rate map     |
| [Toolchain.md](Toolchain.md)                   | Rendering toolchain              | The rendering toolchain decision and the trade-offs behind it                                     |

## Naming

PascalCase, one note per topic, named for the topic rather than for the site it came from. The notes
written before this rule carry the same convention after the 2026-10-27 rename; their content did
not change.
