// StepRow - the step row: the toggle button (only when the step carries
// evidence: files, allocations, money, usage or an error), the state
// markers, the step clock beside the model pill, and one cell per resolved
// column. The row builds the cell source from the step's own ledger fields
// and lets each column's render build its cell, so a hidden or reordered
// column moves the header and the body together.
import type { TurnsCells } from "@Function/Columns";
import Stamp from "@Function/Stamp";
import type CostBuckets from "@Interface/Buckets";
import type CostFile from "@Interface/File";
import type CostStep from "@Interface/Step";
import type { ResolvedTable } from "@Interface/Table";
import type CostTokens from "@Interface/Tokens";
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

const CacheMissThreshold = 0.5;

type Marker = {
	Class: string;
	Text: string;
	Title?: string;
};

type StepRowProps = {
	Step: CostStep;
	Expanded: boolean;
	Scale: number;
	OnToggle: () => void;
	Resolved: ResolvedTable<TurnsCells>;
	t: Translate;
};

const Text = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const BaseName = (Path: string): string => {
	const Cut = Path.lastIndexOf("/");
	return Cut === -1 ? Path : Path.slice(Cut + 1);
};

const StageTones: Record<string, number> = {
	discover: 5,
	read: 0,
	reread: 0,
	edit: 2,
	verify: 1,
	revert: 3,
};

const StageTone = (Stage: string | null): number => {
	if (Stage === null) return 7;
	return StageTones[Stage] ?? 7;
};

const Markers = (Step: CostStep, t: Translate): readonly Marker[] => {
	const List: Marker[] = [];
	const Attempts = typeof Step.attempts === "number" ? Step.attempts : 1;
	if (Step.priced === false)
		List.push({
			Class: "playform-cost-state-unpriced",
			Text: t("state.unpriced"),
			Title: t("state.unpriced.title"),
		});
	if (typeof Step.error === "string")
		List.push({
			Class: "playform-cost-state-error",
			Text: t("state.failed"),
			Title: t("state.failed.title", { code: Step.error }),
		});
	if (Attempts > 1)
		List.push({
			Class: "playform-cost-state-attempts",
			Text: t("state.attempts", { count: Attempts - 1 }),
			Title: t("state.attempts.title", { count: Attempts }),
		});
	if (Step.cacheHit !== null && Step.cacheHit < CacheMissThreshold)
		List.push({
			Class: "playform-cost-state-attempts",
			Text: t("state.cacheMiss"),
			Title: t("state.cacheMiss.title"),
		});
	return List;
};

export default function StepRow(Props: StepRowProps): ReturnType<typeof createElement> {
	const Step = Props.Step;
	const t = Props.t;
	const Tag = Text(Step.currency) !== "" ? Text(Step.currency) : "USD";
	const Metric = "playform-cost-step-metric";
	const Raw: readonly unknown[] = Array.isArray(Step.files) ? Step.files : [];
	const Files = Raw.filter((File): File is CostFile => File !== null && typeof File === "object");
	const Allocations = typeof Step.allocations === "number" ? Step.allocations : 0;
	const Saving = typeof Step.saving === "number" ? Step.saving : 0;
	const Cost: CostBuckets = Step.cost ?? {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		reasoning: 0,
		total: 0,
		other: 0,
	};
	const Tokens: CostTokens = Step.tokens ?? {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		reasoning: 0,
		total: 0,
		reported: null,
	};
	const TokensTotal = typeof Tokens.total === "number" ? Tokens.total : 0;
	const Total = typeof Cost.total === "number" ? Cost.total : 0;
	const CacheRead = typeof Cost.cacheRead === "number" ? Cost.cacheRead : 0;
	const Input = typeof Cost.input === "number" ? Cost.input : 0;
	const Output = typeof Cost.output === "number" ? Cost.output : 0;
	const Other = typeof Cost.other === "number" ? Cost.other : 0;
	// Usage is evidence too: a call the ledger recorded without a price row
	// still has context and output tokens worth inspecting, and an error is
	// worth inspecting even when nothing else reached the envelope.
	const UsageContext =
		(typeof Tokens.input === "number" ? Tokens.input : 0) +
		(typeof Tokens.cacheRead === "number" ? Tokens.cacheRead : 0) +
		(typeof Tokens.cacheWrite === "number" ? Tokens.cacheWrite : 0);
	const UsageOutput = typeof Tokens.output === "number" ? Tokens.output : 0;
	const Failed = typeof Step.error === "string";
	const HasDetail =
		Files.length > 0 ||
		Allocations > 0 ||
		Total > 0 ||
		UsageContext > 0 ||
		UsageOutput > 0 ||
		Failed;
	const Started = t("step.started.title", { time: Stamp(Step.at) });
	const ModelText = [
		Text(Step.provider),
		Text(Step.model),
		Text(Step.mode),
		Text(Step.region),
		typeof Step.tier === "number" ? String(Step.tier) : "",
	]
		.filter((Part) => Part !== "")
		.join(" | ");
	const Classes = ["playform-cost-step-row"];
	if (HasDetail) Classes.push("playform-cost-step-row-clickable");
	if (Failed) Classes.push("playform-cost-step-row-error");
	const Row: TurnsCells = {
		Key: `step:${Step.turn}:${Step.step}`,
		scope: {
			Cell: "playform-cost-step-cell",
			...(HasDetail
				? {
						Toggle: {
							Expanded: Props.Expanded,
							Label: t("step.label", { step: Step.step }),
							Aria: t("step.toggle.aria", { step: Step.step }),
							Title: t("detail.title"),
							OnToggle: Props.OnToggle,
						},
					}
				: { Label: t("step.label", { step: Step.step }) }),
			// The hint promises a disclosure the row does not offer, so it is
			// rendered only when the row can actually expand.
			...(HasDetail
				? { Hint: ` - ${Props.Expanded ? t("detail.hide") : t("detail.show")}` }
				: {}),
			Markers: Markers(Step, t),
		},
		model: {
			Cell: "playform-cost-prompt-cell",
			Provider: Text(Step.provider),
			Model: Text(Step.model),
			Mode: Text(Step.mode),
			Region: Text(Step.region),
			Tier: typeof Step.tier === "number" ? Step.tier : null,
			When: { Text: Stamp(Step.at) },
			Title: `${Started} | ${ModelText}`,
		},
		files: {
			Cell: "playform-cost-step-files",
			Pills: Files.map((File) => ({
				Name: BaseName(Text(File.path)),
				Path: Text(File.path),
				Tone: StageTone(Text(File.stage) === "" ? null : Text(File.stage)),
				Count: 1,
				Lines: typeof File.linesDelta === "number" ? File.linesDelta : null,
			})),
			Fail: Failed,
			Saving,
			Calls: 1,
			Tokens: TokensTotal,
			Currency: Tag,
			ShowMix: Files.length >= 2,
		},
		tokens: { Cell: Metric, Value: TokensTotal },
		cache: { Cell: Metric, Tokens, Hit: Step.cacheHit },
		cacheRead: { Cell: Metric, Value: CacheRead, Currency: Tag },
		input: { Cell: Metric, Value: Input, Currency: Tag },
		output: { Cell: Metric, Value: Output, Currency: Tag },
		other: { Cell: Metric, Value: Other, Currency: Tag, Cost },
		allocation: {
			Cell: Metric,
			Direct: typeof Step.direct === "number" ? Step.direct : 0,
			Amortized: typeof Step.amortized === "number" ? Step.amortized : 0,
			Has: Allocations > 0,
			Currency: Tag,
		},
		total: {
			Cell: Metric,
			Track: "playform-cost-bar-step",
			Total,
			Cost,
			Scale: Props.Scale,
			Currency: Tag,
			Start: typeof Step.at === "number" ? Step.at : null,
		},
	};
	return createElement(
		"tr",
		{
			className: Classes.join(" "),
			"data-step": String(Step.step),
			...(HasDetail ? { onClick: Props.OnToggle, title: t("detail.title") } : {}),
		},
		...Props.Resolved.columns.map((Column) => Column.render(Row, { t })),
	);
}
