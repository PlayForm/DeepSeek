# The Page As A Composition

How the site's pages become compositions of modules, and what the Temporary research already decided about them.

Source: `Temporary/component-page-composition-recipes.json` (status `proposed-recipes`, 15 routes, 20 modules, 5 variants per module), `Temporary/advanced-component-design-contracts.md` (the P01-P10 and M01-M20 contracts), and `Temporary/component-library-mapping.md` (the integration tree). This document maps that model onto the site as it stands today.

## 1. The model

Temporary does not describe pages. It describes **slots**, **modules**, and **recipes**.

- A route is a **shell** of five slots, in reading order: `intro`, `primary`, `secondary`, `evidence`, `closing`.
- A **module** is one thing a page can show: an introduction, a source rail, a collection, a stage navigator, an artifact difference, a decision record, an event explorer, an evidence reader, an origin inspector, a toolbar, a configuration record, an exact instruction, an absence, a readiness record, an analytical record, an argument, a typed relationship, a delivery receipt, a contract specimen, an outcome record. There are twenty.
- A **recipe** is one arrangement of a module: the module with a particular visual shape, drawn as an ASCII sketch. Each module carries five.
- A **route plan** is six recipes of the whole page: six ways the same five slots can be filled, with a rationale for each.

The point of the model is that a page stops being hand-built markup and becomes a choice: which modules, in which slots, in which variant. The same module then appears on many pages in the same shape, and a page variant is a data change rather than a new file.

## 2. What the site has today

The site's pages are hand-built sections. Read against the module list, most of the modules already exist as a component, several exist as two components that should be one, and six do not exist at all.

| Module | Temporary component | The site's component | Status |
| --- | --- | --- | --- |
| M01 Introduction | `Layout/Introduction.astro` | `PageHero` | have |
| M02 SourceIntegrityRail | `Anatomy/SourceIntegrityRail.astro` | `Provenance` | have |
| M03 ObjectCollection | `Anatomy/ObjectCollection.astro` | `PackageCard` + `Filter` + the catalogue grid | have, three files |
| M04 StageNavigator | `Anatomy/StageNavigator.astro` | `Trajectory`, `Stage` (turn), `Chain` (composition) | have, three shapes |
| M05 ArtifactDifference | `Anatomy/ArtifactDifference.astro` | `Difference`, `Compare`, `Transform` | have, three shapes |
| M06 DecisionEvidence | `Anatomy/DecisionEvidence.astro` | none | missing |
| M07 EventExplorer | `Anatomy/EventExplorer.astro` | `Graph/Explorer` | have |
| M08 EvidenceReader | `Anatomy/EvidenceReader.astro` | `Disclosure` | partial: hides, does not read |
| M09 OriginInspector | `Anatomy/OriginInspector.astro` | `Origin` | have |
| M10 TaskToolbar | `Anatomy/TaskToolbar.astro` | none | missing |
| M11 ConfigurationRecord | `Anatomy/ConfigurationRecord.astro` | `Table` with the config rows | partial: no record identity |
| M12 ExactInstruction | `Anatomy/ExactInstruction.astro` | `CodeBlock`, `Terminal` | have |
| M13 EvidenceAbsence | `Anatomy/EvidenceAbsence.astro` | `Absence`, `EmptyState` | have, two shapes |
| M14 ReadinessEvidence | `Anatomy/ReadinessEvidence.astro` | none | missing |
| M15 AnalyticalRecord | `Anatomy/AnalyticalRecord.astro` | `StatBand` | partial: no denominator |
| M16 ArgumentBlock | `Anatomy/ArgumentBlock.astro` | `SectionHeader` + prose | partial |
| M17 TypedRelationship | `Anatomy/TypedRelationship.astro` | the dependency `Table`, `Matrix` | partial |
| M18 DeliveryReceipt | `Anatomy/DeliveryReceipt.astro` | none | missing |
| M19 ContractSpecimen | `Anatomy/ContractSpecimen.astro` | none | missing |
| M20 OutcomeRecord | `Anatomy/OutcomeRecord.astro` | none | missing |

The three modules the site turned into several components are the three the Temporary contracts also give five variants each, which is the reason the site now has `Trajectory`, `Stage`, and `Chain` doing related work: each was written for one page rather than for the module.

## 3. The site's routes as slots

Temporary's route plans, read against this site's routes. The module ids are Temporary's; the content is the site's.

| Route | intro | primary | secondary | evidence | closing |
| --- | --- | --- | --- | --- | --- |
| `/` | M01 statement | M05 artifact | M03 collection, M04 stages | M02 rail | M11 record |
| `/package/` | M01 purpose | M10 toolbar, M03 collection | M03 selection | M02 rail | M13 absence |
| `/package/{slug}` | M01 purpose | M05 difference, M11 configuration | M17 relations | M14 readiness, M09 origin | M20 outcome |
| `/behavior/` | M01 purpose | M17 relations | M04 stages | M19 specimen | M14 readiness |
| `/behavior/{seam}` | M01 purpose | M17 relations, M11 configuration | M04 stage | M19 specimen | M13 absence |
| `/turn/` | M01 statement | M04 stages | M08 reader | M17 relations | M02 rail |
| `/intervention/` | M01 purpose | M03 matrix | M06 decision | M17 relations | M02 rail |
| `/tutorial/` | M01 statement | M05 difference | M16 argument | M06 decision | M13 absence |
| `/composition/` | M01 statement | M04 stages | M17 relations | M19 specimen | M02 rail |
| `/workbench/` | M01 statement | M04 stages | M05 difference | M02 rail | M13 absence |
| `/showcase/` | M01 statement | M10 toolbar, M03 collection | M03 selection | M05 difference | M02 rail |
| `/explore/` | M02 rail | M10 toolbar, M07 explorer | M08 reader | M03 table | M13 absence |
| `/tl/` | M02 rail | M10 toolbar, M07 timeline | M08 reader | M07 events | M13 absence |
| `/setup/` | M01 statement | M04 setup stages | M11 configuration | M12 instruction, M14 readiness | M13 absence |
| `/reference/` | M01 purpose | M10 toolbar, M19 specimens | M17 relations | M03 table | M02 rail |
| `/marketplace/` | M01 purpose | M03 collection | M03 selection | M19 specimen | M02 rail |
| `/connect/` | M01 purpose | M08 reader | M11 configuration | M12 instruction | M02 rail |
| `/case-study/` | M01 statement | M16 argument | M05 difference | M20 outcome | M19 specimen |
| `/search/` | M01 purpose | M10 toolbar | M03 collection | M13 absence | M02 rail |
| `/404` | M13 absence | M03 destinations | M16 argument | none | M02 rail |

Every route has a slot plan now, which is what the site did not have: it had pages.

## 4. What condensing means here

Three operations, in this order, because each one makes the next cheaper.

1. **Merge the duplicates into one module each.** `Trajectory`, `Stage`, and `Chain` become one `Stage` module with variants; `Difference`, `Compare`, and `Transform` become one `Difference` module with variants; `PackageCard` plus the catalogue grid becomes one `Collection` module. This is the condensation the Temporary recipes describe as five variants of one module rather than five components.

2. **Build the six missing modules.** `TaskToolbar` (M10) first, because six routes want it; then `DecisionEvidence` (M06) and `ReadinessEvidence` (M14), which carry the claims the new pages make; then `DeliveryReceipt` (M18), `ContractSpecimen` (M19), and `OutcomeRecord` (M20), which the package page and the case study want.

3. **Give each page a slot plan.** A page file becomes five slot assignments, and the layout is a recipe. The first proof should be `/intervention/` or `/tutorial/`, because both were written after the model was understood and both already read as five parts.

## 5. What the model does not solve

- **Content.** A recipe decides arrangement, not truth. Every module still needs its data from the tree or from an authored map, and the accuracy rules apply to a module exactly as they apply to a page.
- **The dashboard.** A live trace changes what the modules read, not which modules a page has, so the slot plan survives the dashboard; that is the reason to adopt it.
- **The ASCII sketches.** Temporary's recipes carry ASCII drawings. They are the contract for the variant's shape, not a deliverable: the site's own diagrams are the Mermaid pipeline and the component stylesheets, and a page should not carry an ASCII drawing it cannot justify.

## 6. The first proof

`/intervention/` already reads as five parts: an introduction, a matrix, three power callouts, a record table, and a source rail. Its slot plan is the table above, and its modules exist today except `DecisionEvidence`, which the power callouts stand in for.

Building `TaskToolbar` (M10) next is the cheapest real test of the model, because six routes want the same control and the site currently has no shared toolbar at all: the catalogue's filter, the graph's search, and the search page each carry their own controls.
