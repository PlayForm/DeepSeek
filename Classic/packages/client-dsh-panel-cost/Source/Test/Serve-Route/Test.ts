// Source/Test/Serve-Route/Test.ts - the host half's route registration,
// exercised through the route the real built plugin apply actually
// registered on the fake webServer port: the one /api/playform-cost/session
// path, the handler's 200 JSON answer for a query without a session id (the
// "session" code, which never opens the ledger), the port-only registration
// channel, and the silent posture when no webServer is present.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Plugin } from "../Harness.js";

export const runTest = (): number => {
	const Count = MakeCounter();

	// S1: the three routes exist, in order, under the documented paths.
	const Run = Make();
	Check(Count, "S1: three routes, session then catalogs then rates", () => {
		assert.deepEqual(
			Run.Provided.routes.map((Route: { path: string }) => Route.path),
			[
				"/api/playform-cost/session",
				"/api/playform-cost/catalogs",
				"/api/playform-cost/rates",
			],
		);
	});

	// S2: a query without a session id answers the "session" code, and the
	// handler never opens the ledger for it.
	Check(Count, "S2: the handler answers 200 JSON and names the missing session", () => {
		let Status = 0;
		let Headers: Record<string, string> | undefined;
		let Body: string | undefined;
		const Response = {
			writeHead: (status: number, headers: Record<string, string>) => {
				Status = status;
				Headers = headers;
			},
			end: (body: string) => {
				Body = body;
			},
		};
		(Run.Provided.routes[0] as any).handler(
			{ url: "/api/playform-cost/session" } as any,
			Response as any,
		);
		assert.equal(Status, 200);
		assert.equal(Headers?.["content-type"], "application/json; charset=utf-8");
		assert.equal(Headers?.["cache-control"], "no-store");
		assert.equal(typeof Body, "string");
		const Parsed = JSON.parse(Body as string);
		assert.equal(Parsed.ok, false);
		assert.equal(Parsed.code, "session");
		assert.equal(Parsed.rows, 200);
		assert.equal(Parsed.session, null);
		assert.equal(Parsed.calls.length, 0);
		assert.match(Parsed.message, /no session id/);
	});

	// S3: the registration went through the webServer port, and only there.
	Check(Count, "S3: the port saw the three registrations and nothing else", () => {
		assert.equal(Run.Provided.routes.length, 3);
		assert.equal(Run.Server.Seen.n, 3);
		assert.equal(typeof Run.Provided.routes[0].handler, "function");
	});

	// S4: with no webServer the apply is silent - no throw, no registration.
	const Bare = Make({ none: true, defer: true });
	Check(Count, "S4: no webServer means no throw and no registration", () => {
		assert.doesNotThrow(() => (Plugin.apply as any)(Bare.Ctx));
		assert.equal(Bare.Provided.routes.length, 0);
	});

	return Finish(Count, "Serve-Route");
};

// Standalone entry: `node Target/Test/Serve-Route/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = runTest();
	console.log(`${Pass} PASS - Serve-Route`);
}
