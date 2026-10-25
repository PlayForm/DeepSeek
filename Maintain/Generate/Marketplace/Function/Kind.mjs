import KindPrefixes from "../Variable/KindPrefixes.mjs";
import Strip from "./Strip.mjs";

const Kinds = { lib: "library" };

export default (Directory) => {
	const Base = Strip(Directory, ["ets"]);
	const Kind = Strip(Base, KindPrefixes);
	const Prefix = Base === Kind ? null : Base.slice(0, Base.length - Kind.length - 1);
	return Prefix ? (Kinds[Prefix] ?? Prefix) : "library";
};
