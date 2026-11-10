/**
 * @module Fetch
 *
 * The browser half of the data path: the session GET, the file-scoped contribution GET, the
 * deeper per-conversation call GET, the lineage GET, the two pricing GETs and the one pricing POST.
 *
 * @remarks
 * The session GET is the route path with the encoded session id and the row budget, answered as a
 * `CostResponse`. The file-scoped GET answers the conversations that contributed to one file's
 * cost; the deeper file-scoped GET answers one conversation's calls that allocated money to that
 * same file; the lineage GET answers one file's content versions with the touches bound to each;
 * the two pricing GETs a settings surface lists (lane B4d) answer the catalogs with their
 * revisions and one revision's rate rows; and the one pricing POST (lane B4f) publishes a
 * revision.
 *
 * None of the functions throws: a runtime without fetch, a failed request, a non-JSON answer or a
 * malformed body resolve to the unavailable envelope, to an empty contribution list, to an empty
 * call list, to an empty version list, to the empty catalog answer, to an empty rate list or to a
 * refused publish answer, so the panel can always render a state. The envelope's `path` names the
 * route, because the browser knows no ledger path; the route's own message names the file.
 *
 * THE VALUATION SELECTION (lane B4d; the research's section 8): the session fetch accepts the
 * basis and the revision the panel selected and sends them as query parameters. Without a
 * selection the URL is the recorded one - `?session=<id>&rows=<n>` - and the engine answers the
 * recorded envelope; a selection adds `basis`, and a pinned revision adds `revision` too. The
 * browser validates nothing here: the route owns the four-basis union and answers one actionable
 * line for anything else.
 */
import type CostContributionRow from "../Interface/ContributionRow.js";
import type CostResponse from "../Interface/Response.js";
import type { Catalog, CostFileCallRow, CostVersionRow, RateRow, Revision, ValuationSelection } from "@playform/plugin-dsh-cost/service";
export default function Fetch(SessionId: string, Rows: number, Selection?: ValuationSelection): Promise<CostResponse>;
/**
 * Contributions - the file-scoped read: one GET to the same route with the encoded path, answered
 * as the rows of the conversations that contributed to that file's cost. It never throws: a
 * runtime without fetch, a failed request, a non-JSON answer or a malformed body all resolve to an
 * empty list, so a file row that opens always has a state to render.
 */
export declare function Contributions(Path: string): Promise<readonly CostContributionRow[]>;
/**
 * FileCalls - the deeper file-scoped read: one GET to the same route with the encoded path and the
 * encoded conversation id, answered as the calls of that conversation that allocated money to that
 * file. It never throws: a runtime without fetch, a failed request, a non-JSON answer or a
 * malformed body all resolve to an empty list, so a conversation row that opens always has a state
 * to render.
 */
export declare function FileCalls(Path: string, SessionId: string): Promise<readonly CostFileCallRow[]>;
/**
 * History - the lineage read: one GET to the same route with the encoded path under `history`,
 * answered as the file's content versions, newest first, each with the touches bound to it. It
 * never throws: a runtime without fetch, a failed request, a non-JSON answer or a malformed body
 * all resolve to an empty list, so the block always has a state to render.
 */
export declare function History(Path: string): Promise<readonly CostVersionRow[]>;
/**
 * CatalogAnswer - the pricing list the catalogs route answers: every catalog the ledger carries
 * and every revision of each, flattened in catalog order (the Revision row names its CatalogId).
 * The settings view groups the two lists; nothing here is nested, and the answer is empty when the
 * route could not be read.
 */
export type CatalogAnswer = {
    readonly catalogs: readonly Catalog[];
    readonly revisions: readonly Revision[];
};
/**
 * Catalogs - the pricing list: one GET to the catalogs route, answered as the catalogs and their
 * revisions. It never throws: a runtime without fetch, a failed request, a non-JSON answer or a
 * malformed body all resolve to the empty answer, so a settings surface always has a state to
 * render.
 */
export declare function Catalogs(): Promise<CatalogAnswer>;
/**
 * Rates - one revision's rate rows: one GET to the rates route with the revision id. It never
 * throws: a runtime without fetch, a failed request, a non-JSON answer or a malformed body all
 * resolve to an empty list. A revision id that is not a positive integer never reaches the route,
 * because the query would only answer the error envelope.
 */
export declare function Rates(RevisionId: number): Promise<readonly RateRow[]>;
/**
 * PublishRow - one rate row as the publish body carries it: every field the engine inserts, and
 * neither ledger-assigned id, because the publish assigns the revision id and the row id itself.
 * The host half validates exactly this shape and hands the engine the full RateRow, so the browser
 * never invents an id and the engine never stores one.
 */
export type PublishRow = Omit<RateRow, "RateRowId" | "RevisionId">;
/**
 * PublishRequest - the one write's body: the catalog the revision belongs to, the revision the
 * draft corrects (null for a catalog's first revision), the reason the audit reads and the whole
 * edited row set. A concurrent publish is answered by the engine's own base-revision check, so the
 * caller always names the book it was editing.
 */
export type PublishRequest = {
    readonly catalogId: number;
    readonly baseRevisionId: number | null;
    readonly reason: string;
    readonly rows: readonly PublishRow[];
};
/**
 * PublishAnswer - the publish route's answer, flat so the caller reads one field instead of
 * narrowing a union: the ok flag, the new revision when the write landed, and the route's own
 * code, line and path when it did not. An error envelope comes back as this value, never as a
 * rejection, so the settings surface can render the refusal inline.
 */
export type PublishAnswer = {
    readonly ok: boolean;
    readonly revision: Revision | null;
    readonly code: string;
    readonly message: string | null;
    readonly path: string;
};
/**
 * Publish - the one write: one POST to the publish route with the whole body as JSON. It never
 * throws: a runtime without fetch, a failed request, a non-JSON answer or a malformed body all
 * resolve to a refused answer whose message is the one line the settings surface shows.
 */
export declare function Publish(Request: PublishRequest): Promise<PublishAnswer>;
