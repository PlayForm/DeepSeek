// Families - one suggester domain's families, in priority order. A family
// lives in the pack under `<domain>/<id>`; the projection drops the other
// domains, sorts by priority (lower wins) and memoizes the list per pack
// object and domain, so the hot path allocates once per loaded pack.
import type Family from "../Interface/Family.js";
import type Pack from "../Interface/Pack.js";

const Cache = new WeakMap<Pack, Map<string, Family[]>>();

export default (Pack: Pack, Domain: string): Family[] => {
	let Domains = Cache.get(Pack);
	if (Domains === undefined) {
		Domains = new Map<string, Family[]>();
		Cache.set(Pack, Domains);
	}
	const Hit = Domains.get(Domain);
	if (Hit !== undefined) {
		return Hit;
	}
	const Prefix = `${Domain}/`;
	const List = Object.entries(Pack.families ?? {})
		.filter(([Key]) => Key.startsWith(Prefix))
		.map(([, Entry]) => Entry)
		.sort((Left, Right) => Left.priority - Right.priority);
	Domains.set(Domain, List);
	return List;
};
