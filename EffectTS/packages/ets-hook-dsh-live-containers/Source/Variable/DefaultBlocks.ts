// DefaultBlocks - the DEFAULT block table (a Variable: pure data, not code).
// The 14-entry catalog of Requirements/03 section 3, shipped as the schema
// default of config `blocks` with the sensible enablements (todo-list,
// command-runner and session-stats ON; the rest dormant) - and the PLUGIN
// still disabled (the IDLE-forever posture, schema default of `enabled`).
//
// The catalog entries carry their wave-2 kind names (03 section 3); in
// phase 1 they validate against the kind registry (Interface/Execution.ts
// KINDS) and render as skipped blocks - reason "unknown kind" - until the
// wave-2 render engine lands. This keeps the shipped config byte-stable
// across the phase boundary: wave 2 extends the render engine, never the
// defaults (IMPLEMENTATION-DESIGN.md section 2.2).
//
// The catalog doubles as the suggester's input and the docs' block table in
// wave 2 (03 section 2: one source, three consumers) - Variable/Catalog.ts
// (the suggester-facing projection) is the wave-2 file that reads these.
//
// Tokens the phase-1 engine does not resolve ({{set:NAME}} - the
// live_container_set state) render LITERALLY (research section 3: unknown
// tokens are never a failure) and log `render unknown <id> <token>` - the
// frames of the dormant entries are inert by construction (enabled: false).
import type { BlockSpec } from "../Interface/Execution.js";

export const DEFAULT_BLOCKS: BlockSpec[] = [
	{
		id: "todo-list",
		kind: "todo-list",
		template: "[x] scaffold package | [ ] write smoke R1 | [~] docs - {{set:items}}",
		enabled: true,
		vars: {},
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "command-runner",
		kind: "command-runner",
		template: "live jobs: {{liveJobs}} - proceed reasoning; job_output <id> to check.",
		enabled: true,
		vars: {},
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "session-stats",
		kind: "session-stats",
		template:
			"messages={{messageCount}} turns={{turnCount}} sinceLastTool={{sinceLastTool}} (approximate; plugins do not see token counts)",
		enabled: true,
		vars: {},
		trigger: "request",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "agent-progress-board",
		kind: "agent-progress-board",
		template: "{{set:board}}",
		enabled: false,
		vars: {},
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "task-failsafe-guard",
		kind: "task-failsafe-guard",
		template: "GUARD: {{set:guard}}",
		enabled: false,
		vars: {},
		trigger: "request",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "countdown-expiry",
		kind: "countdown-expiry",
		template: "{{set:label}} in {{set:remaining}}",
		enabled: false,
		vars: {},
		trigger: "ttl",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "diff-summary",
		kind: "diff-summary",
		template: "changed: {{set:diff}}",
		enabled: false,
		vars: {},
		trigger: "ttl",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "constraint-reminder",
		kind: "constraint-reminder",
		template: "{{rules}}",
		enabled: false,
		vars: { rules: "NEVER run git mutations. ASCII only. Tabs only." },
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "scoreboard",
		kind: "scoreboard",
		template: "TODO {{set:done}} | current: {{set:current}} | next: {{set:next}}",
		enabled: false,
		vars: {},
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "live-manifest",
		kind: "live-manifest",
		template: "cwd={{cwd}} session={{sessionId}} live-containers=on",
		enabled: false,
		vars: {},
		trigger: "ttl",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "memory-block",
		kind: "memory-block",
		template: "PIN: {{set:memory}}",
		enabled: false,
		vars: {},
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "validator",
		kind: "validator",
		template: "{{set:verdict}}",
		enabled: false,
		vars: {},
		trigger: "request",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "environment-drift",
		kind: "environment-drift",
		template: "cwd={{cwd}}",
		enabled: false,
		vars: {},
		trigger: "ttl",
		ttlCalls: 8,
		scope: "always",
	},
	{
		id: "delegation-inbox",
		kind: "delegation-inbox",
		template: "reports: {{set:reports}}",
		enabled: false,
		vars: {},
		trigger: "event",
		ttlCalls: 8,
		scope: "always",
	},
];
