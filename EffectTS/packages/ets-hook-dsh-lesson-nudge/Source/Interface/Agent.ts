// Agent - the type-only publication of @deepseek-ai/dsh-agent's `Events`
// augmentation.
//
// WHY A MODULE WITH NO EXPORTS: the harness declares its lifecycle events
// (`agent/created`, `agent/status`, `agent/pre-step`, `agent/request`,
// `agent/assistant-stream`, ...) inside a `declare module "@deepseek-ai/cordis"`
// block in its own type files. Those declarations are only visible in a
// compilation unit that has LOADED the package's types, so a plugin that
// listens to `agent/status` must import the package for its declarations alone.
// `import type {}` does exactly that and emits nothing - there is no runtime
// dependency on dsh-agent, which is what keeps this hook a plain listener.
//
// The event this hook uses is `agent/status` (mode `emit`): `idle <-> running`,
// the only edge on which a review may claim the maintenance phase.
import type {} from "@deepseek-ai/dsh-agent";
