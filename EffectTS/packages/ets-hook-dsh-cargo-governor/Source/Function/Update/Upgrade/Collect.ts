// Collect — read one collected stream from the subprocess handle
// (best-effort; collect readers are offset-based and stay readable after
// exit). Shared by the seam and the child-fallback paths.
import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";

export default (Handle: SubprocessHandle, Channel: "stdout" | "stderr"): string => {
	try {
		const Read = Handle.collected?.[Channel]?.readFrom(0);
		switch (true) {
			case !!Read:
				return Read.text;
		}
	} catch {
		/* collection best-effort */
	}
	return "";
};
