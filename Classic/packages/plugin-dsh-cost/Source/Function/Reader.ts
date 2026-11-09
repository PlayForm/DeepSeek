// Reader - the engine's one ledger read that fills a CostResponse: the row
// budget clamped to the tab's limits, the session row joined through Project
// and Client, the newest calls with their touches and allocations folded into
// one CostFile per FileId (the first touch in Seq order supplies the touch
// fields, the single allocation row supplies the money, and the unattributed
// allocation row stays out of `files` but keeps its money in `direct` and
// `amortized`), and the whole-session summary. Every statement runs through
// the Query table below and reads only; a session the ledger does not record
// answers ok false with code "session" and the zero summary; every nullable
// column stays null when the ledger stores no value. The read-only open lives
// in Function/Provide (the package's own Function/Open is the write path - it
// migrates the schema - so it is never reused here), which is why the reader
// sees only the open handle and the service overwrites `path` with the
// resolved ledger path.
import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type CostBuckets from "@Interface/Buckets.js";
import type CostCall from "@Interface/Call.js";
import type CostFile from "@Interface/File.js";
import type CostResponse from "@Interface/Response.js";
import type CostSession from "@Interface/Session.js";
import type CostSummary from "@Interface/Summary.js";
import type CostTokens from "@Interface/Tokens.js";
import type CostTopFile from "@Interface/TopFile.js";

// The seven read-only statements the engine runs (the panel's Design.md
// section 9.1): every one is a plain SELECT keyed by the session id, with no
// pragma that writes, no INSERT, UPDATE or DELETE. Calls selects the newest
// budget first and the reader re-sorts it ascending by (turn, step); Touches
// orders by (CallId, Seq) so a file's first touch in Seq order wins;
// Summary aggregates the whole session in one row - the allocation money is
// pre-aggregated per call first so the join cannot multiply the call sums -
// and carries the dominant currency and the distinct currency list as JSON;
// TopFiles applies the route's TopFileLimit of 5 in SQL.
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
			calls: [],
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

	return {
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
		calls: Calls,
	};
}
