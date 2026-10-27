// Recompute - the drop-and-rebuild (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 2.4): every number a formula consumes is stored - Call holds the
// usage and the priced cost columns and the surface tokens, Touch holds the
// byte deltas, ContextMass holds the per-file mass - so the Allocation and
// Rollup tables can be dropped and rebuilt from those tables alone and land
// byte-identical totals. No session log is read.
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";
import type Touched from "../Interface/Touch.js";
import type Usage from "../Interface/Usage.js";
import Allocate from "./Allocate.js";
import Rollup from "./Rollup.js";

export default (Database: DatabaseSync, Config: Config) =>
	(): {
		Allocations: number;
		Rollups: number;
	} => {
		Database.exec("DELETE FROM Allocation");
		Database.exec("DELETE FROM Rollup");

		const Calls = Database.prepare(
			"SELECT CallId, SessionId, Turn, Step, Seq, Provider, Model, InputTokens, OutputTokens, " +
				"CacheReadTokens, CacheWriteTokens, ReasoningTokens, TotalTokens, CostInput, CostOutput, " +
				"CostCacheRead, CostCacheWrite, CostReasoning, CostTotal, Currency, SurfaceTokens, At " +
				"FROM Call",
		).all() as {
			CallId: number;
			SessionId: string;
			Turn: number;
			Step: number;
			Seq: number;
			Provider: string;
			Model: string;
			InputTokens: number;
			OutputTokens: number;
			CacheReadTokens: number;
			CacheWriteTokens: number;
			ReasoningTokens: number;
			TotalTokens: number | null;
			CostInput: number;
			CostOutput: number;
			CostCacheRead: number;
			CostCacheWrite: number;
			CostReasoning: number;
			CostTotal: number;
			Currency: string;
			SurfaceTokens: number;
			At: number;
		}[];
		const Touches = Database.prepare(
			"SELECT Touch.Kind AS Kind, Touch.BytesDelta AS BytesDelta, File.Path AS Path, " +
				"Touch.FileId AS FileId FROM Touch JOIN File ON File.FileId = Touch.FileId " +
				"WHERE Touch.CallId = ?",
		);
		const Masses = Database.prepare(
			"SELECT File.Path AS Path, ContextMass.FileId AS FileId, ContextMass.Tokens AS Tokens " +
				"FROM ContextMass JOIN File ON File.FileId = ContextMass.FileId WHERE ContextMass.CallId = ?",
		);
		const Insert = Database.prepare(
			"INSERT INTO Allocation (CallId, FileId, DirectCost, AmortizedCost, ContextTokens, SurfaceTokens, Weight, Method, At) " +
				"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		);

		let Written = 0;
		for (const Call of Calls) {
			const Usage: Usage = {
				SessionId: Call.SessionId,
				Turn: Call.Turn,
				Step: Call.Step,
				Seq: Call.Seq,
				Provider: Call.Provider,
				Model: Call.Model,
				InputTokens: Call.InputTokens,
				OutputTokens: Call.OutputTokens,
				CacheReadTokens: Call.CacheReadTokens,
				CacheWriteTokens: Call.CacheWriteTokens,
				ReasoningTokens: Call.ReasoningTokens,
				TotalTokens: Call.TotalTokens,
				At: Call.At,
			};
			// the cost the call was priced with: the stored columns, never a
			// re-pricing, so the rebuild lands the numbers the drain landed
			const Costed = {
				Input: Call.CostInput,
				Output: Call.CostOutput,
				CacheRead: Call.CostCacheRead,
				CacheWrite: Call.CostCacheWrite,
				Reasoning: Call.CostReasoning,
				Total: Call.CostTotal,
				Currency: Call.Currency,
			};
			const PerPath = new Map<string, number>();
			const FileIds = new Map<string, number>();
			const Touched: Touched[] = [];
			for (const Row of Touches.all(Call.CallId) as {
				Kind: unknown;
				BytesDelta: unknown;
				Path: unknown;
				FileId: unknown;
			}[]) {
				if (
					typeof Row.Path !== "string" ||
					typeof Row.Kind !== "string" ||
					typeof Row.FileId !== "number"
				) {
					continue;
				}
				FileIds.set(Row.Path, Row.FileId);
				Touched.push({
					SessionId: Call.SessionId,
					Turn: Call.Turn,
					Step: Call.Step,
					Seq: Call.Seq,
					CallKey: "",
					Tool: "",
					Path: Row.Path,
					Kind: Row.Kind as Touched["Kind"],
					BytesBefore: null,
					BytesAfter: null,
					BytesDelta: typeof Row.BytesDelta === "number" ? Row.BytesDelta : null,
				});
			}
			for (const Row of Masses.all(Call.CallId) as {
				Path: unknown;
				FileId: unknown;
				Tokens: unknown;
			}[]) {
				if (
					typeof Row.Path !== "string" ||
					typeof Row.FileId !== "number" ||
					typeof Row.Tokens !== "number"
				) {
					continue;
				}
				PerPath.set(Row.Path, Row.Tokens);
				FileIds.set(Row.Path, Row.FileId);
			}
			const Rows = Allocate(
				Usage,
				Costed,
				Touched,
				{ Surface: Call.SurfaceTokens, PerPath },
				Config,
			);
			for (const Row of Rows) {
				const FileId = Row.Path === null ? null : (FileIds.get(Row.Path) ?? null);
				Insert.run(
					Call.CallId,
					FileId,
					Row.DirectCost,
					Row.AmortizedCost,
					Math.round(Row.ContextTokens),
					Math.round(Row.SurfaceTokens),
					Row.Weight,
					Row.Method,
					Call.At,
				);
				Written += 1;
			}
		}
		const Rollups = Rollup(Database)();
		return { Allocations: Written, Rollups };
	};
