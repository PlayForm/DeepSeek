// Connect - the reflective connect op (Function/Connect): ONE call bundling
// the connection of two blocks/files. The v0 transformation: insert the
// reference into the from-file - with a `symbol`, an import statement of that
// symbol from the relative specifier of the to-file; without one, a reference
// comment naming the to-file. Idempotent by construction: a from-file that
// already references the specifier is a `rejected` reply ("already
// connected"), never a duplicated import. The publish goes through
// Function/Publish (the version fence).
import * as Path from "node:path";

import Carry from "@Function/Carry.js";
import Observe from "@Function/Observe.js";
import Publish from "@Function/Publish.js";
import type { Operation } from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";

const Refuse = (State: State, From: string, Reason: string): Reply => {
	State.Factory.Append(State, `rejected ${From} (${Reason})`);
	return { status: "rejected", detail: Reason, version: undefined };
};

export default async (State: State, Operation: Operation): Promise<Reply> => {
	if (Operation.kind !== "connect") {
		return Refuse(State, "", "operation is not a connect");
	}
	const Connect = Operation as {
		kind: "connect";
		fromPath?: unknown;
		toPath?: unknown;
		symbol?: unknown;
	};
	const From = String(Connect.fromPath ?? "");
	const To = String(Connect.toPath ?? "");
	const Symbol = typeof Connect.symbol === "string" ? Connect.symbol : "";
	switch (true) {
		case !State.On:
			// The cold mount: every operation answers denied, never a write.
			State.Factory.Append(State, "denied (enabled=false)");
			return { status: "denied", detail: "enabled=false", version: undefined };
		case From.length === 0 || To.length === 0:
			return Refuse(State, From, "connect identity incomplete");
		default:
	}
	const Read = await Observe(State, From);
	if (!Read.Ok) {
		State.Factory.Append(State, `rejected ${From} (${Read.Reply.detail})`);
		return Read.Reply;
	}
	const { Observed } = Read;
	const Relative = Path.relative(Path.dirname(From), To).split(Path.sep).join("/");
	const Specifier = Relative.startsWith(".") ? Relative : `./${Relative}`;
	const Duplicate = Observed.lines.some((Line) => Line.includes(`from "${Specifier}"`));
	switch (true) {
		case Duplicate:
			return Refuse(State, From, "already connected");
		default:
	}
	const Insert =
		Symbol.length > 0 ? `import { ${Symbol} } from "${Specifier}";` : `// connect: ${To}`;
	Observed.lines.unshift(Insert);
	const Reply = await Publish(State, From, Observed.version, Observed.lines.join("\n"));
	switch (true) {
		case Reply.status === "conflict":
			State.Factory.Append(State, `conflict ${From} (expected ${Observed.version})`);
			break;
		case Reply.status === "outcome-unknown":
			State.Factory.Append(State, `failed ${From} (${Reply.detail})`);
			break;
		default:
			State.Factory.Append(State, `connect ${From} -> ${To} (${Reply.status})`);
	}
	if (Reply.status === "applied") {
		await Carry(State, From);
	}
	return Reply;
};
