import { Effect } from "effect";
import { LedgerService } from "@playform/ets-base-dsh";
import { WriteService } from "@playform/ets-base-dsh";
import type { State as State } from "@playform/ets-base-dsh";
import type { Transform as Transform } from "@playform/ets-base-dsh";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
export default _default;
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Version: FsVersion, Transform: Transform): Effect.Effect<void, never, LedgerService | WriteService>;
