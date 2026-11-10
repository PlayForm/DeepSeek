import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";
import type State from "@Interface/State.js";

import Pipe from "./Pipe.js";

/**
 * @module Collect
 *
 * Pipes one collected stream to the ledger and the job ring.
 *
 * @remarks
 *
 * Best-effort; collect readers are offset-based and stay readable after exit.
 */
export default (
	State: State,
	Handle: SubprocessHandle,
	Channel: "stdout" | "stderr",
	Emit: ((text: string) => void) | undefined,
): void => {
	try {
		const Read = Handle.collected?.[Channel]?.readFrom(0);
		switch (true) {
			case !!Read && Read.text.length > 0:
				Pipe(State, Read.text.replace(/\n+$/, ""), Emit);
				break;
		}
	} catch {
		/* collection best-effort */
	}
};
