// Every package document, fetched by a fixed pool of eight workers.
//
// The pool is the whole concurrency story: a shared counter queue is safe in
// one event loop, and eight sockets keep a hundred-package probe inside the
// registry's tolerance without hammering it.
import Document from "./Document.mjs";

export default async (Packages) => {
	const Documents = new Map();
	const Queue = [...Packages];
	await Promise.all(
		Array.from({ length: 8 }, async () => {
			while (Queue.length > 0) {
				const Package = Queue.shift();
				Documents.set(Package.Name, await Document(Package.Name));
			}
		}),
	);
	return Documents;
};
