// Form - derive one adapter's config form from its plugin's SERIALIZED
// Schemastery schema (the settings.describe envelope). The walk resolves the
// schema's `refs` table, flattens object fields to dotted paths, and marks
// each field with the two write routes: `volatile` fields apply live through
// the revision-fenced settings mutate, plain fields apply on remount through
// the plain-field bridge, and `role("secret")` fields never render their
// value. Values, the composition base, and the raw user layer come from the
// same namespace view, so provenance (`overridden`) is a key-presence test,
// never a value comparison. A missing settings client is `unavailable`; a
// missing namespace view is `loading` (the documented states).
import type {
	PanelFormField,
	PanelFormInput,
	PanelFormView,
	PanelNamespaceView,
} from "@Interface/Form.js";
import type { PanelSection } from "@Interface/Panel.js";

/** One resolved schema node (the serialized Schemastery envelope's shape). */
type Node = {
	type?: unknown;
	meta?: Record<string, unknown>;
	dict?: Record<string, unknown>;
	list?: readonly unknown[];
	value?: unknown;
};

const IsRecord = (Value: unknown): Value is Record<string, unknown> =>
	typeof Value === "object" && Value !== null && !Array.isArray(Value);

/** The schema envelope's shared-reference table (empty when there is none). */
const RefsOf = (Schema: unknown): Record<string, unknown> => {
	switch (true) {
		case IsRecord(Schema) && IsRecord(Schema["refs"]):
			return Schema["refs"] as Record<string, unknown>;
		default:
			return {};
	}
};

/** Resolve one serialized node: a typed node, a numeric reference into refs,
 *  or the `{ uid, refs }` envelope (its root node is `refs[uid]`). */
const Resolve = (Value: unknown, Refs: Record<string, unknown>, Depth = 0): Node | undefined => {
	switch (true) {
		case Depth > 8:
			return undefined;
		case typeof Value === "number":
			return Resolve(Refs[String(Value)], Refs, Depth + 1);
		case !IsRecord(Value):
			return undefined;
		default: {
			const Candidate = Value as Record<string, unknown>;
			switch (true) {
				case typeof Candidate["type"] === "string":
					return Value as Node;
				case IsRecord(Candidate["refs"]) && typeof Candidate["uid"] === "number":
					return Resolve(
						(Candidate["refs"] as Record<string, unknown>)[String(Candidate["uid"])],
						Refs,
						Depth + 1,
					);
				default:
					return undefined;
			}
		}
	}
};

/** Read a nested value by an object-key path. */
const GetPath = (Value: unknown, Path: readonly string[]): unknown => {
	let Current: unknown = Value;
	for (const Key of Path) {
		switch (true) {
			case Array.isArray(Current):
				Current = Current[Number(Key)];
				break;
			case IsRecord(Current):
				Current = Current[Key];
				break;
			default:
				return undefined;
		}
	}
	return Current;
};

/** Report whether the final path key exists independently of its value. */
const HasPath = (Value: unknown, Path: readonly string[]): boolean => {
	switch (true) {
		case Path.length === 0:
			return Value !== undefined;
		default: {
			const Parent = GetPath(Value, Path.slice(0, -1));
			const Key = Path[Path.length - 1] as string;
			switch (true) {
				case Array.isArray(Parent):
					return Number(Key) < Parent.length;
				case IsRecord(Parent):
					return Key in Parent;
				default:
					return false;
			}
		}
	}
};

/** The literal options of a union of const nodes, when the field is one. */
const Options = (Node: Node, Refs: Record<string, unknown>): string[] | undefined => {
	switch (true) {
		case Node.type !== "union" || !Array.isArray(Node.list):
			return undefined;
		default: {
			const Values = (Node.list as readonly unknown[])
				.map((Member) => Resolve(Member, Refs))
				.filter((Member): Member is Node => Member !== undefined && Member.type === "const")
				.map((Member) => String(Member.value));
			return Values.length === 0 ? undefined : Values;
		}
	}
};

/** Flatten one object node's fields (nested objects inherit the volatile flag). */
const Fields = (
	Root: Node,
	Refs: Record<string, unknown>,
	View: PanelNamespaceView,
	Path: readonly string[],
	Inherited: boolean,
	Depth: number,
): PanelFormField[] => {
	switch (true) {
		case Depth > 6 || Root.type !== "object" || !IsRecord(Root.dict):
			return [];
		default: {
			const Result: PanelFormField[] = [];
			for (const [Name, Child] of Object.entries(Root.dict as Record<string, unknown>)) {
				const Resolved = Resolve(Child, Refs);
				switch (true) {
					case Resolved === undefined:
						break;
					default: {
						const Meta = IsRecord(Resolved.meta) ? Resolved.meta : {};
						switch (true) {
							case Meta["hidden"] === true:
								break;
							default: {
								const ChildPath = [...Path, Name];
								const Volatile = Inherited || Meta["volatile"] === true;
								switch (true) {
									case Resolved.type === "object" && IsRecord(Resolved.dict):
										Result.push(
											...Fields(
												Resolved,
												Refs,
												View,
												ChildPath,
												Volatile,
												Depth + 1,
											),
										);
										break;
									default: {
										const Values = Options(Resolved, Refs);
										Result.push({
											path: ChildPath,
											label: ChildPath.join("."),
											type:
												typeof Resolved.type === "string"
													? Resolved.type
													: "unknown",
											volatile: Volatile,
											secret: Meta["role"] === "secret",
											overridden: HasPath(View.user, ChildPath),
											value: GetPath(View.value, ChildPath),
											base: GetPath(View.base, ChildPath),
											...(Values === undefined ? {} : { options: Values }),
										});
										break;
									}
								}
							}
						}
					}
				}
			}
			return Result;
		}
	}
};

export default function Form(Section: PanelSection, Input: PanelFormInput): PanelFormView {
	const Base = {
		namespace: Section.namespace,
		writable: Input.writable,
		bridge: Input.bridge,
	};
	switch (true) {
		case !Input.available:
			return { ...Base, status: "unavailable", secret: false, fields: [] };
		case Input.view === undefined:
			return { ...Base, status: "loading", secret: false, fields: [] };
		default: {
			const View = Input.view;
			const Refs = RefsOf(View.schema);
			const Root = Resolve(View.schema, Refs);
			const Inherited =
				Root !== undefined && IsRecord(Root.meta) && Root.meta["volatile"] === true;
			const Derived = Root === undefined ? [] : Fields(Root, Refs, View, [], Inherited, 0);
			return {
				...Base,
				status: "ready",
				secret: Derived.some((Field) => Field.secret),
				revision: View.revision,
				fields: Derived,
			};
		}
	}
}
