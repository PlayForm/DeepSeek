// Reader - the engine's one ledger read that fills a CostResponse: the row
// budget clamped to the tab's limits, the session row joined through Project
// and Client, the newest calls with their touches and allocations folded into
// one CostFile per FileId (the first touch in Seq order supplies the touch
// fields, the single allocation row supplies the money, and the unattributed
// allocation row stays out of `files` but keeps its money in `direct` and
// `amortized`), and the whole-session summary. Beside those, three view
// statements ride the same envelope: the per-file rows (this session's money
// for a file beside the file's all-sessions total, the carry-in before this
// conversation, this session's last turn's share and the change the
// conversation produced), the stage ranking and the model ranking. Each is
// its own statement joined on FileId - the money is never joined from
// Allocation to Touch in one FROM clause, so a call that touched one file
// twice cannot fan its allocation out. Beside the summary the envelope
// carries `coverage`: the priced and unpriced call counts and the token
// buckets the unpriced calls spent, because a call whose rate card the book
// does not carry stores zero money and must be read as unpriced, never as
// free (research section 2.2 - a missing rate is unpriced, a known free rate
// is an explicit zero row). Every statement runs through
// the Query table below and reads only; a session the ledger does not record
// answers ok false with code "session" and the zero summary; every nullable
// column stays null when the ledger stores no value. The read-only open lives
// in Function/Provide (the package's own Function/Open is the write path - it
// migrates the schema - so it is never reused here), which is why the reader
// sees only the open handle and the service overwrites `path` with the
// resolved ledger path.
//
// THE VALUATION SELECTION (lane B4d; the research's sections 4 and 8): the
// caller may carry the basis it wants the read interpreted under and the
// catalog revision that basis evaluates against. An absent selection and the
// 'as-recorded' basis leave every byte of the envelope as it was - the
// recorded read is the default and the block is never added to it. A selection
// that names both a non-recorded basis and a revision asks the pricing service
// for its preview over this same session and appends the `valuation` block:
// the money the ledger recorded, the money that revision gives the same usage,
// the difference between the two, and the count of calls the revision could
// not price, beside the basis, the revision, the attribution policy version
// and when the comparison ran. The preview reads the whole session, not the
// page budget, so the block is a session headline; per-call money stays as
// recorded in this lane. A session the ledger does not record answers the
// failure envelope without a block, because no read happened to compare.
import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type CostBuckets from "@Interface/Buckets.js";
import type CostCall from "@Interface/Call.js";
import type CostFile from "@Interface/File.js";
import type CostFileRow from "@Interface/FileRow.js";
import type CostModelRow from "@Interface/ModelRow.js";
import type PricingService from "@Interface/PricingService.js";
import type CostResponse from "@Interface/Response.js";
import type { Valuation } from "@Interface/Response.js";
import type CostSession from "@Interface/Session.js";
import type CostStageRow from "@Interface/StageRow.js";
import type CostSummary from "@Interface/Summary.js";
import type CostTokens from "@Interface/Tokens.js";
import type CostTopFile from "@Interface/TopFile.js";
import type ValuationSelection from "@Interface/ValuationSelection.js";

// The eleven read-only statements the engine runs (the panel's Design.md
// section 9.1): every one is a plain SELECT keyed by the session id, with no
// pragma that writes, no INSERT, UPDATE or DELETE. Calls selects the newest
// budget first and the reader re-sorts it ascending by (turn, step); Touches
// orders by (CallId, Seq) so a file's first touch in Seq order wins;
// Summary aggregates the whole session in one row - the allocation money is
// pre-aggregated per call first so the join cannot multiply the call sums -
// and carries the dominant currency and the distinct currency list as JSON,
// plus the priced and unpriced call counts and the token buckets the unpriced
// calls spent (the coverage the envelope repeats for a caller that reads only
// the summary);
// TopFiles applies the route's TopFileLimit of 5 in SQL. Files is the FILES
// view: one CTE per aggregate (this session's money, the touches with their
// kind counts and stage set, the edit lines and bytes through Touch, the
// lifetime money with no session filter, the last turn's money and the
// verdict), joined on FileId in one FROM clause where the money never meets
// Touch, sorted by total then path and capped at 500 rows. Stages groups
// this session's touches by Stage with the carrying call's allocation to the
// touched file; Models groups this session's calls by provider and model
// with the tokens the calls reported and the money their allocations
// carried, its per-call money pre-aggregated so the file grain cannot
// multiply the token sums. Policy is the one statement not keyed by the
// session: the ledger's declared attribution policy - the newest Valuation
// row's PolicyVersion, else the newest Allocation row's Method, else the v5
// seed's own 'bytes/context' fallback - which the valuation block labels the
// recorded money's split with.
const Query = {
	Session: `SELECT Session.Title AS Title,
    Session.Cwd AS Cwd,
    Session.Origin AS Origin,
    Session.AgentPreset AS AgentPreset,
    Session.ParentSessionId AS ParentSessionId,
    Session.DelegationDepth AS DelegationDepth,
    Session.CreatedAt AS CreatedAt,
    Session.EndedAt AS EndedAt
FROM Session
WHERE Session.SessionId = ?;`,

	Project: `SELECT Project.Name AS Name,
    Project.Root AS Root,
    Client.Name AS ClientName
FROM Session
LEFT JOIN Project ON Project.ProjectId = Session.ProjectId
LEFT JOIN Client ON Client.ClientId = Project.ClientId
WHERE Session.SessionId = ?;`,

	Calls: `SELECT Call.CallId AS CallId,
    Call.Turn AS Turn,
    Call.Step AS Step,
    Call.Seq AS Seq,
    Call.At AS At,
    Call.Provider AS Provider,
    Call.Model AS Model,
    Call.Mode AS Mode,
    Call.Region AS Region,
    Call.Tier AS Tier,
    Call.PriceId IS NOT NULL AS Priced,
    Call.Currency AS Currency,
    Call.InputTokens AS InputTokens,
    Call.OutputTokens AS OutputTokens,
    Call.CacheReadTokens AS CacheReadTokens,
    Call.CacheWriteTokens AS CacheWriteTokens,
    Call.ReasoningTokens AS ReasoningTokens,
    Call.TotalTokens AS TotalTokens,
    Call.CostInput AS CostInput,
    Call.CostOutput AS CostOutput,
    Call.CostCacheRead AS CostCacheRead,
    Call.CostCacheWrite AS CostCacheWrite,
    Call.CostReasoning AS CostReasoning,
    Call.CostTotal AS CostTotal,
    Call.CacheSaving AS CacheSaving,
    Call.Attempts AS Attempts,
    Call.ErrorCode AS ErrorCode,
    Call.SurfaceTokens AS SurfaceTokens,
    Call.Purpose AS Purpose,
    Call.ContextWindow AS ContextWindow,
    Call.Utilization AS Utilization,
    Call.LatencyMs AS LatencyMs,
    Call.FirstTokenMs AS FirstTokenMs,
    Call.TokensPerSecond AS TokensPerSecond
FROM Call
WHERE Call.SessionId = ?
ORDER BY Call.Turn DESC, Call.Step DESC
LIMIT ?;`,

	Touches: `SELECT Touch.CallId AS CallId,
    Touch.FileId AS FileId,
    File.Path AS Path,
    Touch.Kind AS Kind,
    Touch.Stage AS Stage,
    Touch.Tool AS Tool,
    Touch.Branch AS Branch,
    Touch.ReadBeforeEdit AS ReadBeforeEdit,
    Touch.LinesDelta AS LinesDelta,
    Touch.BytesDelta AS BytesDelta,
    Touch.DurationMs AS DurationMs,
    Touch.Seq AS Seq,
    Touch.At AS At
FROM Touch
JOIN File ON File.FileId = Touch.FileId
WHERE Touch.SessionId = ?
ORDER BY Touch.CallId ASC, Touch.Seq ASC;`,

	Allocations: `SELECT Allocation.CallId AS CallId,
    Allocation.FileId AS FileId,
    File.Path AS Path,
    Allocation.DirectCost AS DirectCost,
    Allocation.AmortizedCost AS AmortizedCost
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
LEFT JOIN File ON File.FileId = Allocation.FileId
WHERE Call.SessionId = ?;`,

	Summary: `WITH CallRow AS (
    SELECT Call.CallId AS CallId, Call.Turn AS Turn, Call.PriceId AS PriceId,
        Call.InputTokens AS InputTokens, Call.OutputTokens AS OutputTokens,
        Call.CacheReadTokens AS CacheReadTokens, Call.CacheWriteTokens AS CacheWriteTokens,
        Call.ReasoningTokens AS ReasoningTokens, Call.TotalTokens AS TotalTokens,
        Call.CostInput AS CostInput, Call.CostOutput AS CostOutput,
        Call.CostCacheRead AS CostCacheRead, Call.CostCacheWrite AS CostCacheWrite,
        Call.CostReasoning AS CostReasoning, Call.CostTotal AS CostTotal,
        Call.CacheSaving AS CacheSaving, Call.Currency AS Currency
    FROM Call
    WHERE Call.SessionId = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    WHERE Allocation.CallId IN (SELECT CallId FROM CallRow)
    GROUP BY Allocation.CallId
)
SELECT
    (SELECT COUNT(*) FROM CallRow) AS Calls,
    (SELECT COUNT(*) FROM CallRow WHERE PriceId IS NOT NULL) AS Priced,
    (SELECT COUNT(*) FROM CallRow WHERE PriceId IS NULL) AS Unpriced,
    (SELECT SUM(InputTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedInput,
    (SELECT SUM(OutputTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedOutput,
    (SELECT SUM(CacheReadTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedCacheRead,
    (SELECT SUM(CacheWriteTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedCacheWrite,
    (SELECT SUM(ReasoningTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedReasoning,
    (SELECT SUM(TotalTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedReported,
    (SELECT COUNT(DISTINCT Turn) FROM CallRow) AS Turns,
    (SELECT COUNT(*) FROM CallRow) AS Steps,
    (SELECT SUM(InputTokens) FROM CallRow) AS InputTokens,
    (SELECT SUM(OutputTokens) FROM CallRow) AS OutputTokens,
    (SELECT SUM(CacheReadTokens) FROM CallRow) AS CacheReadTokens,
    (SELECT SUM(CacheWriteTokens) FROM CallRow) AS CacheWriteTokens,
    (SELECT SUM(ReasoningTokens) FROM CallRow) AS ReasoningTokens,
    (SELECT SUM(TotalTokens) FROM CallRow) AS ReportedTokens,
    (SELECT SUM(CostInput) FROM CallRow) AS CostInput,
    (SELECT SUM(CostOutput) FROM CallRow) AS CostOutput,
    (SELECT SUM(CostCacheRead) FROM CallRow) AS CostCacheRead,
    (SELECT SUM(CostCacheWrite) FROM CallRow) AS CostCacheWrite,
    (SELECT SUM(CostReasoning) FROM CallRow) AS CostReasoning,
    (SELECT SUM(CostTotal) FROM CallRow) AS CostTotal,
    (SELECT SUM(CacheSaving) FROM CallRow) AS Saving,
    (SELECT SUM(Direct) FROM CallMoney) AS Direct,
    (SELECT SUM(Amortized) FROM CallMoney) AS Amortized,
    (SELECT COUNT(DISTINCT Allocation.FileId) FROM Allocation
        WHERE Allocation.CallId IN (SELECT CallId FROM CallRow)) AS Files,
    (SELECT Listed.Currency FROM (
            SELECT Currency, SUM(CostTotal) AS Total FROM CallRow GROUP BY Currency
        ) AS Listed
        ORDER BY Listed.Total DESC, Listed.Currency ASC LIMIT 1) AS Currency,
    (SELECT json_group_array(Listed.Currency) FROM (
            SELECT DISTINCT Currency FROM CallRow ORDER BY Currency ASC
        ) AS Listed) AS Currencies;`,

	TopFiles: `SELECT File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
WHERE Call.SessionId = ?
GROUP BY File.Path
ORDER BY SUM(Allocation.DirectCost + Allocation.AmortizedCost) DESC, File.Path ASC
LIMIT 5;`,

	Files: `WITH SessionCall AS (
    SELECT Call.CallId AS CallId, Call.Turn AS Turn
    FROM Call
    WHERE Call.SessionId = ?
),
Money AS (
    SELECT Allocation.FileId AS FileId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    JOIN SessionCall ON SessionCall.CallId = Allocation.CallId
    WHERE Allocation.FileId IS NOT NULL
    GROUP BY Allocation.FileId
),
TurnMoney AS (
    SELECT Allocation.FileId AS FileId,
        SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Turn
    FROM Allocation
    JOIN SessionCall ON SessionCall.CallId = Allocation.CallId
    WHERE Allocation.FileId IS NOT NULL
        AND SessionCall.Turn = (SELECT MAX(Turn) FROM SessionCall)
    GROUP BY Allocation.FileId
),
Lifetime AS (
    SELECT Allocation.FileId AS FileId,
        SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Lifetime
    FROM Allocation
    JOIN Call ON Call.CallId = Allocation.CallId
    WHERE Allocation.FileId IS NOT NULL
    GROUP BY Allocation.FileId
),
Tally AS (
    SELECT Touch.FileId AS FileId,
        COUNT(*) AS Touches,
        SUM(CASE WHEN Touch.Kind = 'read' THEN 1 ELSE 0 END) AS Reads,
        SUM(CASE WHEN Touch.Kind = 'write' THEN 1 ELSE 0 END) AS Writes,
        SUM(CASE WHEN Touch.Kind = 'edit' THEN 1 ELSE 0 END) AS Edits,
        SUM(CASE WHEN Touch.Kind = 'search' THEN 1 ELSE 0 END) AS Searches,
        MAX(Touch.ReadBeforeEdit) AS ReadBeforeEdit,
        GROUP_CONCAT(DISTINCT COALESCE(Touch.Stage, 'unclassified')) AS Stages,
        MIN(Touch.At) AS FirstAt,
        MAX(Touch.At) AS LastAt
    FROM Touch
    JOIN SessionCall ON SessionCall.CallId = Touch.CallId
    GROUP BY Touch.FileId
),
EditLine AS (
    SELECT Touch.FileId AS FileId,
        SUM(Edit.LinesAdded) AS Added,
        SUM(Edit.LinesRemoved) AS Removed,
        SUM(Edit.BytesAdded) AS BytesAdded,
        SUM(Edit.BytesRemoved) AS BytesRemoved
    FROM Edit
    JOIN Touch ON Touch.TouchId = Edit.TouchId
    JOIN SessionCall ON SessionCall.CallId = Touch.CallId
    GROUP BY Touch.FileId
),
VerdictRow AS (
    SELECT Verdict.FileId AS FileId, Verdict.State AS State
    FROM Verdict
    WHERE Verdict.SessionId = ?
),
Seed AS (
    SELECT FileId FROM Tally
    UNION
    SELECT FileId FROM Money
)
SELECT File.Path AS Path,
    COALESCE(Tally.Touches, 0) AS Touches,
    COALESCE(Tally.Reads, 0) AS Reads,
    COALESCE(Tally.Edits, 0) AS Edits,
    COALESCE(Tally.Writes, 0) AS Writes,
    COALESCE(Tally.Searches, 0) AS Searches,
    COALESCE(EditLine.Added, 0) AS Added,
    COALESCE(EditLine.Removed, 0) AS Removed,
    COALESCE(EditLine.BytesAdded, 0) AS BytesAdded,
    COALESCE(EditLine.BytesRemoved, 0) AS BytesRemoved,
    COALESCE(Money.Direct, 0) AS Direct,
    COALESCE(Money.Amortized, 0) AS Amortized,
    COALESCE(Money.Direct, 0) + COALESCE(Money.Amortized, 0) AS Total,
    Lifetime.Lifetime AS Lifetime,
    TurnMoney.Turn AS Turn,
    Tally.Stages AS Stages,
    VerdictRow.State AS Verdict,
    COALESCE(Tally.ReadBeforeEdit, 0) AS ReadBeforeEdit,
    Tally.FirstAt AS FirstAt,
    Tally.LastAt AS LastAt
FROM Seed
JOIN File ON File.FileId = Seed.FileId
LEFT JOIN Tally ON Tally.FileId = Seed.FileId
LEFT JOIN Money ON Money.FileId = Seed.FileId
LEFT JOIN TurnMoney ON TurnMoney.FileId = Seed.FileId
LEFT JOIN Lifetime ON Lifetime.FileId = Seed.FileId
LEFT JOIN EditLine ON EditLine.FileId = Seed.FileId
LEFT JOIN VerdictRow ON VerdictRow.FileId = Seed.FileId
ORDER BY (COALESCE(Money.Direct, 0) + COALESCE(Money.Amortized, 0)) DESC, File.Path ASC
LIMIT 500;`,

	Stages: `SELECT COALESCE(Touch.Stage, 'unclassified') AS Stage,
    COUNT(*) AS Touches,
    SUM(Call.TotalTokens) AS Tokens,
    SUM(COALESCE(Allocation.DirectCost, 0) + COALESCE(Allocation.AmortizedCost, 0)) AS Cost
FROM Touch
JOIN Call ON Call.CallId = Touch.CallId
LEFT JOIN Allocation ON Allocation.CallId = Touch.CallId AND Allocation.FileId = Touch.FileId
WHERE Call.SessionId = ?
GROUP BY Stage
ORDER BY Cost DESC, Stage ASC;`,

	Models: `WITH CallRow AS (
    SELECT Call.CallId AS CallId, Call.Provider AS Provider, Call.Model AS Model,
        Call.InputTokens AS InputTokens, Call.OutputTokens AS OutputTokens,
        Call.CacheReadTokens AS CacheReadTokens
    FROM Call
    WHERE Call.SessionId = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Cost
    FROM Allocation
    JOIN CallRow ON CallRow.CallId = Allocation.CallId
    GROUP BY Allocation.CallId
)
SELECT CallRow.Provider AS Provider,
    CallRow.Model AS Model,
    COUNT(*) AS Calls,
    SUM(CallRow.InputTokens) AS Input,
    SUM(CallRow.OutputTokens) AS Output,
    SUM(CallRow.CacheReadTokens) AS CacheRead,
    SUM(COALESCE(CallMoney.Cost, 0)) AS Total
FROM CallRow
LEFT JOIN CallMoney ON CallMoney.CallId = CallRow.CallId
GROUP BY CallRow.Provider, CallRow.Model
ORDER BY Total DESC, CallRow.Provider ASC, CallRow.Model ASC;`,

	Policy: `SELECT COALESCE(
    (SELECT Valuation.PolicyVersion FROM Valuation ORDER BY Valuation.ValuationId DESC LIMIT 1),
    (SELECT Allocation.Method FROM Allocation ORDER BY Allocation.AllocationId DESC LIMIT 1),
    'bytes/context') AS PolicyVersion;`,
} as const;

// The row budget the reader applies (the tab's Limits, kept identical so the
// engine's window matches the view's): the default when the caller carries no
// usable rows value and the two clamp ends.
const DefaultRows = 200;
const MinRows = 1;
const MaxRows = 2000;

export default function Reader(
	Database: DatabaseSync,
	SessionId: string,
	Rows: number,
	Selection?: ValuationSelection,
	Pricing?: PricingService,
): CostResponse {
	const Requested = Number.isFinite(Rows) ? Math.floor(Rows) : DefaultRows;
	const Budget = Math.min(Math.max(Requested, MinRows), MaxRows);
	const EmptyRow: Record<string, SQLOutputValue> = {};

	const Text = (Row: Record<string, SQLOutputValue>, Key: string): string | null => {
		const Value = Row[Key];
		return typeof Value === "string" ? Value : null;
	};
	const Figure = (Row: Record<string, SQLOutputValue>, Key: string): number | null => {
		const Value = Row[Key];
		return typeof Value === "number" && Number.isFinite(Value) ? Value : null;
	};
	const Stored = (Row: Record<string, SQLOutputValue>, Key: string): number =>
		Figure(Row, Key) ?? 0;
	const Flag = (Row: Record<string, SQLOutputValue>, Key: string): boolean => Row[Key] === 1;
	const CacheHit = (Input: number, CacheRead: number, CacheWrite: number): number | null => {
		const Served = CacheRead + Input + CacheWrite;
		return Served > 0 ? Math.min(1, CacheRead / Served) : null;
	};
	const Tokens = (Row: Record<string, SQLOutputValue>): CostTokens => {
		const Input = Stored(Row, "InputTokens");
		const Output = Stored(Row, "OutputTokens");
		const CacheRead = Stored(Row, "CacheReadTokens");
		const CacheWrite = Stored(Row, "CacheWriteTokens");
		return {
			input: Input,
			output: Output,
			cacheRead: CacheRead,
			cacheWrite: CacheWrite,
			reasoning: Stored(Row, "ReasoningTokens"),
			total: Input + CacheRead + CacheWrite + Output,
			reported: Figure(Row, "TotalTokens"),
		};
	};
	const Buckets = (Row: Record<string, SQLOutputValue>): CostBuckets => {
		const Input = Stored(Row, "CostInput");
		const Output = Stored(Row, "CostOutput");
		const CacheRead = Stored(Row, "CostCacheRead");
		const Total = Stored(Row, "CostTotal");
		return {
			input: Input,
			output: Output,
			cacheRead: CacheRead,
			cacheWrite: Stored(Row, "CostCacheWrite"),
			reasoning: Stored(Row, "CostReasoning"),
			total: Total,
			other: Math.max(0, Total - CacheRead - Input - Output),
		};
	};
	const CurrencyList = (Raw: SQLOutputValue | undefined): readonly string[] => {
		if (typeof Raw !== "string") {
			return [];
		}
		const Parsed: unknown = JSON.parse(Raw);
		return Array.isArray(Parsed)
			? Parsed.filter((One): One is string => typeof One === "string")
			: [];
	};
	// One money column of a view row: the rounding is to the sixth decimal,
	// the precision every report read lands on, so a file row, a stage row and
	// a model row agree with the report of the same sum.
	const Round = (Value: number): number => Math.round(Value * 1e6) / 1e6;
	// The stage set a file passed through: the statement hands it over as one
	// comma-joined list (the stage vocabulary carries no comma), so the reader
	// splits it and sorts it, because the aggregate itself defines no order.
	const StageList = (Raw: SQLOutputValue | undefined): readonly string[] => {
		if (typeof Raw !== "string") {
			return [];
		}
		const Found = Raw.split(",").filter((One) => One.length > 0);
		return Found.sort();
	};
	// The valuation block (lane B4d; the research's sections 4 and 8): the
	// headline comparison a selected basis adds to the envelope. `recorded` is
	// the preview's stored money and `revised` its repriced total, both over
	// the same calls, so `difference` compares like with like; the preview
	// reads the whole session rather than the page budget, so the block is a
	// session headline. `unpriced` is the preview's own count of the calls the
	// selected revision could not price, never the recorded summary's count,
	// because the two figures answer different questions and the comparison
	// names one revision. `policyVersion` is the attribution policy the ledger
	// declares - the newest Valuation row, else the newest Allocation method,
	// else the v5 seed's own fallback - because this lane reallocates nothing
	// and the recorded split is the ledger's own fact. An absent selection, the
	// 'as-recorded' basis and a basis without a revision all answer undefined,
	// so the recorded read keeps its exact bytes; a basis that names a
	// revision while the pricing service is absent is one actionable line,
	// never a silently recorded-only answer.
	const Comparison = (): Valuation | undefined => {
		// The two locals narrow the optional selection for the switch's later
		// arms; a switch (true) arm cannot narrow the original binding.
		const Basis = Selection?.basis ?? "as-recorded";
		const Revision = Selection?.revisionId;
		switch (true) {
			case Basis === "as-recorded":
				return undefined;
			case Revision === undefined:
				return undefined;
			case Pricing === undefined:
				throw new Error(
					`plugin-dsh-cost: the valuation basis "${Basis}" needs the pricing service, which this context did not provide - the ledger write handle was absent`,
				);
			default: {
				const Preview = Pricing.preview(Revision, SessionId);
				const Policy = Database.prepare(Query.Policy).get() ?? EmptyRow;
				return {
					basis: Basis,
					revisionId: Revision,
					policyVersion: Text(Policy, "PolicyVersion") ?? "bytes/context",
					calculatedAt: Date.now(),
					recorded: Preview.current,
					revised: Preview.revised,
					difference: Preview.difference,
					unpriced: Preview.unpriced,
				};
			}
		}
	};

	const SessionRow = Database.prepare(Query.Session).get(SessionId);
	if (SessionRow === undefined) {
		return {
			ok: false,
			code: "session",
			message: `client-dsh-panel-cost: the session ${SessionId} is not recorded in the ledger`,
			path: "",
			rows: Budget,
			truncated: false,
			session: null,
			currency: "USD",
			currencies: [],
			summary: {
				calls: 0,
				priced: 0,
				unpriced: 0,
				turns: 0,
				steps: 0,
				tokens: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					reasoning: 0,
					total: 0,
					reported: null,
				},
				cost: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					reasoning: 0,
					total: 0,
					other: 0,
				},
				direct: 0,
				amortized: 0,
				saving: 0,
				cacheHit: null,
				files: 0,
				currency: "USD",
				currencies: [],
				topFiles: [],
			},
			coverage: {
				calls: 0,
				priced: 0,
				unpriced: 0,
				unpricedTokens: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					reasoning: 0,
					total: 0,
					reported: null,
				},
			},
			calls: [],
			files: null,
			stages: null,
			models: null,
		};
	}

	const ProjectRow = Database.prepare(Query.Project).get(SessionId) ?? EmptyRow;
	const Session: CostSession = {
		id: SessionId,
		project: Text(ProjectRow, "Name"),
		root: Text(ProjectRow, "Root"),
		client: Text(ProjectRow, "ClientName"),
		title: Text(SessionRow, "Title"),
		cwd: Text(SessionRow, "Cwd"),
		origin: Text(SessionRow, "Origin"),
		agentPreset: Text(SessionRow, "AgentPreset"),
		parentSessionId: Text(SessionRow, "ParentSessionId"),
		delegationDepth: Figure(SessionRow, "DelegationDepth"),
		createdAt: Stored(SessionRow, "CreatedAt"),
		endedAt: Figure(SessionRow, "EndedAt"),
	};

	const CallRows = Database.prepare(Query.Calls).all(SessionId, Budget);
	const TouchRows = Database.prepare(Query.Touches).all(SessionId);
	const AllocationRows = Database.prepare(Query.Allocations).all(SessionId);
	const TopFileRows = Database.prepare(Query.TopFiles).all(SessionId);
	const SummaryRow = Database.prepare(Query.Summary).get(SessionId) ?? EmptyRow;
	// The three view statements: the file rows bind the session twice (the
	// session's calls and the session's verdicts), and every placeholder is
	// the same id, so no view can read another session's rows.
	const FileRows = Database.prepare(Query.Files).all(SessionId, SessionId);
	const StageRows = Database.prepare(Query.Stages).all(SessionId);
	const ModelRows = Database.prepare(Query.Models).all(SessionId);

	const AllocationsByCall = new Map<number, Record<string, SQLOutputValue>[]>();
	for (const One of AllocationRows) {
		const Key = Stored(One, "CallId");
		const Owned = AllocationsByCall.get(Key);
		if (Owned === undefined) {
			AllocationsByCall.set(Key, [One]);
		} else {
			Owned.push(One);
		}
	}
	const TouchesByCall = new Map<number, Record<string, SQLOutputValue>[]>();
	for (const One of TouchRows) {
		const Key = Stored(One, "CallId");
		const Owned = TouchesByCall.get(Key);
		if (Owned === undefined) {
			TouchesByCall.set(Key, [One]);
		} else {
			Owned.push(One);
		}
	}

	const Calls: CostCall[] = CallRows.map((Row) => {
		const CallId = Stored(Row, "CallId");
		const At = Stored(Row, "At");
		const Own = AllocationsByCall.get(CallId) ?? [];
		const OwnTouches = TouchesByCall.get(CallId) ?? [];
		const ByFile = new Map<number, CostFile>();
		for (const Touch of OwnTouches) {
			const FileId = Stored(Touch, "FileId");
			if (ByFile.has(FileId)) {
				continue;
			}
			ByFile.set(FileId, {
				path: Text(Touch, "Path") ?? "",
				kind: Text(Touch, "Kind"),
				stage: Text(Touch, "Stage"),
				tool: Text(Touch, "Tool"),
				branch: Text(Touch, "Branch"),
				readBeforeEdit: Flag(Touch, "ReadBeforeEdit"),
				direct: 0,
				amortized: 0,
				total: 0,
				linesDelta: Figure(Touch, "LinesDelta"),
				bytesDelta: Figure(Touch, "BytesDelta"),
				durationMs: Figure(Touch, "DurationMs"),
				touched: true,
				at: Stored(Touch, "At"),
			});
		}
		for (const Allocation of Own) {
			const PathValue = Text(Allocation, "Path");
			if (PathValue === null) {
				continue;
			}
			const FileId = Stored(Allocation, "FileId");
			const Direct = Stored(Allocation, "DirectCost");
			const Amortized = Stored(Allocation, "AmortizedCost");
			const Existing = ByFile.get(FileId);
			if (Existing === undefined) {
				ByFile.set(FileId, {
					path: PathValue,
					kind: null,
					stage: null,
					tool: null,
					branch: null,
					readBeforeEdit: false,
					direct: Direct,
					amortized: Amortized,
					total: Direct + Amortized,
					linesDelta: null,
					bytesDelta: null,
					durationMs: null,
					touched: false,
					at: At,
				});
				continue;
			}
			Existing.direct += Direct;
			Existing.amortized += Amortized;
			Existing.total = Existing.direct + Existing.amortized;
		}
		const Files = [...ByFile.values()].sort(
			(A, B) => B.total - A.total || (A.path < B.path ? -1 : 1),
		);
		const Direct = Own.reduce((Sum, One) => Sum + Stored(One, "DirectCost"), 0);
		const Amortized = Own.reduce((Sum, One) => Sum + Stored(One, "AmortizedCost"), 0);
		return {
			turn: Stored(Row, "Turn"),
			step: Stored(Row, "Step"),
			seq: Stored(Row, "Seq"),
			at: At,
			provider: Text(Row, "Provider") ?? "",
			model: Text(Row, "Model") ?? "",
			mode: Text(Row, "Mode") ?? "standard",
			region: Text(Row, "Region"),
			tier: Figure(Row, "Tier"),
			priced: Flag(Row, "Priced"),
			currency: Text(Row, "Currency") ?? "USD",
			tokens: Tokens(Row),
			cost: Buckets(Row),
			saving: Stored(Row, "CacheSaving"),
			attempts: Stored(Row, "Attempts"),
			error: Text(Row, "ErrorCode"),
			surfaceTokens: Stored(Row, "SurfaceTokens"),
			purpose: Text(Row, "Purpose"),
			contextWindow: Figure(Row, "ContextWindow"),
			utilization: Figure(Row, "Utilization"),
			latencyMs: Figure(Row, "LatencyMs"),
			firstTokenMs: Figure(Row, "FirstTokenMs"),
			tokensPerSecond: Figure(Row, "TokensPerSecond"),
			direct: Direct,
			amortized: Amortized,
			allocations: Own.length,
			files: Files,
		};
	});
	Calls.sort((A, B) => A.turn - B.turn || A.step - B.step);

	const SummaryInput = Stored(SummaryRow, "InputTokens");
	const SummaryOutput = Stored(SummaryRow, "OutputTokens");
	const SummaryCacheRead = Stored(SummaryRow, "CacheReadTokens");
	const SummaryCacheWrite = Stored(SummaryRow, "CacheWriteTokens");
	const SummaryCostInput = Stored(SummaryRow, "CostInput");
	const SummaryCostOutput = Stored(SummaryRow, "CostOutput");
	const SummaryCostCacheRead = Stored(SummaryRow, "CostCacheRead");
	const SummaryCostTotal = Stored(SummaryRow, "CostTotal");
	const TopFiles: CostTopFile[] = TopFileRows.map((Row) => {
		const Direct = Stored(Row, "Direct");
		const Amortized = Stored(Row, "Amortized");
		return {
			path: Text(Row, "Path") ?? "",
			direct: Direct,
			amortized: Amortized,
			total: Direct + Amortized,
			calls: Stored(Row, "Calls"),
		};
	});
	// The FILES view: one row per file the session touched or allocated to,
	// with this session's money, the file's all-sessions lifetime (null when
	// no allocation ever priced it, which also leaves the carry-in null), the
	// session's last turn's share (null when that turn did not allocate it)
	// and the change the edit grain recorded. Every count is zero when the
	// statement stores none, never a guess.
	const Files: CostFileRow[] = FileRows.map((Row) => {
		const Direct = Round(Stored(Row, "Direct"));
		const Amortized = Round(Stored(Row, "Amortized"));
		const Total = Round(Direct + Amortized);
		const Lifetime = Figure(Row, "Lifetime");
		return {
			path: Text(Row, "Path") ?? "",
			touches: Stored(Row, "Touches"),
			reads: Stored(Row, "Reads"),
			edits: Stored(Row, "Edits"),
			writes: Stored(Row, "Writes"),
			searches: Stored(Row, "Searches"),
			added: Stored(Row, "Added"),
			removed: Stored(Row, "Removed"),
			bytesAdded: Stored(Row, "BytesAdded"),
			bytesRemoved: Stored(Row, "BytesRemoved"),
			direct: Direct,
			amortized: Amortized,
			total: Total,
			lifetime: Lifetime,
			before: Lifetime === null ? null : Round(Lifetime - Total),
			turn: Figure(Row, "Turn"),
			stages: StageList(Row["Stages"]),
			verdict: Text(Row, "Verdict"),
			readBeforeEdit: Flag(Row, "ReadBeforeEdit"),
			firstAt: Figure(Row, "FirstAt"),
			lastAt: Figure(Row, "LastAt"),
		};
	});
	// The STAGES view: the stage ranking the report reads by file, scoped to
	// this session and keyed by the stage the touches carry, with an
	// unclassified touch its own row and the tokens zero when no call
	// reported them.
	const Stages: CostStageRow[] = StageRows.map((Row) => ({
		stage: Text(Row, "Stage") ?? "unclassified",
		touches: Stored(Row, "Touches"),
		tokens: Stored(Row, "Tokens"),
		cost: Round(Stored(Row, "Cost")),
	}));
	// The MODELS view: one row per provider and model this session called,
	// with the tokens the calls reported and the money their allocations
	// carried across every file they touched.
	const Models: CostModelRow[] = ModelRows.map((Row) => {
		const Input = Stored(Row, "Input");
		const Output = Stored(Row, "Output");
		const CacheRead = Stored(Row, "CacheRead");
		return {
			provider: Text(Row, "Provider") ?? "",
			model: Text(Row, "Model") ?? "",
			calls: Stored(Row, "Calls"),
			tokens: Input + Output + CacheRead,
			input: Input,
			output: Output,
			cacheRead: CacheRead,
			total: Round(Stored(Row, "Total")),
		};
	});
	const Summary: CostSummary = {
		calls: Stored(SummaryRow, "Calls"),
		priced: Stored(SummaryRow, "Priced"),
		unpriced: Stored(SummaryRow, "Unpriced"),
		turns: Stored(SummaryRow, "Turns"),
		steps: Stored(SummaryRow, "Steps"),
		tokens: {
			input: SummaryInput,
			output: SummaryOutput,
			cacheRead: SummaryCacheRead,
			cacheWrite: SummaryCacheWrite,
			reasoning: Stored(SummaryRow, "ReasoningTokens"),
			total: SummaryInput + SummaryCacheRead + SummaryCacheWrite + SummaryOutput,
			reported: Figure(SummaryRow, "ReportedTokens"),
		},
		cost: {
			input: SummaryCostInput,
			output: SummaryCostOutput,
			cacheRead: SummaryCostCacheRead,
			cacheWrite: Stored(SummaryRow, "CostCacheWrite"),
			reasoning: Stored(SummaryRow, "CostReasoning"),
			total: SummaryCostTotal,
			other: Math.max(
				0,
				SummaryCostTotal - SummaryCostCacheRead - SummaryCostInput - SummaryCostOutput,
			),
		},
		direct: Stored(SummaryRow, "Direct"),
		amortized: Stored(SummaryRow, "Amortized"),
		saving: Stored(SummaryRow, "Saving"),
		cacheHit: CacheHit(SummaryInput, SummaryCacheRead, SummaryCacheWrite),
		files: Stored(SummaryRow, "Files"),
		currency: Text(SummaryRow, "Currency") ?? "USD",
		currencies: CurrencyList(SummaryRow["Currencies"]),
		topFiles: TopFiles,
	};
	// The coverage the envelope carries beside the summary (research section
	// 2.2): the same counts the summary states, plus the token buckets the
	// unpriced calls spent - read from the same statement, so the two can
	// never disagree. A session with no unpriced call carries zeros here, and
	// a zero-cost call is then read as unpriced only when the count says so.
	const UnpricedInput = Stored(SummaryRow, "UnpricedInput");
	const UnpricedOutput = Stored(SummaryRow, "UnpricedOutput");
	const UnpricedCacheRead = Stored(SummaryRow, "UnpricedCacheRead");
	const UnpricedCacheWrite = Stored(SummaryRow, "UnpricedCacheWrite");
	const Coverage = {
		calls: Summary.calls,
		priced: Summary.priced,
		unpriced: Summary.unpriced,
		unpricedTokens: {
			input: UnpricedInput,
			output: UnpricedOutput,
			cacheRead: UnpricedCacheRead,
			cacheWrite: UnpricedCacheWrite,
			reasoning: Stored(SummaryRow, "UnpricedReasoning"),
			total: UnpricedInput + UnpricedCacheRead + UnpricedCacheWrite + UnpricedOutput,
			reported: Figure(SummaryRow, "UnpricedReported"),
		},
	};

	const Envelope: CostResponse = {
		ok: true,
		code: "ok",
		message: null,
		path: "",
		rows: Budget,
		truncated: Calls.length === Budget,
		session: Session,
		currency: Summary.currency,
		currencies: Summary.currencies,
		summary: Summary,
		coverage: Coverage,
		calls: Calls,
		files: Files,
		stages: Stages,
		models: Models,
	};
	// The recorded read returns the envelope exactly as built; a selected
	// basis appends the block, so the JSON carries no `valuation` key at all
	// when the caller names none.
	const Block = Comparison();
	return Block === undefined ? Envelope : { ...Envelope, valuation: Block };
}
