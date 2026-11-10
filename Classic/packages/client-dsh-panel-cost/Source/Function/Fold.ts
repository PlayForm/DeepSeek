/**
 * @module Fold
 *
 * The pure groupBy that turns the route's JSON envelope into the snapshot the table renders.
 *
 * @remarks
 * The ledger stores one row per (session, turn, step), so the fold groups the calls by turn, sorts
 * every group ascending by step, and computes the turn aggregates of the design's section 3 in one
 * pass per turn. It is pure and total: it never mutates the response, every optional or malformed
 * field is read defensively, the session summary is carried verbatim, an empty calls array yields
 * the empty snapshot, and no input can make it throw.
 */
import type CostBuckets from "@Interface/Buckets";
import type CostCall from "@Interface/Call";
import type CostFile from "@Interface/File";
import type CostResponse from "@Interface/Response";
import type CostSnapshot from "@Interface/Snapshot";
import type CostStep from "@Interface/Step";
import type CostSummary from "@Interface/Summary";
import type CostTally from "@Interface/Tally";
import type CostTokens from "@Interface/Tokens";
import type CostTurn from "@Interface/Turn";

type FileTally = {
	Count: number;
	Total: number;
	Direct: number;
	Amortized: number;
	Lines: number;
	Best: number;
	Stage: string | null;
	Touched: boolean;
};

type ToolTally = { Count: number };

const ZeroTokens: CostTokens = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	reasoning: 0,
	total: 0,
	reported: null,
};

const ZeroSummary: CostSummary = {
	calls: 0,
	priced: 0,
	unpriced: 0,
	turns: 0,
	steps: 0,
	tokens: ZeroTokens,
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
};

const N = (Value: unknown): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : 0;

const S = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const CacheHit = (Tokens: CostTokens | undefined): number | null => {
	const Read = N(Tokens?.cacheRead);
	const Input = N(Tokens?.input);
	const Write = N(Tokens?.cacheWrite);
	const Base = Read + Input + Write;
	switch (true) {
		case Base <= 0:
			return null;
		default:
			return Math.min(1, Read / Base);
	}
};

const FilesOf = (Call: CostCall): readonly unknown[] =>
	Array.isArray(Call.files) ? Call.files : [];

export default function Fold(Response: CostResponse): CostSnapshot {
	const Calls: readonly unknown[] = Array.isArray(Response?.calls) ? Response.calls : [];
	const Groups = new Map<number, CostCall[]>();
	for (const Item of Calls) {
		if (Item === null || typeof Item !== "object") continue;
		const Call = Item as CostCall;
		const Turn = N(Call.turn);
		const Group = Groups.get(Turn);
		if (Group === undefined) Groups.set(Turn, [Call]);
		else Group.push(Call);
	}
	const Turns: CostTurn[] = [];
	let Steps = 0;
	const Keys = [...Groups.keys()].sort((A, B) => A - B);
	for (const Key of Keys) {
		const Group = Groups.get(Key);
		if (Group === undefined) continue;
		Group.sort((A, B) => N(A.step) - N(B.step));
		const StepList: CostStep[] = [];
		const FileMap = new Map<string, FileTally>();
		const ToolMap = new Map<string, ToolTally>();
		const Currencies = new Set<string>();
		let At = Number.POSITIVE_INFINITY;
		let EndedAt = Number.NEGATIVE_INFINITY;
		let CostRead = 0;
		let CostInput = 0;
		let CostOutput = 0;
		let CostWrite = 0;
		let CostReasoning = 0;
		let CostTotal = 0;
		let TokenRead = 0;
		let TokenInput = 0;
		let TokenWrite = 0;
		let TokenOutput = 0;
		let TokenReasoning = 0;
		let Reported: number | null = null;
		let Direct = 0;
		let Amortized = 0;
		let Saving = 0;
		let Retries = 0;
		let Errors = 0;
		let Unpriced = 0;
		let Dominant: { Provider: string; Model: string; Money: number; Total: number } | undefined;
		for (const Call of Group) {
			StepList.push({ ...Call, cacheHit: CacheHit(Call.tokens) });
			if (typeof Call.at === "number" && Number.isFinite(Call.at)) {
				if (Call.at < At) At = Call.at;
				if (Call.at > EndedAt) EndedAt = Call.at;
			}
			CostRead += N(Call.cost?.cacheRead);
			CostInput += N(Call.cost?.input);
			CostOutput += N(Call.cost?.output);
			CostWrite += N(Call.cost?.cacheWrite);
			CostReasoning += N(Call.cost?.reasoning);
			CostTotal += N(Call.cost?.total);
			TokenRead += N(Call.tokens?.cacheRead);
			TokenInput += N(Call.tokens?.input);
			TokenWrite += N(Call.tokens?.cacheWrite);
			TokenOutput += N(Call.tokens?.output);
			TokenReasoning += N(Call.tokens?.reasoning);
			const ReportedValue = Call.tokens?.reported;
			if (typeof ReportedValue === "number" && Number.isFinite(ReportedValue))
				Reported = (Reported ?? 0) + ReportedValue;
			Direct += N(Call.direct);
			Amortized += N(Call.amortized);
			Saving += N(Call.saving);
			Retries += Math.max(0, N(Call.attempts) - 1);
			if (Call.error != null) Errors += 1;
			if (Call.priced === false) Unpriced += 1;
			const Currency = S(Call.currency);
			if (Currency !== "") Currencies.add(Currency);
			const Money = N(Call.cost?.total);
			const Total = N(Call.tokens?.total);
			if (Dominant === undefined)
				Dominant = { Provider: S(Call.provider), Model: S(Call.model), Money, Total };
			else if (Money > Dominant.Money)
				Dominant = { Provider: S(Call.provider), Model: S(Call.model), Money, Total };
			else if (Money === Dominant.Money && Total > Dominant.Total)
				Dominant = { Provider: S(Call.provider), Model: S(Call.model), Money, Total };
			for (const Item of FilesOf(Call)) {
				if (Item === null || typeof Item !== "object") continue;
				const File = Item as CostFile;
				const Path = S(File.path);
				if (Path === "") continue;
				const Money2 = N(File.total);
				const Stage = S(File.stage);
				const Entry = FileMap.get(Path) ?? {
					Count: 0,
					Total: 0,
					Direct: 0,
					Amortized: 0,
					Lines: 0,
					Best: Number.NEGATIVE_INFINITY,
					Stage: null,
					Touched: false,
				};
				Entry.Count += 1;
				Entry.Total += Money2;
				Entry.Direct += N(File.direct);
				Entry.Amortized += N(File.amortized);
				if (typeof File.linesDelta === "number" && Number.isFinite(File.linesDelta))
					Entry.Lines += File.linesDelta;
				if (Money2 > Entry.Best) {
					Entry.Best = Money2;
					Entry.Stage = Stage || null;
				}
				if (File.touched === true) Entry.Touched = true;
				FileMap.set(Path, Entry);
				if (File.touched !== true) continue;
				const Tool = S(File.tool);
				if (Tool === "") continue;
				const Tally = ToolMap.get(Tool) ?? { Count: 0 };
				Tally.Count += 1;
				ToolMap.set(Tool, Tally);
			}
		}
		if (!Number.isFinite(At)) At = 0;
		if (!Number.isFinite(EndedAt)) EndedAt = 0;
		const Cost: CostBuckets = {
			input: CostInput,
			output: CostOutput,
			cacheRead: CostRead,
			cacheWrite: CostWrite,
			reasoning: CostReasoning,
			total: CostTotal,
			other: Math.max(0, CostTotal - CostRead - CostInput - CostOutput),
		};
		const Tokens: CostTokens = {
			input: TokenInput,
			output: TokenOutput,
			cacheRead: TokenRead,
			cacheWrite: TokenWrite,
			reasoning: TokenReasoning,
			total: TokenInput + TokenRead + TokenWrite + TokenOutput,
			reported: Reported,
		};
		const Files: CostTally[] = [];
		for (const [Path, Entry] of FileMap)
			Files.push({
				key: Path,
				count: Entry.Count,
				total: Entry.Total,
				direct: Entry.Direct,
				amortized: Entry.Amortized,
				lines: Entry.Lines,
				stage: Entry.Touched ? Entry.Stage : null,
			});
		Files.sort((A, B) => B.total - A.total || (A.key < B.key ? -1 : A.key > B.key ? 1 : 0));
		const Tools: CostTally[] = [];
		for (const [Name, Entry] of ToolMap)
			Tools.push({
				key: Name,
				count: Entry.Count,
				total: 0,
				direct: 0,
				amortized: 0,
				lines: 0,
				stage: null,
			});
		Tools.sort((A, B) => B.count - A.count || (A.key < B.key ? -1 : A.key > B.key ? 1 : 0));
		let Currency = "";
		for (const Step of StepList) {
			const Name = S(Step.currency);
			if (Name !== "") {
				Currency = Name;
				break;
			}
		}
		Turns.push({
			turn: Key,
			at: At,
			endedAt: EndedAt,
			steps: StepList,
			cost: Cost,
			tokens: Tokens,
			cacheHit: CacheHit(Tokens),
			provider: Dominant?.Provider ?? "",
			model: Dominant?.Model ?? "",
			files: Files,
			tools: Tools,
			direct: Direct,
			amortized: Amortized,
			saving: Saving,
			retries: Retries,
			errors: Errors,
			unpriced: Unpriced,
			currency: Currency,
			mixed: Currencies.size > 1,
		});
		Steps += StepList.length;
	}
	return { turns: Turns, steps: Steps, summary: Response?.summary ?? ZeroSummary };
}
