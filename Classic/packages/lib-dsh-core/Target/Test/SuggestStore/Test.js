import assert from "node:assert/strict";
import { SuggestStore } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "SuggestStore: the learning store (the probe and the bounded map, the caller's)";
    {
      Check(Count, Sub, () => {
        const Neutral = 1 / 3;
        const Table = () => "table";
        const Never = () => void 0;
        const Store = SuggestStore(Never, "core-suggester", 512, Table, () => 0);
        assert.equal(
          Store.Store(),
          "memory",
          "a probe that answers undefined is the memory fallback"
        );
        assert.equal(
          Store.Rate("History", "GUIDE.md").Companion,
          Neutral,
          "an unobserved companion rate answers the neutral 1/3"
        );
        assert.equal(
          Store.Rate("History", "GUIDE.md").Family,
          Neutral,
          "an unobserved family rate answers the neutral 1/3 too"
        );
        Store.Move("History", ["GUIDE.md"], "accepted");
        assert.equal(
          Store.Rate("History", "GUIDE.md").Companion,
          Neutral + 0.1,
          "an accepted outcome raises the candidate's confidence by the accept bonus"
        );
        assert.equal(
          Store.Rate("History", "GUIDE.md").Family,
          Neutral + 0.1,
          "the family's row moves with the outcome"
        );
        Store.Move("History", ["GUIDE.md"], "rejected");
        assert.equal(
          Store.Rate("History", "GUIDE.md").Companion,
          Neutral + 0.1 - 0.2,
          "a rejected outcome lowers the candidate's confidence by the reject penalty"
        );
        for (let Index = 0; Index < 8; Index++) {
          Store.Move("History", ["GUIDE.md"], "rejected");
        }
        assert.equal(
          Store.Rate("History", "GUIDE.md").Companion,
          0,
          "the floor is never crossed: repeated rejections stop at zero"
        );
        assert.equal(
          Store.Rate("History", "GUIDE.md").Family,
          0,
          "the family's row clamps at the floor too"
        );
        for (let Index = 0; Index < 12; Index++) {
          Store.Move("History", ["GUIDE.md"], "accepted");
        }
        assert.equal(
          Store.Rate("History", "GUIDE.md").Companion,
          1,
          "the ceiling is never crossed either: repeated accepts stop at one"
        );
        const Second = SuggestStore(Never, "core-suggester", 512, Table, () => 0);
        Second.Move("History", ["GUIDE.md"], "accepted");
        assert.equal(
          Store.Rate("History", "GUIDE.md").Companion,
          1,
          "a second mount leaves the first mount's rows untouched"
        );
        assert.equal(
          Second.Rate("History", "GUIDE.md").Companion,
          Neutral + 0.1,
          "a second mount starts neutral: the maps are per factory call"
        );
        const Pattern = SuggestStore(
          () => ({
            Get: () => void 0,
            Put: () => void 0,
            Record: () => void 0
          }),
          "core-suggester",
          512,
          Table,
          () => 0
        );
        assert.equal(
          Pattern.Store(),
          "pattern",
          "a probe that answers the whole Get/Put/Record contract is the pattern backend"
        );
        Pattern.Move("History", ["GUIDE.md"], "accepted");
        assert.equal(
          Pattern.Rate("History", "GUIDE.md").Companion,
          Neutral,
          "the service's absent rows answer the neutral rate: the record is seeded, the service owns the move"
        );
      });
    }
  }
  return Finish(Count, "SuggestStore");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - SuggestStore`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
