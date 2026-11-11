import * as FileSystem from "node:fs";
import * as Module from "node:module";
const Root = (Context) => {
  const Parent = String(Context.parentURL ?? "");
  const Marker = Parent.indexOf("/Target/");
  return Marker === -1 ? Parent : Parent.slice(0, Marker);
};
const Resolve = (Specifier, Context, Next) => {
  switch (true) {
    case Specifier.startsWith("@Function/"):
      return Next(
        `${Root(Context)}/Target/Function/${Specifier.slice("@Function/".length)}`,
        Context
      );
    case (Specifier.startsWith("@Variable/") && Specifier.endsWith(".json")):
      return Next(
        `${Root(Context)}/Source/Variable/${Specifier.slice("@Variable/".length)}`,
        Context
      );
    case Specifier.startsWith("@Variable/"):
      return Next(
        `${Root(Context)}/Target/Variable/${Specifier.slice("@Variable/".length)}`,
        Context
      );
    default:
      return Next(Specifier, Context);
  }
};
const Load = (Address, Context, Next) => {
  switch (true) {
    case (Address.endsWith("/Source/Variable/Locale-en.json") || Address.endsWith("/Source/Variable/Locale-zh.json")): {
      const Text = FileSystem.readFileSync(new URL(Address).pathname, "utf8");
      return {
        format: "module",
        shortCircuit: true,
        source: `export default ${JSON.stringify(JSON.parse(Text))};`
      };
    }
    default:
      return Next(Address, Context);
  }
};
Module.registerHooks({ resolve: Resolve, load: Load });
//# sourceMappingURL=Alias-Hooks.js.map
