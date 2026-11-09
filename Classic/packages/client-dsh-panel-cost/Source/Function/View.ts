// View - the panel component: the section shell, the scroll region with the
// sticky-header table, the five states of the design's section 8, the
// load-older strip with the reading-position restore, and the summary
// strip. It fetches the route on mount and on every session or row-budget
// change, folds the envelope, and never throws: a failed fetch, a malformed
// body, or a missing session id renders a state line.
import { Button } from "@deepseek-ai/dsh-client-ui-primitives";
import Turns, { type TurnsCells } from "@Function/Columns";
import DetailRow from "@Function/DetailRow";
import Fetch from "@Function/Fetch";
import FileFilters, { type Filter } from "@Function/FileFilters";
import FileTable from "@Function/FileTable";
import Fold from "@Function/Fold";
import Resolve from "@Function/Resolve";
import StepRow from "@Function/StepRow";
import SummaryStrip from "@Function/SummaryStrip";
import Table from "@Function/Table";
import TotalsRow from "@Function/TotalsRow";
import TurnRow from "@Function/TurnRow";
import type CostFileRow from "@Interface/FileRow";
import type CostResponse from "@Interface/Response";
import type CostSnapshot from "@Interface/Snapshot";
import type { Translate } from "@Interface/Translate";
import type CostTurn from "@Interface/Turn";
import type ViewProps from "@Interface/View";
import Limits from "@Variable/Limits";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

const DefaultRows = 200;
const MaxRows = 2000;

type Phase = "loading" | "ready" | "empty" | "unavailable" | "error";

// BudgetOf - the starting row budget: the configured prop, clamped, and the
// module default when the prop is missing or unusable. A session change
// returns the budget to this value so one session's grown window does not
// carry into the next.
const BudgetOf = (Rows: number | undefined): number => {
	if (typeof Rows !== "number" || !Number.isFinite(Rows) || Rows < 1) return DefaultRows;
	return Math.min(MaxRows, Math.floor(Rows));
};

const Fill = (
	Template: string,
	Params: Readonly<Record<string, string | number>> | undefined,
): string => {
	if (Params === undefined) return Template;
	let Out = Template;
	for (const [Name, Value] of Object.entries(Params))
		Out = Out.replaceAll(`{${Name}}`, () => String(Value));
	return Out;
};

const Local = (Key: string, Params?: Readonly<Record<string, string | number>>): string =>
	Fill((EN_DICTIONARY as unknown as Record<string, string>)[Key] ?? Key, Params);

const StepScaleOf = (Turn: CostTurn): number => {
	let Top = 0;
	for (const Step of Turn.steps) {
		const Money = Step.cost?.total;
		if (typeof Money === "number" && Money > Top) Top = Money;
	}
	return Top;
};

// Value - the text a change event carries. The DOM overload of createElement
// cannot infer the element type from a string tag, so the event arrives as
// unknown and the field is read defensively.
const Value = (Event: unknown): string => {
	const Target = (Event as { target?: unknown } | null)?.target;
	const Text = (Target as { value?: unknown } | null)?.value;
	return typeof Text === "string" ? Text : "";
};

// StageName - the shipped stage word; a stage the dictionary does not carry
// is shown as the ledger spelled it rather than as a missing key.
const StageName = (Stage: string, t: Translate): string => {
	const Known = (EN_DICTIONARY as unknown as Record<string, string>)[`stage.${Stage}`];
	return Known === undefined ? Stage : t(`stage.${Stage}`);
};

// Chip - one chip of the view switcher and of the filter bar: the two chip
// classes the sheet ships, the pressed state, and the handler.
const Chip = (
	Label: string,
	Active: boolean,
	OnClick: () => void,
	Key: string,
): ReturnType<typeof createElement> =>
	createElement(
		"button",
		{
			key: Key,
			type: "button",
			className: Active ? "playform-cost-chip playform-cost-chip-on" : "playform-cost-chip",
			"aria-pressed": Active,
			onClick: OnClick,
		},
		Label,
	);

export default function View(Props: ViewProps): ReturnType<typeof createElement> {
	const t: Translate = Props.t ?? Local;
	const SessionId = typeof Props.sessionId === "string" ? Props.sessionId : "";
	const [Phase, SetPhase] = useState<Phase>("loading");
	const [Note, SetNote] = useState<string | null>(null);
	const [Snapshot, SetSnapshot] = useState<CostSnapshot | null>(null);
	const [Rows, SetRows] = useState(() => BudgetOf(Props.rows));
	const [Attempt, SetAttempt] = useState(0);
	const [Truncated, SetTruncated] = useState(false);
	const [Older, SetOlder] = useState<"idle" | "loading" | "failed">("idle");
	const [Pane, SetPane] = useState<"turns" | "files">("turns");
	const [Files, SetFiles] = useState<readonly CostFileRow[]>([]);
	const [FileFilter, SetFileFilter] = useState<Filter>(FileFilters.Default);
	const [TurnMode, SetTurnMode] = useState<"newest" | "all" | "none">("newest");
	const [TurnOverride, SetTurnOverride] = useState<Record<number, boolean | undefined>>({});
	const [StepOpen, SetStepOpen] = useState<ReadonlySet<string>>(new Set<string>());
	const [ShowAll, SetShowAll] = useState<ReadonlySet<number>>(new Set<number>());
	const ScrollRef = useRef<HTMLDivElement | null>(null);
	const Pending = useRef<{ Height: number; Top: number } | null>(null);
	const Growing = useRef(false);
	const Counted = useRef<number | null>(null);
	const FetchedFor = useRef<string>("");

	useEffect(() => {
		let Live = true;
		if (SessionId === "") {
			SetSnapshot(null);
			SetPhase("unavailable");
			SetOlder("idle");
			SetTruncated(false);
			Growing.current = false;
			return () => {
				Live = false;
			};
		}
		SetPhase((Current) =>
			Snapshot === null || FetchedFor.current !== SessionId ? "loading" : Current,
		);
		FetchedFor.current = SessionId;
		new Promise<CostResponse>((Done) => {
			Done(Fetch(SessionId, Rows));
		})
			.then((Response) => {
				if (!Live) return;
				const Grow = Growing.current;
				Growing.current = false;
				const Envelope: unknown = Response;
				if (
					Envelope === null ||
					typeof Envelope !== "object" ||
					(Envelope as { ok?: unknown }).ok !== true
				) {
					if (Grow) {
						SetOlder("failed");
						return;
					}
					SetSnapshot(Fold(Response));
					SetFiles([]);
					// The envelope's own line names the cause (no session id,
					// the cost plugin absent, the ledger unreadable); the state
					// line above it stays the short, translated one.
					SetNote(
						typeof (Envelope as { message?: unknown }).message === "string"
							? (Envelope as { message: string }).message
							: null,
					);
					SetPhase(
						typeof Envelope === "object" &&
							Envelope !== null &&
							(Envelope as { code?: unknown }).code === "unavailable"
							? "unavailable"
							: "error",
					);
					return;
				}
				const Source: unknown = Response.calls;
				const Calls: readonly unknown[] = Array.isArray(Source) ? Source : [];
				SetNote(null);
				const Previous = Counted.current;
				Counted.current = Calls.length;
				SetSnapshot(Fold(Response));
				SetFiles(Array.isArray(Response.files) ? Response.files : []);
				SetTruncated(Response.truncated === true);
				if (Calls.length === 0) {
					SetPhase("empty");
					SetOlder("idle");
					return;
				}
				SetPhase("ready");
				if (!Grow) {
					SetOlder("idle");
					return;
				}
				switch (true) {
					case Previous !== null &&
						Calls.length === Previous &&
						Response.truncated === true:
						SetOlder("failed");
						break;
					default:
						SetOlder("idle");
						break;
				}
			})
			.catch(() => {
				if (!Live) return;
				if (Growing.current) {
					Growing.current = false;
					SetOlder("failed");
					return;
				}
				SetPhase("error");
			});
		return () => {
			Live = false;
		};
		// The fetch reads the session id, the row budget and the retry token;
		// the snapshot is read only to keep the table up across a grow refetch.
	}, [SessionId, Rows, Attempt]);

	// A session switch replaces every row the panel holds, so the expanded
	// turns and steps, the show-all choices, the grown row budget, the
	// truncation flag and the load-older bookkeeping of the old session are
	// cleared before the new session's fetch resolves.
	const SessionRef = useRef(SessionId);
	useEffect(() => {
		if (SessionRef.current === SessionId) return;
		SessionRef.current = SessionId;
		SetTurnOverride({});
		SetStepOpen(new Set<string>());
		SetShowAll(new Set<number>());
		SetRows(BudgetOf(Props.rows));
		SetTruncated(false);
		SetOlder("idle");
		Counted.current = null;
		Growing.current = false;
		Pending.current = null;
	}, [SessionId, Props.rows]);

	useEffect(() => {
		const Scroll = ScrollRef.current;
		const Restore = Pending.current;
		if (Scroll === null || Restore === null) return;
		Pending.current = null;
		Scroll.scrollTop = Restore.Top + Math.max(0, Scroll.scrollHeight - Restore.Height);
	}, [Snapshot, Phase]);

	const Last = Snapshot === null ? undefined : Snapshot.turns[Snapshot.turns.length - 1];
	const Latest = Last === undefined ? -1 : Last.turn;

	const TurnOpen = useCallback(
		(Turn: number) => {
			const Override = TurnOverride[Turn];
			switch (true) {
				case Override !== undefined:
					return Override;
				case TurnMode === "all":
					return true;
				case TurnMode === "none":
					return false;
				default:
					return Turn === Latest;
			}
		},
		[TurnOverride, TurnMode, Latest],
	);

	const AllOpen =
		Snapshot !== null &&
		Snapshot.turns.length > 0 &&
		Snapshot.turns.every((Turn) => TurnOpen(Turn.turn));

	const ToggleTurn = useCallback(
		(Turn: number) => {
			SetTurnOverride((Current) => ({ ...Current, [Turn]: !TurnOpen(Turn) }));
		},
		[TurnOpen],
	);

	const ToggleStep = useCallback((Key: string) => {
		SetStepOpen((Current) => {
			const Next = new Set(Current);
			if (Next.has(Key)) Next.delete(Key);
			else Next.add(Key);
			return Next;
		});
	}, []);

	const ToggleAllSteps = useCallback((Turn: number) => {
		SetShowAll((Current) => {
			const Next = new Set(Current);
			if (Next.has(Turn)) Next.delete(Turn);
			else Next.add(Turn);
			return Next;
		});
	}, []);

	const ToggleAllTurns = useCallback(() => {
		if (AllOpen) SetTurnMode("none");
		else SetTurnMode("all");
		SetTurnOverride({});
	}, [AllOpen]);

	const LoadOlder = useCallback(() => {
		const Scroll = ScrollRef.current;
		if (Scroll !== null)
			Pending.current = { Height: Scroll.scrollHeight, Top: Scroll.scrollTop };
		Growing.current = true;
		SetOlder("loading");
		SetRows((Current) => Math.min(MaxRows, Current * Limits.LoadOlderFactor));
	}, []);

	const Retry = useCallback(() => {
		SetPhase("loading");
		SetAttempt((Current) => Current + 1);
	}, []);

	// A top file opens the Files view already filtered to that file: the
	// other filters are cleared so the chosen file cannot be hidden by a
	// kind or stage choice made earlier.
	const OpenFile = useCallback((Path: string) => {
		SetPane("files");
		SetFileFilter({ ...FileFilters.Default, Path });
	}, []);

	// The turn bar scales against the largest turn total of the loaded
	// snapshot, so a turn keeps the same bar length while the user scrolls;
	// a visible-window scale would make the same turn change length.
	const TurnScale = useMemo(() => {
		if (Snapshot === null) return 0;
		let Top = 0;
		for (const Turn of Snapshot.turns) {
			const Money = Turn.cost?.total;
			if (typeof Money === "number" && Money > Top) Top = Money;
		}
		return Top;
	}, [Snapshot]);

	// The one resolved Turns layout: the shipped definition with the default
	// preference set, which hides nothing and keeps the shipped order. The
	// header, the widths, every body cell, the totals row and the detail span
	// read this one list, so none of them can drift from the others.
	const Resolved = useMemo(() => Resolve<TurnsCells>(Turns, { hidden: [] }), []);

	const Body: Array<ReturnType<typeof createElement>> = [];
	if (Snapshot !== null && Phase === "ready") {
		for (const Turn of Snapshot.turns) {
			const Open = TurnOpen(Turn.turn);
			Body.push(
				createElement(TurnRow, {
					key: `turn:${Turn.turn}`,
					Turn,
					Open,
					Scale: TurnScale,
					OnToggle: () => ToggleTurn(Turn.turn),
					Resolved,
					t,
				}),
			);
			if (!Open) continue;
			const Total = Turn.steps.length;
			const All = ShowAll.has(Turn.turn) || Total <= Limits.StepLimit;
			if (Total > Limits.StepLimit)
				Body.push(
					createElement(
						"tr",
						{ key: `more:${Turn.turn}` },
						createElement(
							"td",
							{
								className: "playform-cost-more-cell",
								colSpan: Resolved.columns.length,
							},
							createElement(
								"span",
								{ className: "playform-cost-more-text" },
								t("steps.total", { total: Total }),
							),
							createElement(
								"button",
								{
									type: "button",
									className: All
										? "playform-cost-chip playform-cost-chip-on"
										: "playform-cost-chip",
									onClick: () => ToggleAllSteps(Turn.turn),
								},
								All
									? t("steps.all", { total: Total })
									: t("steps.tail", { limit: Limits.StepLimit }),
							),
						),
					),
				);
			const Shown = All
				? Turn.steps
				: Turn.steps.slice(Math.max(0, Total - Limits.StepLimit));
			for (const Step of Shown) {
				const Key = `${Turn.turn}:${Step.step}`;
				const Expanded = StepOpen.has(Key);
				Body.push(
					createElement(StepRow, {
						key: `step:${Key}`,
						Step,
						Expanded,
						Scale: StepScaleOf(Turn),
						OnToggle: () => ToggleStep(Key),
						Resolved,
						t,
					}),
				);
				if (Expanded)
					Body.push(
						createElement(DetailRow, { key: `detail:${Key}`, Step, Resolved, t }),
					);
			}
		}
	}

	const Strip: ReturnType<typeof createElement> | null = (() => {
		if (Snapshot === null || Phase !== "ready") return null;
		switch (true) {
			case Older === "loading":
				return createElement(
					"span",
					{ className: "playform-cost-older-status", role: "status" },
					t("loadOlder.loading"),
				);
			case Truncated && Rows >= MaxRows:
				return createElement(
					"span",
					{ className: "playform-cost-older-status" },
					t("loadOlder.capped", { rows: MaxRows }),
				);
			case Older === "failed":
				return createElement(
					Button,
					{
						variant: "outline",
						size: "sm",
						type: "button",
						className: "playform-cost-button",
						onClick: LoadOlder,
					},
					t("loadOlder.failed"),
				);
			case Truncated:
				return createElement(
					Button,
					{
						variant: "outline",
						size: "sm",
						type: "button",
						className: "playform-cost-button",
						onClick: LoadOlder,
					},
					t("loadOlder"),
				);
			default:
				return createElement(
					"span",
					{ className: "playform-cost-older-status" },
					t("loadOlder.done"),
				);
		}
	})();

	const Line = (
		Text: string,
		Status: boolean,
		Action?: ReturnType<typeof createElement>,
	): ReturnType<typeof createElement> =>
		createElement(
			"div",
			{ className: "playform-cost-empty", ...(Status ? { role: "status" } : {}) },
			Text,
			Action === undefined ? null : Action,
		);

	const Shell = (
		Inner: ReadonlyArray<ReturnType<typeof createElement> | string | null>,
		Footer: ReturnType<typeof createElement> | null,
	): ReturnType<typeof createElement> =>
		createElement(
			"section",
			{ className: "playform-cost-root" },
			createElement(
				"div",
				{
					className: "playform-cost-scroll",
					role: "region",
					"aria-label": t("view"),
					tabIndex: 0,
					ref: ScrollRef,
				},
				Inner,
			),
			Footer,
		);

	switch (true) {
		case Phase === "unavailable":
			return Shell(
				[
					Line(t("unavailable"), false),
					Note === null
						? null
						: createElement("p", { className: "playform-cost-block-meta" }, Note),
				],
				null,
			);
		case Phase === "error":
			return Shell(
				[
					Line(
						t("error"),
						false,
						createElement(
							Button,
							{
								variant: "outline",
								size: "sm",
								type: "button",
								className: "playform-cost-button",
								onClick: Retry,
							},
							t("retry"),
						),
					),
				],
				null,
			);
		default:
			break;
	}
	if (Phase === "loading" || Snapshot === null) return Shell([Line(t("loading"), true)], null);
	const Currency =
		typeof Snapshot.summary.currency === "string" && Snapshot.summary.currency !== ""
			? Snapshot.summary.currency
			: "USD";
	// The footer is the same two bands in every state: the view switcher in
	// its own toolbar, then the session summary and the top files.
	const Footer = createElement(
		Fragment,
		{},
		createElement(
			"div",
			{ className: "playform-cost-toolbar" },
			createElement(
				"div",
				{
					className: "playform-cost-controls",
					role: "group",
					"aria-label": t("view.switcher"),
				},
				Chip(t("view.turns"), Pane === "turns", () => SetPane("turns"), "turns"),
				Chip(t("view.files"), Pane === "files", () => SetPane("files"), "files"),
			),
		),
		createElement(SummaryStrip, {
			Summary: Snapshot.summary,
			Turns: Snapshot.turns.length,
			Steps: Snapshot.steps,
			AllOpen,
			AnyTurn: Snapshot.turns.length > 0,
			OnToggleAll: ToggleAllTurns,
			OnOpenFile: OpenFile,
			t,
		}),
	);
	if (Pane === "files") {
		const Shown = FileFilters.Apply(Files, FileFilter);
		const Stages = FileFilters.StagesOf(Files);
		const Controls = createElement(
			"div",
			{
				className: "playform-cost-controls",
				role: "group",
				"aria-label": t("view.files"),
			},
			createElement("input", {
				type: "text",
				className: "playform-cost-button",
				// The chip face carries cursor: pointer; a text field must not.
				style: { cursor: "text" },
				value: FileFilter.Path,
				placeholder: t("files.filter.path"),
				"aria-label": t("files.filter.path"),
				onChange: (Event: unknown) => SetFileFilter({ ...FileFilter, Path: Value(Event) }),
			}),
			createElement(
				"span",
				{ className: "playform-cost-control-label" },
				t("files.filter.kind"),
			),
			FileFilters.Kinds.map((Kind) =>
				Chip(
					t(`files.kind.${Kind}`),
					FileFilter.Kind === Kind,
					() => SetFileFilter({ ...FileFilter, Kind }),
					Kind,
				),
			),
			createElement(
				"span",
				{ className: "playform-cost-control-label" },
				t("files.filter.stage"),
			),
			Chip(
				t("files.filter.stageAll"),
				FileFilter.Stage === null,
				() => SetFileFilter({ ...FileFilter, Stage: null }),
				"stage:all",
			),
			Stages.map((Stage) =>
				Chip(
					StageName(Stage, t),
					FileFilter.Stage === Stage,
					() =>
						SetFileFilter({
							...FileFilter,
							Stage: FileFilter.Stage === Stage ? null : Stage,
						}),
					`stage:${Stage}`,
				),
			),
			createElement(
				"span",
				{ className: "playform-cost-control-label" },
				t("files.filter.sort"),
			),
			FileFilters.Sorts.map((Sort) =>
				Chip(
					t(`files.sort.${Sort}`),
					FileFilter.Sort === Sort,
					() => SetFileFilter({ ...FileFilter, Sort }),
					Sort,
				),
			),
		);
		switch (true) {
			case Files.length === 0:
				return Shell([Line(t("files.empty"), false)], Footer);
			case Shown.length === 0:
				return Shell([Controls, Line(t("files.filter.empty"), false)], Footer);
			default:
				return Shell(
					[
						Controls,
						createElement(FileTable, {
							key: "files",
							Files: Shown,
							Currency,
							t,
						}),
					],
					Footer,
				);
		}
	}
	if (Snapshot.turns.length === 0) return Shell([Line(t("empty"), false)], Footer);
	return Shell(
		[
			Strip === null
				? null
				: createElement("div", { className: "playform-cost-older", key: "older" }, Strip),
			createElement(Table, {
				key: "table",
				Body,
				Totals: createElement(TotalsRow, { Summary: Snapshot.summary, Resolved, t }),
				Resolved,
				t,
			}),
		],
		Footer,
	);
}
