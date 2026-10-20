// Source/Test/Dynamic-And-Craft/Test.ts - one singular test: the
// dynamic-instruction engine (D1's engine paths) plus the craft library. The
// engine paths: the fetch failure degrades to the static table (D2), the
// section cap / mapped-class priority / top-up (D3), the section cache with
// its TTL and tools/change rebuild paths (D4), and fetchLive=false plus the
// volatile flips via the P10 loader/volatile-update dispatch (D5). The craft
// library classifies every obfuscated variant correctly, including the
// catch-all and the exemption rows. Runs standalone
// (`node Target/Test/Dynamic-And-Craft/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-tool-coach. The assertions are moved
// verbatim from Classic/smokes/tool-coach-smoke.mjs (D2 + D3 + D4 + D5 + the
// craft battery).
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Make,
	MakeCounter,
	Validate,
	Assemble,
	Post,
	rm,
	Agent,
	LinesWith,
	Detect,
	DEFAULT_PATTERNS,
	DEFAULT_EXEMPTS,
	STATIC_TOOL_LINES,
	Ledger,
	LiveSchemas,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: D2 - the fetch failure: schemas() throws, the note degrades to
	// the static table, the ledger carries the fetch-failure line, the
	// waterfall continues.
	{
		rm();
		const RunD2 = Make(Validate({ logFile: Ledger }), {
			tools: {
				schemas: () => {
					throw new Error("registry exploded");
				},
			},
		});
		const AgentD2 = Agent("agent-d2");
		await Post(RunD2, "cat a.md", AgentD2);
		await Post(RunD2, "cat a.md", AgentD2);
		const D2Out = await Post(RunD2, "cat a.md", AgentD2); // the 3rd read offense notes (same class)
		await CheckAsync(Count, "D2: the note degrades to the STATIC tool line (no live fixture marker)", async () => {
			const D2Text = D2Out.additionalContexts[0].content[0].text;
			const StaticRead: string = STATIC_TOOL_LINES["read"]?.description ?? "";
			assert.ok(
				D2Text.includes(`- read: ${StaticRead} (key parameter: file_path).`) &&
					!D2Text.includes("(live fixture)"),
			);
		});
		await CheckAsync(
			Count,
			"D2: the fetch-failure ledger line is byte-exact (exactly once - fetched per note)",
			async () => {
				assert.ok(LinesWith(RunD2, ": schema fetch failed -> static fallback").length === 1);
			},
		);
		await CheckAsync(Count, "D2: the waterfall continues (the note never fails it)", async () => {
			assert.ok(D2Out.kind === "accept");
		});
		await CheckAsync(Count, "D2: the strike line is unchanged under the fallback", async () => {
			assert.ok(LinesWith(RunD2, ": strike 3/3 bash read -> note read").length === 1);
		});
	}
	// Group: D3 - the section cap + mapped-class priority + the top-up.
	{
		rm();
		const RunD3 = Make(Validate({ logFile: Ledger, maxSectionTools: 3 }));
		const AgentD3 = Agent("agent-d3");
		for (let Index = 0; Index < 9; Index += 1) {
			await Post(RunD3, "cat a.md", AgentD3);
		}
		const D3Assembly = await Assemble(RunD3, AgentD3);
		await CheckAsync(Count, "D3: exactly maxSectionTools (3) rows", async () => {
			const D3Table = D3Assembly.sections[1].text.split("| tool | purpose |")[1] ?? "";
			const D3Rows = D3Table.split("\n").filter(
				(Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"),
			);
			assert.equal(D3Rows.length, 3);
		});
		await CheckAsync(
			Count,
			"D3: the rows follow the mapped-class priority (write tools first, then read) - no search/discovery/control rows",
			async () => {
				const D3Table = D3Assembly.sections[1].text.split("| tool | purpose |")[1] ?? "";
				const D3Rows = D3Table.split("\n").filter(
					(Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"),
				);
				assert.equal(
					JSON.stringify(D3Rows.map((Row: string) => Row.split(" | ")[0]!.slice(2))),
					JSON.stringify(["edit", "write", "read"]),
				);
			},
		);
		rm();
		const RunD3b = Make(Validate({ logFile: Ledger, maxSectionTools: 24 }));
		const AgentD3b = Agent("agent-d3b");
		for (let Index = 0; Index < 9; Index += 1) {
			await Post(RunD3b, "cat a.md", AgentD3b);
		}
		const D3bAssembly = await Assemble(RunD3b, AgentD3b);
		await CheckAsync(Count, "D3b: the cap-24 table holds every mapped tool plus the top-up", async () => {
			const D3bRows = (D3bAssembly.sections[1].text.split("| tool | purpose |")[1] ?? "")
				.split("\n")
				.filter((Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"));
			assert.ok(D3bRows.length >= 11);
		});
		await CheckAsync(
			Count,
			"D3b: the mapped order is write, read, search, discovery, control (first appearance within a class)",
			async () => {
				const D3bRows = (D3bAssembly.sections[1].text.split("| tool | purpose |")[1] ?? "")
					.split("\n")
					.filter((Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"));
				assert.equal(
					JSON.stringify(D3bRows.map((Row: string) => Row.split(" | ")[0]!.slice(2)).slice(0, 11)),
					JSON.stringify([
						"edit",
						"write",
						"read",
						"ccr_retrieve",
						"grep",
						"glob",
						"working_directory",
						"web_fetch",
						"run_in_background",
						"schedule_create",
						"plugin_manager",
					]),
				);
			},
		);
		await CheckAsync(Count, "D3b: non-mapped live tools top up the table", async () => {
			const D3bRows = (D3bAssembly.sections[1].text.split("| tool | purpose |")[1] ?? "")
				.split("\n")
				.filter((Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"));
			const D3bTopUp = D3bRows.map((Row: string) => Row.split(" | ")[0]!.slice(2)).slice(11);
			assert.ok(D3bTopUp.includes("web_search") && D3bTopUp.includes("zzz_fixture"));
		});
		await CheckAsync(Count, "D3b: the top-up is alphabetical", async () => {
			const D3bRows = (D3bAssembly.sections[1].text.split("| tool | purpose |")[1] ?? "")
				.split("\n")
				.filter((Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"));
			const D3bTopUp = D3bRows.map((Row: string) => Row.split(" | ")[0]!.slice(2)).slice(11);
			assert.equal(JSON.stringify(D3bTopUp), JSON.stringify([...D3bTopUp].sort()));
		});
	}
	// Group: D4 - the section cache: rebuilt at sectionTtl judged calls AND on
	// tools/change, each path with its own ledger line.
	{
		rm();
		const RunD4 = Make(Validate({ logFile: Ledger, sectionTtl: 2 }));
		const AgentD4 = Agent("agent-d4");
		for (let Index = 0; Index < 9; Index += 1) {
			await Post(RunD4, "cat a.md", AgentD4);
		}
		await Assemble(RunD4, AgentD4); // first build at calls=9 (no rebuild line)
		await CheckAsync(Count, "D4: the first build is silent", async () => {
			assert.ok(LinesWith(RunD4, ": section rebuilt").length === 0);
		});
		await Post(RunD4, "git status", AgentD4);
		await Post(RunD4, "git status", AgentD4); // calls=11, 11-9 >= ttl 2
		await Assemble(RunD4, AgentD4);
		await CheckAsync(Count, "D4: the TTL path logs 'section rebuilt (ttl 2)'", async () => {
			assert.ok(LinesWith(RunD4, ": section rebuilt (ttl 2)").length === 1);
		});
		RunD4.Listeners["tools/change"]();
		await CheckAsync(
			Count,
			"D4: the tools/change path logs 'section rebuilt (tools/change)'",
			async () => {
				assert.ok(LinesWith(RunD4, ": section rebuilt (tools/change)").length === 1);
			},
		);
		await CheckAsync(Count, "D4: the registry tracks the live agent states", async () => {
			assert.ok(RunD4.State.Registry.size >= 1);
		});
		const CacheBefore = [...RunD4.State.Registry].find((S: any) => S.tier2)?.sectionCache;
		await CheckAsync(Count, "D4: tools/change cleared the section cache", async () => {
			assert.equal(CacheBefore, undefined);
		});
		await Assemble(RunD4, AgentD4); // silent rebuild from the fresh registry
		await CheckAsync(
			Count,
			"D4: the post-invalidation rebuild is silent (only the two path lines exist)",
			async () => {
				assert.ok(LinesWith(RunD4, ": section rebuilt").length === 2);
			},
		);
	}
	// Group: D5 - fetchLive=false (static only, no fetch-failure line ever) +
	// the volatile flips via a fake loader/volatile-update.
	{
		const RawD5 = Validate({ logFile: Ledger, fetchLive: false });
		const RunD5 = Make(RawD5, {
			tools: {
				schemas: () => {
					throw new Error("must never be called");
				},
			},
		});
		const AgentD5 = Agent("agent-d5");
		await Post(RunD5, "cat a.md", AgentD5);
		await Post(RunD5, "cat a.md", AgentD5);
		const D5Out = await Post(RunD5, "cat a.md", AgentD5); // the 3rd read offense notes
		await CheckAsync(Count, "D5: fetchLive=false - the note uses the static table only", async () => {
			const D5Text = D5Out.additionalContexts[0].content[0].text;
			const StaticRead: string = STATIC_TOOL_LINES["read"]?.description ?? "";
			assert.ok(
				D5Text.includes(StaticRead) && !D5Text.includes("(live fixture)"),
			);
		});
		await CheckAsync(
			Count,
			"D5: no fetch-failure line is ever logged with fetchLive=false",
			async () => {
				assert.ok(RunD5.Lines.every((L: string) => !L.includes("schema fetch failed")));
			},
		);
		// The volatile flips: fake cells + the P10 loader/volatile-update dispatch.
		RawD5.fetchLive = { get: () => true };
		RawD5.maxSectionTools = { get: () => 24 };
		RawD5.threshold = { get: () => 2 };
		RawD5.enabled = { get: () => true };
		RunD5.Listeners["loader/volatile-update"]([
			["fetchLive"],
			["maxSectionTools"],
			["threshold"],
			["enabled"],
		]);
		await CheckAsync(Count, "D5: the fetchLive flip lands on the State without a remount", async () => {
			assert.ok(RunD5.State.FetchLive === true);
		});
		// The flipped fetchLive needs a working registry fixture again.
		RunD5.Context.tools = { schemas: LiveSchemas };
		await CheckAsync(Count, "D5: the maxSectionTools flip lands on the State", async () => {
			assert.ok(RunD5.State.MaximumSectionTools === 24);
		});
		await CheckAsync(Count, "D5: the threshold flip lands on the State", async () => {
			assert.ok(RunD5.State.Threshold === 2);
		});
		const AgentD5b = Agent("agent-d5b");
		await Post(RunD5, "cat a.md", AgentD5b);
		const D5bOut = await Post(RunD5, "cat a.md", AgentD5b);
		await CheckAsync(
			Count,
			"D5: the flipped fetchLive is picked up on the next judged call (live text, no remount)",
			async () => {
				assert.ok(D5bOut.additionalContexts[0].content[0].text.includes("(live fixture)"));
			},
		);
		await CheckAsync(
			Count,
			"D5: the flipped threshold=2 is picked up too (byte-exact strike line)",
			async () => {
				assert.ok(LinesWith(RunD5, ": strike 2/2 bash read -> note read").length === 1);
			},
		);
	}
	// Group: the craft library (plan 2.7c): every obfuscated variant classifies
	// correctly, including the catch-all and the exemption rows.
	{
		const Craft = (Command: string): any => Detect(Command, DEFAULT_PATTERNS, DEFAULT_EXEMPTS);
		const Expect = (Command: string, Kind: string, Cls?: string): void => {
			const R = Craft(Command);
			Check(
				Count,
				`craft: ${JSON.stringify(Command)} -> ${Kind}${Cls ? `/${Cls}` : ""}`,
				() => {
					assert.ok(
						Kind === "none"
							? R === null
							: R !== null &&
									R.kind === Kind &&
									(Cls === undefined || (Kind === "offense" ? R.match.class === Cls : true)),
					);
				},
			);
		};
		Expect("sed -i.bak s/x/y/ f", "offense", "write");
		Expect('perl -pi -e "s/x/y/" f', "offense", "write");
		Expect('echo "${TXT}" > f.md', "offense", "write");
		Expect("printf '%s\\n' x | tee -a f", "offense", "write");
		Expect("cat <<'EOF' > f.md\nbody\nEOF", "offense", "write");
		Expect("python3 -c \"open('f','w').write(x)\"", "offense", "write");
		Expect("echo a2V5 | base64 -d | sh", "offense", "write");
		Expect("x='sed'; $x -i s/a/b/ f", "offense", "write");
		Expect("grep x f > /dev/null", "offense", "search");
		Expect("cat f | sed s/a/b/ > f", "offense", "write");
		Expect("find . -name '*.ts' -exec sed -i s/a/b/ {} +", "offense", "write");
		Expect("ssh host 'cat f'", "none");
		Expect("git diff > patch.txt", "exempt");
		Expect("journalctl > log.txt", "offense", "write");
		Expect("git stash", "none");
		Expect("echo x > tracked.md", "offense", "write");
		Expect("cat a; sed -i s/x/y/ b", "offense", "write");
	}
	return Finish(Count, "Dynamic-And-Craft");
};

// Standalone entry: `node Target/Test/Dynamic-And-Craft/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Dynamic-And-Craft`);
}
