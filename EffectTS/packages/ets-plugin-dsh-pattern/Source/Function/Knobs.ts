import type Configuration from "@Interface/Config.js";

/**
 * @module Knobs
 *
 * The service's validated configuration: the constructor's defaults,
 * overridden by the loader's validated config.
 *
 * @remarks
 *
 * Function/Knobs. The class-form plugin receives the config as the SECOND
 * constructor argument - the graph service's precedent - and every volatile
 * cell is unwrapped, while the `domain` knob is fail-loud checked at load (a
 * bad domain name must throw at load, never at the detached storage open).
 *
 * THE TWO POSTURES: `enabled` is TRUE in these defaults and the SCHEMA
 * (Variable/Config) now defaults it to TRUE too - the shipped posture is ON.
 * They stay separate constants so a BARE construction (`new
 * PatternService(ctx)` - the smokes' fixture) and the LOADED plugin share the
 * same posture; a profile turns the service off with `enabled: false`, which
 * logs `disabled (enabled=false)` and leaves Match abstaining while the
 * service stays resolvable (the live disabled posture).
 */
/**
 * The storage-domain name rule (the library's UNIT_NAME_RE).
 */
const UNIT = /^[a-z][a-z0-9_]*$/;

/**
 * Unwrap one possibly-volatile config cell (`{ get }` reference or value).
 */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

export default (Raw: unknown): Configuration => {
	const Defaults: Configuration = {
		enabled: true,
		logFile: "~/.dsh/playform/ets-plugin-dsh-pattern.log",
		domain: "pattern",
		storagePath: "~/.dsh/pattern/registry.json",
		matchThreshold: 0.35,
		maxMatches: 3,
		ambiguityEpsilon: 0.02,
		decayHalfLifeDays: 14,
		acceptBonus: 0.1,
		rejectPenalty: 0.2,
		appliedBonus: 0.15,
		failedPenalty: 0.25,
		// THE POLICY BLOCK (D6): the bare-construction default, mirrored from
		// the factory's shared block (Variable/Policy there). A LOADED plugin
		// always receives the schema-validated block through `Raw`, so this
		// literal only serves `new PatternService(ctx)` (the smokes' fixture).
		policy: {
			read: "auto",
			index: "auto",
			record: "auto",
			suggest: "auto",
			write: "approve",
			commit: "approve",
			spawn: "approve",
			message: "auto",
		},
	};
	const Source = (Raw ?? {}) as Record<string, unknown>;
	const Merged: Record<string, unknown> = { ...Defaults };
	for (const Key of Object.keys(Defaults)) {
		switch (true) {
			case Source[Key] === undefined:
				continue;
			case Key === "policy":
				// A partial policy override MERGES over the D6 defaults (the
				// same rule the schema's nested object applies); the other knobs
				// replace wholesale.
				Merged[Key] = {
					...Defaults.policy,
					...(Cell(Source[Key]) as Record<string, unknown>),
				};
				break;
			default:
				Merged[Key] = Cell(Source[Key]);
		}
	}
	switch (true) {
		case typeof Merged["domain"] !== "string" || !UNIT.test(Merged["domain"] as string):
			throw new Error(
				"pattern: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/",
			);
		default:
			break;
	}
	return Merged as unknown as Configuration;
};
