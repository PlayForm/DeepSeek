// Price - the rate resolution and the cost arithmetic
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 2): a call is priced at
// the ledger price row with the greatest EffectiveFrom that is not after the
// call's time - never the newest row - falling back to the configured price
// book, which is seeded into the ledger's Price table on first use (Source
// "config", append-only). The arithmetic is tokens / 1e6 * rate, exactly the
// units the providers publish, and an absent bucket (null tokens or a null
// rate) costs zero. The input side is the UNCACHED remainder plus the cache
// buckets, never the whole input.
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";
import type Price from "../Interface/Price.js";
import type Usage from "../Interface/Usage.js";

export default (
	Database: DatabaseSync,
	Config: Config,
): {
	Resolve(Provider: string, Model: string, At: number): Price;
	Cost(
		Record: Usage,
		Rate: Price,
	): {
		Input: number;
		Output: number;
		CacheRead: number;
		CacheWrite: number;
		Reasoning: number;
		Total: number;
		Currency: string;
	};
} => {
	const Select = Database.prepare(
		"SELECT Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom " +
			"FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom <= ? " +
			"ORDER BY EffectiveFrom DESC LIMIT 1",
	);
	const Insert = Database.prepare(
		"INSERT OR IGNORE INTO Price (Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, Source) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'config')",
	);

	// The configured book's rows for this provider and model, seeded into the
	// effective-dated table on first use; a date that already parses as-is is
	// used directly, a bare date is read as the start of its UTC day.
	const Seed = (Provider: string, Model: string): void => {
		for (const Row of Config.prices) {
			if (Row.provider !== Provider || Row.model !== Model) {
				continue;
			}
			const Direct = Date.parse(Row.effectiveFrom);
			const Day = Number.isFinite(Direct)
				? Direct
				: Date.parse(`${Row.effectiveFrom}T00:00:00Z`);
			Insert.run(
				Row.provider,
				Row.model,
				Row.currency.length > 0 ? Row.currency : Config.currency,
				Row.input,
				Row.output,
				Row.cacheRead ?? null,
				Row.cacheWrite ?? null,
				Row.reasoning ?? null,
				Number.isFinite(Day) ? Day : 0,
			);
		}
	};

	const Resolve = (Provider: string, Model: string, At: number): Price => {
		const When = Number.isFinite(At) ? At : Date.now();
		let Found = Select.get(Provider, Model, When) as
			| {
					Provider: string;
					Model: string;
					Currency: string;
					InputRate: number;
					OutputRate: number;
					CacheReadRate: number | null;
					CacheWriteRate: number | null;
					ReasoningRate: number | null;
					EffectiveFrom: number;
			  }
			| undefined;
		if (Found === undefined) {
			Seed(Provider, Model);
			Found = Select.get(Provider, Model, When) as typeof Found;
		}
		if (Found !== undefined) {
			return {
				Provider: Found.Provider,
				Model: Found.Model,
				Currency: Found.Currency,
				InputRate: Found.InputRate,
				OutputRate: Found.OutputRate,
				CacheReadRate: Found.CacheReadRate,
				CacheWriteRate: Found.CacheWriteRate,
				ReasoningRate: Found.ReasoningRate,
				EffectiveFrom: Found.EffectiveFrom,
			};
		}
		// An unpriced model costs zero: the ledger keeps the call (its usage,
		// its surface, its touches) and prices every bucket at zero.
		return {
			Provider,
			Model,
			Currency: Config.currency,
			InputRate: 0,
			OutputRate: 0,
			CacheReadRate: null,
			CacheWriteRate: null,
			ReasoningRate: null,
			EffectiveFrom: 0,
		};
	};

	const Cost = (
		Record: Usage,
		Rate: Price,
	): {
		Input: number;
		Output: number;
		CacheRead: number;
		CacheWrite: number;
		Reasoning: number;
		Total: number;
		Currency: string;
	} => {
		const Input = (Record.InputTokens / 1e6) * Rate.InputRate;
		const Output = (Record.OutputTokens / 1e6) * Rate.OutputRate;
		const CacheRead = ((Record.CacheReadTokens ?? 0) / 1e6) * (Rate.CacheReadRate ?? 0);
		const CacheWrite = ((Record.CacheWriteTokens ?? 0) / 1e6) * (Rate.CacheWriteRate ?? 0);
		const Reasoning = ((Record.ReasoningTokens ?? 0) / 1e6) * (Rate.ReasoningRate ?? 0);
		return {
			Input,
			Output,
			CacheRead,
			CacheWrite,
			Reasoning,
			Total: Input + Output + CacheRead + CacheWrite + Reasoning,
			Currency: Rate.Currency,
		};
	};

	return { Resolve, Cost };
};
