import { helper } from "./helper";
import path from "node:path";
const VERSION = 1;
function greet(name) {
  return `hello ${name}`;
}
class Greeter {
  wave() {
    return greet("wave");
  }
}
let counter = 0;
export {
  Greeter,
  VERSION,
  greet
};
//# sourceMappingURL=Fixture.js.map
