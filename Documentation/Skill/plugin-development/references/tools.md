# Tools: defineTool, the Output Contract, Readonly Registration, exec.signal

> Source: SKILL.md, section 7 "Tools" (first two bullets). Sources:
> user/develop/basic/tool.md:11-36, 36; cookbook/adding-a-tool.md:9-38, 43,
> 49.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

```ts
ctx.tools.register(defineTool({
	name: 'greet', description: '...',
	parameters: { name: { type: 'string', required: true, description: '...' } },
	output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
	async execute(args, exec) { return `Hello, ${args.name}!` },
}))
```

(user/develop/basic/tool.md:11-36; cookbook/adding-a-tool.md:9-38)

- `defineTool` infers/validates args; `execute` returns ONE canonical JSON
  value per `output.schema`; `output.render` converts it to model-facing
  content (tool.md:36).
- Registration is readonly - never mutate after registration
  (adding-a-tool.md:43).
- Honor `exec.signal` (adding-a-tool.md:49).

## Why: The Full Philosophy

1. `defineTool` is the contract enforcement point: it validates the
   parameters against the model's arguments and gives `execute` typed args,
   so the tool body never re-parses or re-checks argument shapes.
2. The two-layer output (canonical value + render) separates data from
   presentation: `execute` returns a single JSON value that satisfies
   `output.schema`; `render` maps that value to the content the model
   sees. This split is what makes presenters pure and replayable (see
   ./references/tool-pipeline.md).
3. Read-only after registration mirrors the fiber model: the registry is a
   shared surface; mutating a registered tool would change behavior under
   other plugins' feet mid-session. To change a tool, the plugin unloads
   and reloads.
4. `exec.signal` is the cancellation contract: long operations must check
   it (typically in loops or before side effects) so a cancelled call does
   not keep burning resources or overwrite newer work.

## Examples

### Good

```ts
ctx.tools.register(defineTool({
	name: 'greet',
	description: 'Greet someone.',
	parameters: { name: { type: 'string', required: true, description: 'Who to greet' } },
	output: {
		schema: { type: 'string' },
		render: (_args, value) => [{ type: 'text', text: value }],
	},
	async execute(args, exec) {
		if (exec.signal.aborted) throw new Error('cancelled')
		return `Hello, ${args.name}!`
	},
}))
```

### Bad

```ts
// Post-registration mutation:
const tool = defineTool({ /* ... */ })
ctx.tools.register(tool)
tool.description = 'New description' // readonly violation
```

```ts
// Ignoring cancellation in a long loop:
async execute(args, exec) {
	for (const item of huge) { await process(item) } // never checks exec.signal
}
```

## Exceptions

- None to the readonly rule. Small, fast tools may legitimately never
  observe `exec.signal` if they cannot be meaningfully cancelled
  mid-flight - but any loop or side effect must check it.

## Failure Modes

- Two different shapes returned from `execute`: violates the one canonical
  value per `output.schema` contract; render and replay break.
- Mutating a registered tool: undefined behavior across plugins, and
  changes invisible to the model until some later refresh.
- Ignoring `exec.signal`: wasted work, and a cancelled operation can still
  commit its side effect after the caller moved on.

## Arbiters

- Review: every tool has typed `parameters`, a single-value `output.schema`,
  and a pure `render` (checklist item 11, see ./references/checklist.md).
- Replay: render output must be identical live and in replay (see
  ./references/tool-pipeline.md).
- Cancellation test: abort `exec.signal` mid-run and assert the tool stops
  without committing.
