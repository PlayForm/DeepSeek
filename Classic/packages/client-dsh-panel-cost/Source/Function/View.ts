// View - the panel component: the section shell, the scroll region with the
// sticky-header table, the five states of the design's section 8, the
// load-older strip with the reading-position restore, and the summary
// strip. It fetches the route on mount and on every session or row-budget
// change, folds the envelope, and never throws: a failed fetch, a malformed
// body, or a missing session id renders a state line.
import DetailRow from "@Function/DetailRow";
import Fetch from "@Function/Fetch";
import Fold from "@Function/Fold";
import StepRow from "@Function/StepRow";
import SummaryStrip from "@Function/SummaryStrip";
import Table from "@Function/Table";
import TotalsRow from "@Function/TotalsRow";
import TurnRow from "@Function/TurnRow";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import type CostResponse from "@Interface/Response";
import type CostSnapshot from "@Interface/Snapshot";
import type CostTurn from "@Interface/Turn";
import type { Translate } from "@Interface/Translate";
import type ViewProps from "@Interface/View";
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

const DefaultRows = 200;
const MaxRows = 2000;
const LoadOlderFactor = 2;
const StepLimit = 24;

type Phase = "loading" | "ready" | "empty" | "unavailable" | "error";

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

export default function View(Props: ViewProps): ReturnType<typeof createElement> {
	const t: Translate = Props.t ?? Local;
	const SessionId = typeof Props.sessionId === "string" ? Props.sessionId : "";
	const [Phase, SetPhase] = useState<Phase>("loading");
	const [Snapshot, SetSnapshot] = useState<CostSnapshot | null>(null);
	const [Rows, SetRows] = useState(() => {
		if (typeof Props.rows !== "number" || !Number.isFinite(Props.rows) || Props.rows < 1)
			return DefaultRows;
		return Math.min(MaxRows, Math.floor(Props.rows));
	});
	const [Attempt, SetAttempt] = useState(0);
	const [Truncated, SetTruncated] = useState(false);
	const [Older, SetOlder] = useState<"idle" | "loading" | "failed">("idle");
	const [TurnMode, SetTurnMode] = useState<"newest" | "all" | "none">("newest");
	const [TurnOverride, SetTurnOverride] = useState<Record<number, boolean | undefined>>({});
	const [StepOpen, SetStepOpen] = useState<ReadonlySet<string>>(new Set<string>());
	const [ShowAll, SetShowAll] = useState<ReadonlySet<number>>(new Set<number>());
	const [SeenTick, SetSeenTick] = useState(0);
	const ScrollRef = useRef<HTMLDivElement | null>(null);
	const Visible = useRef<ReadonlySet<number>>(new Set<number>());
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
				const Previous = Counted.current;
				Counted.current = Calls.length;
				SetSnapshot(Fold(Response));
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
					case Previous !== null && Calls.length === Previous && Response.truncated === true:
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

	useEffect(() => {
		const Scroll = ScrollRef.current;
		if (Scroll === null || typeof IntersectionObserver === "undefined") return;
		const Seen = new Set<number>();
		const Observer = new IntersectionObserver((Entries) => {
			for (const Entry of Entries) {
				const Mark = Entry.target instanceof HTMLElement ? Entry.target.dataset.turn : undefined;
				const Turn = typeof Mark === "string" ? Number(Mark) : Number.NaN;
				switch (true) {
					case Entry.isIntersecting && Number.isFinite(Turn):
						Seen.add(Turn);
						break;
					case !Entry.isIntersecting:
						Seen.delete(Turn);
						break;
					default:
						break;
				}
			}
			Visible.current = Seen;
			SetSeenTick((Tick) => Tick + 1);
		});
		Scroll.querySelectorAll("tr[data-turn]").forEach((Row) => Observer.observe(Row));
		return () => {
			Observer.disconnect();
		};
	}, [Snapshot, Phase]);

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
		if (Scroll !== null) Pending.current = { Height: Scroll.scrollHeight, Top: Scroll.scrollTop };
		Growing.current = true;
		SetOlder("loading");
		SetRows((Current) => Math.min(MaxRows, Current * LoadOlderFactor));
	}, []);

	const Retry = useCallback(() => {
		SetPhase("loading");
		SetAttempt((Current) => Current + 1);
	}, []);

	const TurnScale = useMemo(() => {
		if (Snapshot === null) return 0;
		const Seen = Visible.current;
		const Source = Seen.size > 0 ? Snapshot.turns.filter((Turn) => Seen.has(Turn.turn)) : Snapshot.turns;
		let Top = 0;
		for (const Turn of Source) {
			const Money = Turn.cost?.total;
			if (typeof Money === "number" && Money > Top) Top = Money;
		}
		return Top;
	}, [Snapshot, SeenTick]);

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
					t,
				}),
			);
			if (!Open) continue;
			const Total = Turn.steps.length;
			const All = ShowAll.has(Turn.turn) || Total <= StepLimit;
			if (Total > StepLimit)
				Body.push(
					createElement(
						"tr",
						{ key: `more:${Turn.turn}` },
						createElement(
							"td",
							{ className: "playform-cost-more-cell", colSpan: 11 },
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
								All ? t("steps.all", { total: Total }) : t("steps.tail", { limit: StepLimit }),
							),
						),
					),
				);
			const Shown = All ? Turn.steps : Turn.steps.slice(Math.max(0, Total - StepLimit));
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
						t,
					}),
				);
				if (Expanded)
					Body.push(createElement(DetailRow, { key: `detail:${Key}`, Step, t }));
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
					"button",
					{ type: "button", className: "playform-cost-button", onClick: LoadOlder },
					t("loadOlder.failed"),
				);
			case Truncated:
				return createElement(
					"button",
					{ type: "button", className: "playform-cost-button", onClick: LoadOlder },
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
			return Shell([Line(t("unavailable"), false)], null);
		case Phase === "error":
			return Shell(
				[
					Line(
						t("error"),
						false,
						createElement(
							"button",
							{ type: "button", className: "playform-cost-button", onClick: Retry },
							t("retry"),
						),
					),
				],
				null,
			);
		default:
			break;
	}
	if (Phase === "loading" || Snapshot === null)
		return Shell([Line(t("loading"), true)], null);
	if (Snapshot.turns.length === 0)
		return Shell(
			[Line(t("empty"), false)],
			createElement(SummaryStrip, {
				Summary: Snapshot.summary,
				Turns: 0,
				Steps: Snapshot.steps,
				AllOpen: false,
				AnyTurn: false,
				OnToggleAll: ToggleAllTurns,
				t,
			}),
		);
	return Shell(
		[
			Strip === null
				? null
				: createElement("div", { className: "playform-cost-older", key: "older" }, Strip),
			createElement(Table, {
				key: "table",
				Body,
				Totals: createElement(TotalsRow, { Summary: Snapshot.summary, t }),
				t,
			}),
		],
		createElement(SummaryStrip, {
			Summary: Snapshot.summary,
			Turns: Snapshot.turns.length,
			Steps: Snapshot.steps,
			AllOpen,
			AnyTurn: Snapshot.turns.length > 0,
			OnToggleAll: ToggleAllTurns,
			t,
		}),
	);
}
