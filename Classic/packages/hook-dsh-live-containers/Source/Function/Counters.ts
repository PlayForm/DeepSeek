// Counters - the per-scope state and the variable table (research section 3:
// "the variables v1 ships" - {{time}} {{date}} {{tz}} {{messageCount}}
// {{turnCount}} {{sinceLastTool}} {{sessionId}} {{cwd}}). The per-scope state
// lives in a WeakMap keyed on the scope/agent object (the tool-coach
// precedent; the assemble context exposes only an opaque scope key - docs/
// cordis-api, dsh-scope ScopeKey - so a dispatch without a key shares the
// module's default key). All counters count what the plugin itself observes
// at agent/pre-step and tools/post-execute; exact token counts are NOT
// available to plugins (research residual 3) - the gauge variables are
// honest approximations.
//
// All time reads go through the Clock module (the smoke's fake clock). No
// I/O, no eval - pure functions over the state.
import type { AgentState, Variables } from "@Interface/Execution.js";
import type State from "@Interface/State.js";

/** The module's default scope key (a dispatch without a scope shares it). */
export const DefaultKey: object = {};

/** A fresh per-scope state (Apply's Agent() seeds WeakMap entries from it). */
export default (): AgentState => ({
	messages: 0,
	turns: 0,
	attempts: {},
	lastToolAt: undefined,
	calls: 0,
	blocks: new Map(),
	skips: new Map(),
	sectionCache: undefined,
});

/** The stable per-scope label (the {{sessionId}} source: the harness exposes
 * no session id to an assemble listener - the opaque scope key must never be
 * parsed (the family's capability rule) - so the plugin assigns its own
 * stable label from State.Labels, first come first served per WeakMap key). */
export const ScopeLabel = (Agent: State, Key: unknown): string => {
	try {
		const Object_ = (Key as object) ?? DefaultKey;
		const Known = Agent.Labels.get(Object_);
		switch (true) {
			case Known !== undefined:
				return Known;
			default: {
				const Label = `scope-${Agent.LabelCount + 1}`;
				Agent.LabelCount += 1;
				Agent.Labels.set(Object_, Label);
				return Label;
			}
		}
	} catch {
		return "scope-0";
	}
};

/** Count the user messages of one pre-step payload and advance the turn
 * (the per-turn counter reset: the tool-coach precedent, Apply.ts:456-490). */
export const RecordTurn = (Agent: AgentState, Messages: number): void => {
	Agent.messages += Messages;
	Agent.turns += 1;
	Agent.attempts = {};
};

/** Record one finished tool call (the L4 observer). */
export const RecordTool = (Agent: AgentState, Name: string, At: number): void => {
	Agent.lastToolAt = At;
	Agent.attempts[Name] = (Agent.attempts[Name] ?? 0) + 1;
};

/** Elapsed seconds since the last tool call, as the gauge formats them. */
export const SinceLastTool = (Agent: AgentState, At: number): string => {
	switch (true) {
		case Agent.lastToolAt === undefined:
			return "none";
		default: {
			const Seconds = Math.max(0, Math.round((At - Agent.lastToolAt) / 1000));
			return `${Seconds}s`;
		}
	}
};

/** The IANA zone of the host ({{tz}}); failure degrades to UTC. */
export const Zone = (): string => {
	try {
		return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
};

/** The variable table one render pass resolves (the union of all built-in
 * tokens; Render.ts narrows per kind). {{time}} is the local wall clock
 * (HH:MM:SS), {{date}} the local ISO date (YYYY-MM-DD), both computed from
 * the clock value with the host's zone - deterministic under the fake
 * clock. */
export const Table = (Scope: AgentState, At: number, Label: string): Variables => {
	const Zone_ = Zone();
	const Date_ = new Date(At);
	const DatePart = (() => {
		try {
			return new Intl.DateTimeFormat("en-CA", {
				timeZone: Zone_,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}).format(Date_);
		} catch {
			return Date_.toISOString().slice(0, 10);
		}
	})();
	const TimePart = (() => {
		try {
			return new Intl.DateTimeFormat("en-GB", {
				timeZone: Zone_,
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}).format(Date_);
		} catch {
			return Date_.toISOString().slice(11, 19);
		}
	})();
	return {
		time: TimePart,
		date: DatePart,
		tz: Zone_,
		messageCount: String(Scope.messages),
		turnCount: String(Scope.turns),
		sinceLastTool: SinceLastTool(Scope, At),
		sessionId: Label,
		cwd: (() => {
			try {
				return process.cwd();
			} catch {
				return "";
			}
		})(),
	};
};
