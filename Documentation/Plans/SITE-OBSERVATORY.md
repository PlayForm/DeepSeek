---
title: Site Observatory - the requirement ledger
category: Plans
kind: working-plan
date: 2026-10-29
status: active
registry: Documentation/Plans/SITE-OBSERVATORY.md
index: Documentation/INDEX.md
statuses:
    - name: the requirement ledger for the site overhaul
      state: active
      evidence:
          Temporary/Overhaul/Plan.md, Temporary/Overhaul/Layout-Breakdown.md, Reference/README.md
---

# Site Observatory - the requirement ledger

Every requirement the user stated for the site overhaul is a row below. A row closes only with the
evidence it names, and a row that is partial says so in its own words rather than rounding up.

The work itself is described in `Temporary/Overhaul/Plan.md` (the waves),
`Temporary/Overhaul/Layout-Breakdown.md` (the route-by-route layout authority), and the reference
shelf under `Reference/`.

## The ledger

| #   | Requirement                                                                 | State     | Evidence                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Overhaul the website completely, in waves                                   | done      | `/`, `/showcase/`, `/showcase/[slug]/`, `/explore/`, `/tl/`, `/plugins/`, `/reference/`, `/connect/` all build and render                                                                      |
| 2   | Two world models and two timeline views                                     | partial   | scenario axis (baseline, PlayForm, compare) crossed with the projection axis; live only in conversation scope, because the catalogue carries no baseline DSH inventory                         |
| 3   | One shared model, projections are layout policies                           | done      | `Model.mjs` owns identity; `World.browser.mjs` and `Timeline.browser.mjs` consume the same graph                                                                                               |
| 4   | The full catalogue, not a hand-built diagram                                | done      | committed snapshot, 107 packages, 59 Classic, 48 Effect-TS, revision `38a76c3d`                                                                                                                |
| 5   | Correct the count arithmetic                                                | done      | `SumKnown` in `Content.ts`; the explorer counts derive from the snapshot                                                                                                                       |
| 6   | A showcase with authored, honestly labelled walkthroughs                    | done      | sixteen stories, two committed traces, `AUTHORED WALKTHROUGH` and `NO RUNTIME CAPTURE` on every story page                                                                                     |
| 7   | The reference shelf, crawled and preserved                                  | done      | 275 sources indexed, 234 converted, 17 stub, 17 unavailable; `Reference/README.md` regenerated from the status table                                                                           |
| 8   | Research the design from the sources, not from memory                       | done      | four curated notes under `Reference/Curated/` and `Temporary/Overhaul/Research-Findings.md`                                                                                                    |
| 9   | A route-by-route layout breakdown                                           | done      | `Temporary/Overhaul/Layout-Breakdown.md`                                                                                                                                                       |
| 10  | Many distributed low-effort lanes, never the workflow tool                  | done      | the rule is in `~/.dsh/AGENTS.md`; every lane this session ran as a `subagent` with an explicit route                                                                                          |
| 11  | Preserve the feedback as rules                                              | done      | the distributed-lanes rule and the follow-through rule in `~/.dsh/AGENTS.md`                                                                                                                   |
| 12  | Local harness connection last                                               | deferred  | `/connect/` states the terms and the trust boundary; no connector code exists                                                                                                                  |
| 13  | Node-kind shape language in the graph                                       | in flight | the renderer lane is adding the per-kind shapes and edge kinds                                                                                                                                 |
| 14  | Markdown quality of every shelved source                                    | done      | 18 files re-converted from archived DOM through `html_to_md.py`; findings fell from 3,963 to 2,241, table damage from 1,963 to 266; `Temporary/Overhaul/Markdown-Audit.md`                     |
| 15  | One documented batch path from archived HTML to Markdown                    | done      | the `source-pipeline` skill names the batch loop and `fetch_list.py`; both corpora updated                                                                                                     |
| 16  | Requirements become TODOs that are followed through                         | done      | this ledger, plus the rule in `~/.dsh/AGENTS.md`                                                                                                                                               |
| 17  | A full-bleed graph page with a top bar of toggles and no side or bottom bar | in flight | the layout lane is rewriting the explorer anatomy; the two graph routes drop the container wrapper                                                                                             |
| 18  | Inspiration mined from the references, not just archived                    | done      | `Reference/Curated/Observatory-Ontology-Inspiration.md` reads the Foundry ontology explorer for entity counts, match ratios, and the in/out panel; `search_shelf.py` makes the shelf queryable |

## The follow-through rule

A requirement the user states becomes a row here in the same turn, with a state and the evidence
that would close it. The parent re-reads the ledger before it reports, marks each row it closed, and
names each row that is still open with the reason. A row never moves to done because the work felt
finished; it moves because the evidence it names exists.

## Known limits the site states

- Cross-world correspondence edges cannot live inside a trace today, because the model validates
  each world in isolation.
- The catalogue is a source snapshot, not a runtime composition.
- The lens switch explains a lens; it does not reconstruct a captured request.
- No runtime capture is published, so every graph on the site is authored and labelled as such. | 19
  | World roles come from metadata, not array position | in flight | `ScenarioRole` on a world,
  retained by validation, looked up by role in the client | | 20 | One source descriptor drives
  badge, status and export | in flight | catalogue, authored walkthrough, imported catalogue and
  imported recording are distinct kinds | | 21 | Status and error messages are always visible when
  they say something | in flight | one `SetStatus` helper that clears `hidden`; the pill sits
  outside the toggled region | | 22 | A source change resets selection, reveal, cache and inspector
  | in flight | `ResetSourceState` before a new dataset is accepted | | 23 | Search and reveal do
  not share one visibility class | in flight | `search-muted` and `future-event`, applied
  independently | | 24 | Inspector labels are honest | done | `World` and `Display position`,
  with "Not applicable" for a catalogue | | 25 | The graph toggle saves the prior status before
  overwriting it | in flight | ordering fixed in the toggle handler | | 26 | Only the Events lens
  looks functional | in flight | the other three carry `aria-disabled` and an explanation | | 27 |
  CI enforces the graph tests and the drift guard | done | `Node.yml` runs `Test`, `Graph:Test`,
  `Drift` before `prepublishOnly` | | 28 | `lib-dsh-conversation` is in the taxonomy | done | added
  to Core and Factory in `Groups.mjs`; Unclassified stays for genuinely unmapped packages | | 29 |
  The deployment can be identified | done | `/site-identity.json` plus a footer revision line | | 30
  | The bar is organised and the graph fills the viewport | in flight | three dispersed clusters,
  popover dropdowns, `100dvh` shell, no page hero on the two graph routes | | 31 | Story claims are
  reviewed against the mechanics | open | governance timing (awaited versus detached), `step` versus
  phase, and the file-to-next-request admission path |

## The difference lens and the remaining visual work

The lens is the next slice: selecting an artifact lights both world counterparts and their evidence path, dims the rest, and fills a three-cell before/after/explanation card. The data is already in the traces (`Values: { Before, After }`), the model validates it, and the client binding is in flight.

After the lens: the axis projection with shared stage columns, the per-plugin behaviour timeline on every package page, the branch states (collapsed summary, expanded events, focused path), the eight decision outcomes with unavailable distinct from abstained, the plugin drawer with its five actions, and the three follow locks.
