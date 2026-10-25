// One package document from the npm registry, or null when the name has never
// been published.
//
// Three attempts with a linear backoff: the registry is a shared public
// service, and a transient 5xx or socket reset must not be read as "this
// package is missing" - only an explicit 404 returns null.
export default async (Name) => {
	const Url = `https://registry.npmjs.org/${encodeURIComponent(Name)}`;
	for (let Attempt = 0; Attempt < 3; Attempt += 1) {
		if (Attempt > 0) {
			await new Promise((Resolve) => {
				setTimeout(Resolve, 1000 * Attempt);
			});
		}
		try {
			const Response = await fetch(Url, {
				headers: { accept: "application/json" },
			});
			if (Response.status === 404) {
				return null;
			}
			if (!Response.ok) {
				throw new Error(`HTTP ${Response.status} for ${Name}`);
			}
			return await Response.json();
		} catch (Error) {
			if (Attempt === 2) {
				throw new Error(`Failed to fetch ${Name} from the registry`, {
					cause: Error,
				});
			}
		}
	}
	throw new Error(`Failed to fetch ${Name} from the registry`);
};
