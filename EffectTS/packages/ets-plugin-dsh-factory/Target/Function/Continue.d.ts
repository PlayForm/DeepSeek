import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import { LedgerService, WriteService, type State, type Transform } from "@playform/ets-base-dsh";
import { Effect } from "effect";
declare const _default: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Version: FsVersion, Transform: Transform) => Effect.Effect<void, never, LedgerService | WriteService>;
export default _default;
