import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Plugin } from "../Harness.js";
const runTest = () => {
  const Count = MakeCounter();
  const Run = Make();
  Check(Count, "S1: four routes, session, catalogs, rates, publish", () => {
    assert.deepEqual(
      Run.Provided.routes.map((Route) => Route.path),
      [
        "/api/playform-cost/session",
        "/api/playform-cost/catalogs",
        "/api/playform-cost/rates",
        "/api/playform-cost/publish"
      ]
    );
  });
  Check(Count, "S2: the handler answers 200 JSON and names the missing session", () => {
    let Status = 0;
    let Headers;
    let Body;
    const Response = {
      writeHead: (status, headers) => {
        Status = status;
        Headers = headers;
      },
      end: (body) => {
        Body = body;
      }
    };
    Run.Provided.routes[0].handler(
      { url: "/api/playform-cost/session" },
      Response
    );
    assert.equal(Status, 200);
    assert.equal(Headers?.["content-type"], "application/json; charset=utf-8");
    assert.equal(Headers?.["cache-control"], "no-store");
    assert.equal(typeof Body, "string");
    const Parsed = JSON.parse(Body);
    assert.equal(Parsed.ok, false);
    assert.equal(Parsed.code, "session");
    assert.equal(Parsed.rows, 200);
    assert.equal(Parsed.session, null);
    assert.equal(Parsed.calls.length, 0);
    assert.match(Parsed.message, /no session id/);
  });
  Check(Count, "S3: the port saw the four registrations and nothing else", () => {
    assert.equal(Run.Provided.routes.length, 4);
    assert.equal(Run.Server.Seen.n, 4);
    assert.equal(typeof Run.Provided.routes[0].handler, "function");
  });
  const Bare = Make({ none: true, defer: true });
  Check(Count, "S4: no webServer means no throw and no registration", () => {
    assert.doesNotThrow(() => Plugin.apply(Bare.Ctx));
    assert.equal(Bare.Provided.routes.length, 0);
  });
  return Finish(Count, "Serve-Route");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = runTest();
  console.log(`${Pass} PASS - Serve-Route`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
