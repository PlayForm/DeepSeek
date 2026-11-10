/**
 * @module Pricing
 *
 * The versioned pricing-catalog service over the ledger's v7 valuation
 * tables (the research's sections 3, 5, 6 and 7): the reads a settings view
 * lists, the one write that publishes a revision, and the preview that
 * re-prices one session's recorded usage under a selected revision.
 *
 * @remarks
 * THE READS are plain SELECTs. `catalogs` answers every catalog in creation
 * order; `revisions` answers one catalog's revisions newest first, the
 * order a history reads; `rates` answers one revision's rate rows in card
 * order - provider, model, mode, region, window, then the effective date
 * ascending, then the tier floor - so a rate-card table reads as the book
 * it is. The Revision row is immutable: a correction is a new revision
 * whose ParentRevisionId names the one it corrects, and its rate rows keep
 * the original ValidFrom.
 *
 * THE ONE WRITE is `publish`, and it is one transaction: the Revision row
 * is inserted already 'published' with ParentRevisionId = BaseRevisionId
 * and the caller's reason, every supplied RateRow is inserted against the
 * new revision id, and the COMMIT is what makes the revision visible. A
 * failure anywhere - a duplicate rate, a broken foreign key, an unbound
 * value - rolls the whole thing back, so a failed publish leaves no
 * revision and never a half-written book. The transaction IS the draft
 * state, which is why no row is ever visible with Status 'draft'.
 *
 * THE BASE-REVISION GUARD is the concurrency contract (the research's
 * answer 4, "Backend boundary": save against a base revision, and when
 * someone else has published a newer revision, return a conflict instead of
 * silently overwriting their changes). The catalog's head is its newest
 * published Revision by RevisionId - the insert order is the publish order,
 * and this service never writes a draft - so a base that is not the head
 * means someone else published first. The head is read INSIDE the publish
 * transaction, after BEGIN IMMEDIATE takes the write lock, so two publishes
 * against the same base cannot both pass the check. A null base is the
 * first publish, and it is legal only while the catalog is empty; on a
 * catalog that already carries a revision it is the same conflict. The
 * refusal is an Error whose message starts
 * "plugin-dsh-cost: pricing conflict - " and names the base and the head,
 * so the caller can tell it from a validation failure while the interface
 * shape stays as it is and every validation line stays unchanged.
 *
 * The caller's RateRow.RateRowId and RevisionId are placeholders: the
 * ledger assigns both, and the returned Revision carries the new
 * RevisionId. Nothing observed is touched - Price, Call, Allocation, Touch
 * and every other recorded fact stay as captured (the research's section 3:
 * observed facts are stored once; a pricing catalog is an assumption, and
 * only Revision and RateRow receive rows).
 *
 * THE PREVIEW is the revaluation the research asks for before a publish
 * (section 7: "Preview first; publish a catalog revision second"). It reads
 * the session's calls - provider, model, mode, region, the recorded tier,
 * the token buckets, the instant and the recorded money - resolves a rate
 * row of the selected revision for each call with the capture path's own
 * rules, and prices the same recorded usage again. Nothing is persisted:
 * the preview computes, and the ledger is read-only for it.
 *
 * THE RESOLUTION RULES are the capture path's (Function/Price.ts and the
 * drain's call site), restated here because that engine is bound to the
 * Price table and its configured modifiers while a revision lives in
 * RateRow: the effective interval is half-open (ValidFrom <= at < ValidTo,
 * a NULL ValidTo staying open), an exact Mode, Region or Window match beats
 * a NULL or 'any' generic row, the greatest ValidFrom wins among equals,
 * and a conditional row never resolves as the card. The call's time-of-day
 * window is not recorded on the Call row, so it is re-derived from the
 * call's own instant through the configured price windows - the drain's
 * rule at capture time - and a config whose windows changed since then can
 * select a different window card: that is the one dimension the call row
 * does not preserve.
 *
 * THE ARITHMETIC is the same two primitives: the marginal tier walk over
 * the resolved card's family (each bucket priced per portion at its own
 * tier's rate, the reasoning bucket flat at the resolved row's reasoning
 * rate) and the conditional card (a row whose Note is
 * "condition:at-or-below" or "condition:above", selected by the request's
 * prompt size and priced flat). The family is the same provider, model,
 * valid-from, mode, region and window, so one window's bands are never read
 * into another's walk. The factor layer's modifiers are NOT applied: a
 * revision's rate rows are the whole book it declares, and the catalog
 * carries no modifier column.
 *
 * THE MONEY: one currency per row, six-decimal rounding at the aggregate,
 * and a missing rate stays unpriced. The preview totals one currency - the
 * session's first recorded call's currency, else the configured one - and a
 * call recorded in, or re-priced into, another currency counts as unpriced
 * rather than being added across unlike units; this service converts
 * nothing. Both totals cover the same calls (the ones the revision prices
 * in that currency), so `difference` compares like with like.
 */
import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
import type PricingService from "../Interface/PricingService.js";
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): PricingService;
