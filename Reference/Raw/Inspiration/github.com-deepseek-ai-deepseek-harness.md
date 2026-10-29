[**1** Branch](https://github.com/deepseek-ai/deepseek-harness/branches)[](https://github.com/deepseek-ai/deepseek-harness/tags)
Go to file
Open more actions menu
Oct 27, 2026
[f3803c9](https://github.com/deepseek-ai/deepseek-harness/commit/f3803c96974ad4a94195fb97e5c637e9c2a3afe3) · Oct 27, 2026
[24,571 Commits](https://github.com/deepseek-ai/deepseek-harness/commits/master/)
Open commit details
24,571 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   | [docs: accuracy sweep, architecture restructure, two ADRs, review skill](https://github.com/deepseek-ai/deepseek-harness/commit/39b3db4b9cc3668cf4ce285f8d262978fe720efc "docs: accuracy sweep, architecture restructure, two ADRs, review skill

- AGENTS.md Commands: fix typecheck/build descriptions; add lint, lint:fix,
  test:coverage, knip, publint, hygiene \(were undocumented\).
- Drop the bare `yarn demo` for explicit `demo:echo` + `demo:coding`; update
  README, examples READMEs \(and document coding-agent in examples/README\).
- New cookbook guide: adding-a-vendored-package.md \(the missing "add" half of
  vendor/README's update-only procedure\).
- architecture.md: add a table-of-contents and extract the Extension cookbook
  to docs/cookbook/extension-cookbook.md \(link-preserving\); drop the completed
  "restructure this document" TODO.
- ADR 0009 \(capability seams\) + 0010 \(twin LLM adapters\), and a "when to write
  an ADR" standard in adr/README.
- Add a committed dsh-code-review skill under .agents/skills, exposed to Claude
  Code via a tracked .claude/skills symlink \(gitignore carve-out\).")  | Jun 13, 2026  |  
|   |   |  [fix(build): serialize release builds and give Client checks 8 GiB (](https://github.com/deepseek-ai/deepseek-harness/commit/7509c174d98396a932f20ca7a379556c86c43d0f "fix\(build\): serialize release builds and give Client checks 8 GiB \(#7435\)

* fix\(build\): serialize publication and raise client aggregate heap

* docs: refresh development guide translation pairing

* fix\(release\): align pack runner and allow explicit tag-check bypass")[#7435](https://github.com/deepseek-ai/deepseek-harness/discussions/7435)  | Oct 27, 2026  |  
| [release(dsh): 0.2.2-alpha.2](https://github.com/deepseek-ai/deepseek-harness/commit/00d541438b9beabb4d876a14371aea69f58c397a "release\(dsh\): 0.2.2-alpha.2")  | Oct 27, 2026  |  
|   |   |  [fix(client): stack mobile font-family settings (](https://github.com/deepseek-ai/deepseek-harness/commit/3b432c3f403ce1fe818b64fc9fd19d543a057add "fix\(client\): stack mobile font-family settings \(#7356\)

* fix\(client\): stack mobile font-family settings

* fix\(client\): cover font layout and touch sizing

* test\(bench\): interleave scaling samples")[#7356](https://github.com/deepseek-ai/deepseek-harness/discussions/7356)[)](https://github.com/deepseek-ai/deepseek-harness/commit/3b432c3f403ce1fe818b64fc9fd19d543a057add "fix\(client\): stack mobile font-family settings \(#7356\)

* fix\(client\): stack mobile font-family settings

* fix\(client\): cover font layout and touch sizing

* test\(bench\): interleave scaling samples")  | Oct 26, 2026  |  
|  [fix(build): serialize release builds and give Client checks 8 GiB (](https://github.com/deepseek-ai/deepseek-harness/commit/7509c174d98396a932f20ca7a379556c86c43d0f "fix\(build\): serialize release builds and give Client checks 8 GiB \(#7435\)

* fix\(build\): serialize publication and raise client aggregate heap

* docs: refresh development guide translation pairing

* fix\(release\): align pack runner and allow explicit tag-check bypass")[#7435](https://github.com/deepseek-ai/deepseek-harness/discussions/7435)  | Oct 27, 2026  |  
|   |   | [chore(deps): update source and build tools](https://github.com/deepseek-ai/deepseek-harness/commit/e99d38af9d8a8bf4dd7e108516ee5a0b7318e173 "chore\(deps\): update source and build tools")  | Oct 7, 2026  |  
|   |   | [release(dsh): 0.2.2-alpha.2](https://github.com/deepseek-ai/deepseek-harness/commit/00d541438b9beabb4d876a14371aea69f58c397a "release\(dsh\): 0.2.2-alpha.2")  | Oct 27, 2026  |  
|   |   | [fix(ui-primitives): end bare URLs before astral symbols and add Web s…](https://github.com/deepseek-ai/deepseek-harness/commit/ca40dc544e1734ea1da6984e4d06d75ed40d11d9 "fix\(ui-primitives\): end bare URLs before astral symbols and add Web snapshot")  | Oct 26, 2026  |  
|   |   |  [Merge pull request](https://github.com/deepseek-ai/deepseek-harness/commit/4fbe6e3f42960dc44456acf10dfea5dd4b16c369 "Merge pull request #6523 from deepseek-harness/feat/sdk-approval-rpc

SDK 支持将内部审批交由 stdio 客户端处理") [#6523](https://github.com/deepseek-ai/deepseek-harness/discussions/6523) [from deepseek-harness/feat/sdk-approval-rpc](https://github.com/deepseek-ai/deepseek-harness/commit/4fbe6e3f42960dc44456acf10dfea5dd4b16c369 "Merge pull request #6523 from deepseek-harness/feat/sdk-approval-rpc

SDK 支持将内部审批交由 stdio 客户端处理")  | Oct 21, 2026  |  
|   |   |  [fix(build): serialize release builds and give Client checks 8 GiB (](https://github.com/deepseek-ai/deepseek-harness/commit/7509c174d98396a932f20ca7a379556c86c43d0f "fix\(build\): serialize release builds and give Client checks 8 GiB \(#7435\)

* fix\(build\): serialize publication and raise client aggregate heap

* docs: refresh development guide translation pairing

* fix\(release\): align pack runner and allow explicit tag-check bypass")[#7435](https://github.com/deepseek-ai/deepseek-harness/discussions/7435)  | Oct 27, 2026  |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   | [release(vendor): cordis 4.0.6-alpha.1, cosmokit 1.8.7-alpha.1, group …](https://github.com/deepseek-ai/deepseek-harness/commit/656c740669f76a9135a6992aeb5c07282fc76418 "release\(vendor\): cordis 4.0.6-alpha.1, cosmokit 1.8.7-alpha.1, group 1.0.6-alpha.1, hmr 1.0.21-alpha.1, include 1.0.11-alpha.1, loader 1.0.7-alpha.1, logger-console 1.0.6-alpha.1, schemastery 3.18.6-alpha.1, timer 1.1.8-alpha.1")  | Oct 27, 2026  |  
|   |   | [Merge remote-tracking branch 'origin/master' into docs/long-table-filter](https://github.com/deepseek-ai/deepseek-harness/commit/bc0069450f6810b4ed248980ae62aa34d0282151 "Merge remote-tracking branch 'origin/master' into docs/long-table-filter")  | Oct 23, 2026  |  
|   |   | [Declare LF and final-newline conventions in .editorconfig](https://github.com/deepseek-ai/deepseek-harness/commit/4cbd722074f1883b9818dc31f235eb76663973f7 "Declare LF and final-newline conventions in .editorconfig

Pairs with .gitattributes: eol=lf pins what git produces at checkout;
.editorconfig pins what editors write to disk - the one CRLF vector
git's filters cannot reach \(git never rewrites the working tree, so an
editor-written CRLF file would persist with a clean status while the
doc gates misbehave on it\). insert_final_newline declares the existing
one-trailing-newline policy \(AGENTS.md, gated by git diff --check\) at
the editor layer too.

\(cherry picked from commit 7a09602fd76efff81a0875fb177289004c3dfc9b\)")  | Jul 15, 2026  |  
|   |   | [Merge master and reconcile desktop diagnostic records](https://github.com/deepseek-ai/deepseek-harness/commit/6cbbc8caa53727df516b924c58067add30234dfc "Merge master and reconcile desktop diagnostic records")  | Oct 26, 2026  |  
|   |   | [test(bench): add scaled machine and memory-pressure report](https://github.com/deepseek-ai/deepseek-harness/commit/12c33f6d0c8c83891cb90d5d6a166e09a52faa7f "test\(bench\): add scaled machine and memory-pressure report

Record budgeted benchmark endpoints and peak memory, and render a
self-contained interactive report that rescales measured times to
reviewed laptop and cloud profiles by single-thread CPU rating and
default-disk latency, and compares peaks with 4 GB and 8 GB of
available memory.")  | Oct 7, 2026  |  
|   |   | [feat(python): support macOS x64 runtime wheels](https://github.com/deepseek-ai/deepseek-harness/commit/7dcdcc2965802cf8d4fa2395c3b7c2da7417d227 "feat\(python\): support macOS x64 runtime wheels")  | Sep 3, 2026  |  
|   |   | [chore(lint): bring .tsx files into the eslint, lefthook, and jscpd lanes](https://github.com/deepseek-ai/deepseek-harness/commit/36e814114574102f6968108969ad179dc35bb0b8 "chore\(lint\): bring .tsx files into the eslint, lefthook, and jscpd lanes

.tsx sources and specs were invisible to every lint surface: the eslint
flat-config globs, the lefthook staged-file glob, and the jscpd clone
scan all matched *.ts only. Widen the five eslint file groups \(source,
test, client-test, sonar, formatting\), the pre-commit glob, and the
jscpd format/pattern to cover .tsx.

Existing .tsx files predate these lanes; follow-up commits on this PR
clear the backlog they surface.")  | Jul 27, 2026  |  
|   |   | [fix(experimental): close the mods bridge review findings](https://github.com/deepseek-ai/deepseek-harness/commit/233032b8f462fd689b5fe941306f3d1e9abf2f42 "fix\(experimental\): close the mods bridge review findings

- Disposal cancels detached runs before the engine waits for timer callbacks,
  so a callback parked in a $ call ends instead of blocking unload.
- A forgotten band wakes and ends its watch streams; a refresh asked for
  during a pass joins one more pass that settles after it; the Web band drops
  an ended stream so the next subscriber opens a fresh one.
- $ has Claude Code's namespaces: an unserved member rejects with
  'no implementation for <namespace>.<member>' instead of a TypeError.
- A .catch handler's next makes the rewrite check; a tool rename is refused
  like an argument rewrite; a null op answer is reported as no answer;
  defineMod returns its disposer from apply; the live turn record is copied
  before the chain freezes it; prompt.submit is raised only for batches with
  a human message and names the submitting mod as origin.
- $.http.fetch bounds the body while streaming; bandColumns/bandRows are
  Config; the client package drops its stale gateway edges; the source
  overlay lives in the package and anchors its entries to the file, and the
  dsh installation no longer depends on the experimental packages.")  | Oct 2, 2026  |  
|   |   | [refactor: make lint workflows Oxlint-only](https://github.com/deepseek-ai/deepseek-harness/commit/7016ad93deb203e28cc306f8e88e98bdd69215ff "refactor: make lint workflows Oxlint-only")  | Aug 9, 2026  |  
|   |   | [chore: exclude archived Agent Notes from rg](https://github.com/deepseek-ai/deepseek-harness/commit/e56c6234d2f4cdaa517f875fbddbc3b7c36181d3 "chore: exclude archived Agent Notes from rg")  | Aug 10, 2026  |  
|   |   | [docs: formalize sentence case for English UI copy](https://github.com/deepseek-ai/deepseek-harness/commit/472f0c8258fe8f3a2cb111b308be8a7cc13ee0a2 "docs: formalize sentence case for English UI copy

Record the sentence-case rule for English UI copy and plugin titles, sync remaining README label references, and keep the session-inspector Chinese dictionary unchanged.

Refs #6790

Co-authored-by: Magolor <25860372+Magolor@users.noreply.github.com>")  | Oct 21, 2026  |  
|   |   | [docs: make Web UI the primary onboarding path](https://github.com/deepseek-ai/deepseek-harness/commit/04fe477e7e632993c3b5ca132bf92718600d8a72 "docs: make Web UI the primary onboarding path")  | Aug 12, 2026  |  
| [BRAND_GUIDELINES.i18n.yaml](https://github.com/deepseek-ai/deepseek-harness/blob/master/BRAND_GUIDELINES.i18n.yaml "BRAND_GUIDELINES.i18n.yaml")  | [BRAND_GUIDELINES.i18n.yaml](https://github.com/deepseek-ai/deepseek-harness/blob/master/BRAND_GUIDELINES.i18n.yaml "BRAND_GUIDELINES.i18n.yaml")  |  [feat(i18n): key translation pairing records by heading section (](https://github.com/deepseek-ai/deepseek-harness/commit/e7def469e1390891cc45f78bea4063009abf6edd "feat\(i18n\): key translation pairing records by heading section \(#5036\)

* feat\(i18n\): key translation pairing records by heading section

Replace the whole-file blob hashes in *.i18n.yaml with one entry per
heading section that still holds language-specific content, keyed by the
English heading-slug path. Blocks identical across the pair \(generated
table rows, code blocks, shared regions\) stay out of the hash, so edits to
different sections and identical regenerations merge with Git's default
text merge, including on GitHub.

Remove the dsh-translation-pairing merge driver, its resolver command and
installer wiring; gen-translation-brief recovers last-confirmed text from
commit history. Migrate all active records, archive the superseded Agent
Note, and record the replayed conflict reduction in the new one.

* test\(i18n\): refresh translation prompt snapshot for the terminology note

* feat\(i18n\): exclude only code blocks and generated regions from pairing records

Replace byte-equality masking with an explicit rule: a record hash skips
fenced code blocks and BEGIN/END GENERATED regions, the two kinds of
content the pairing gate already requires to be identical on both sides.

Move generated data into regions written into both pages:
gen-config-catalog renders both languages and the record with per-package
regions labelled by code identifiers; gen-module-graph keeps its table in a
region; gen-doc-graphs splices the event matrix regions into the Chinese
page. Add a generic region splice beside the region grammar.")[#5036](https://github.com/deepseek-ai/deepseek-harness/discussions/5036)[)](https://github.com/deepseek-ai/deepseek-harness/commit/e7def469e1390891cc45f78bea4063009abf6edd "feat\(i18n\): key translation pairing records by heading section \(#5036\)

* feat\(i18n\): key translation pairing records by heading section

Replace the whole-file blob hashes in *.i18n.yaml with one entry per
heading section that still holds language-specific content, keyed by the
English heading-slug path. Blocks identical across the pair \(generated
table rows, code blocks, shared regions\) stay out of the hash, so edits to
different sections and identical regenerations merge with Git's default
text merge, including on GitHub.

Remove the dsh-translation-pairing merge driver, its resolver command and
installer wiring; gen-translation-brief recovers last-confirmed text from
commit history. Migrate all active records, archive the superseded Agent
Note, and record the replayed conflict reduction in the new one.

* test\(i18n\): refresh translation prompt snapshot for the terminology note

* feat\(i18n\): exclude only code blocks and generated regions from pairing records

Replace byte-equality masking with an explicit rule: a record hash skips
fenced code blocks and BEGIN/END GENERATED regions, the two kinds of
content the pairing gate already requires to be identical on both sides.

Move generated data into regions written into both pages:
gen-config-catalog renders both languages and the record with per-package
regions labelled by code identifiers; gen-module-graph keeps its table in a
region; gen-doc-graphs splices the event matrix regions into the Chinese
page. Add a generic region splice beside the region grammar.")  | Sep 23, 2026  |  
|   |   | [docs: split brand guidelines into bilingual pair](https://github.com/deepseek-ai/deepseek-harness/commit/89b0f17f8402db372f24a97a7029d1b517fb0dd5 "docs: split brand guidelines into bilingual pair")  | Aug 19, 2026  |  
|   |   | [docs: split brand guidelines into bilingual pair](https://github.com/deepseek-ai/deepseek-harness/commit/89b0f17f8402db372f24a97a7029d1b517fb0dd5 "docs: split brand guidelines into bilingual pair")  | Aug 19, 2026  |  
|   |   | [Initialize repo with README, AGENTS.md, and CLAUDE.md symlink](https://github.com/deepseek-ai/deepseek-harness/commit/b67e81ac97647270b3002d78532baf3a5b68cbc3 "Initialize repo with README, AGENTS.md, and CLAUDE.md symlink")  | Jun 10, 2026  |  
|   |   |  [feat(i18n): key translation pairing records by heading section (](https://github.com/deepseek-ai/deepseek-harness/commit/e7def469e1390891cc45f78bea4063009abf6edd "feat\(i18n\): key translation pairing records by heading section \(#5036\)

* feat\(i18n\): key translation pairing records by heading section

Replace the whole-file blob hashes in *.i18n.yaml with one entry per
heading section that still holds language-specific content, keyed by the
English heading-slug path. Blocks identical across the pair \(generated
table rows, code blocks, shared regions\) stay out of the hash, so edits to
different sections and identical regenerations merge with Git's default
text merge, including on GitHub.

Remove the dsh-translation-pairing merge driver, its resolver command and
installer wiring; gen-translation-brief recovers last-confirmed text from
commit history. Migrate all active records, archive the superseded Agent
Note, and record the replayed conflict reduction in the new one.

* test\(i18n\): refresh translation prompt snapshot for the terminology note

* feat\(i18n\): exclude only code blocks and generated regions from pairing records

Replace byte-equality masking with an explicit rule: a record hash skips
fenced code blocks and BEGIN/END GENERATED regions, the two kinds of
content the pairing gate already requires to be identical on both sides.

Move generated data into regions written into both pages:
gen-config-catalog renders both languages and the record with per-package
regions labelled by code identifiers; gen-module-graph keeps its table in a
region; gen-doc-graphs splices the event matrix regions into the Chinese
page. Add a generic region splice beside the region grammar.")[#5036](https://github.com/deepseek-ai/deepseek-harness/discussions/5036)[)](https://github.com/deepseek-ai/deepseek-harness/commit/e7def469e1390891cc45f78bea4063009abf6edd "feat\(i18n\): key translation pairing records by heading section \(#5036\)

* feat\(i18n\): key translation pairing records by heading section

Replace the whole-file blob hashes in *.i18n.yaml with one entry per
heading section that still holds language-specific content, keyed by the
English heading-slug path. Blocks identical across the pair \(generated
table rows, code blocks, shared regions\) stay out of the hash, so edits to
different sections and identical regenerations merge with Git's default
text merge, including on GitHub.

Remove the dsh-translation-pairing merge driver, its resolver command and
installer wiring; gen-translation-brief recovers last-confirmed text from
commit history. Migrate all active records, archive the superseded Agent
Note, and record the replayed conflict reduction in the new one.

* test\(i18n\): refresh translation prompt snapshot for the terminology note

* feat\(i18n\): exclude only code blocks and generated regions from pairing records

Replace byte-equality masking with an explicit rule: a record hash skips
fenced code blocks and BEGIN/END GENERATED regions, the two kinds of
content the pairing gate already requires to be identical on both sides.

Move generated data into regions written into both pages:
gen-config-catalog renders both languages and the record with per-package
regions labelled by code identifiers; gen-module-graph keeps its table in a
region; gen-doc-graphs splices the event matrix regions into the Chinese
page. Add a generic region splice beside the region grammar.")  | Sep 23, 2026  |  
|   |   | [docs(i18n): refine contribution guide wording](https://github.com/deepseek-ai/deepseek-harness/commit/964b1dde520c98ede62182ebd3530870dea41f11 "docs\(i18n\): refine contribution guide wording")  | Aug 12, 2026  |  
|   |   | [docs(i18n): polish contribution greeting](https://github.com/deepseek-ai/deepseek-harness/commit/7e87e7b1adad936ec773bdc46e06cda978b9ef08 "docs\(i18n\): polish contribution greeting")  | Aug 12, 2026  |  
|   |   | [Adopt MIT for DSH packages](https://github.com/deepseek-ai/deepseek-harness/commit/c905c4694e317eff1f529f0fed047c2ce202d11a "Adopt MIT for DSH packages")  | Aug 13, 2026  |  
|   |   | [chore(build): limit PR to the make clean shortcut](https://github.com/deepseek-ai/deepseek-harness/commit/d3454a1aa3568b35e0d4904736128f1fec611813 "chore\(build\): limit PR to the make clean shortcut")  | Oct 9, 2026  |  
|   |   |  [docs: simplify Chinese README community signup (](https://github.com/deepseek-ai/deepseek-harness/commit/f84703543ca4be99d8ac19b52301c9899a8dc85b "docs: simplify Chinese README community signup \(#5311\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")[#5311](https://github.com/deepseek-ai/deepseek-harness/discussions/5311)[)](https://github.com/deepseek-ai/deepseek-harness/commit/f84703543ca4be99d8ac19b52301c9899a8dc85b "docs: simplify Chinese README community signup \(#5311\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")  | Sep 29, 2026  |  
|   |   |  [docs: fix expired Discord invite (](https://github.com/deepseek-ai/deepseek-harness/commit/31ba15da2b7c07408caaa31e30b755acc297234f "docs: fix expired Discord invite \(#5433\) \(#5437\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")[#5433](https://github.com/deepseek-ai/deepseek-harness/discussions/5433)[) (](https://github.com/deepseek-ai/deepseek-harness/commit/31ba15da2b7c07408caaa31e30b755acc297234f "docs: fix expired Discord invite \(#5433\) \(#5437\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")[#5437](https://github.com/deepseek-ai/deepseek-harness/discussions/5437)[)](https://github.com/deepseek-ai/deepseek-harness/commit/31ba15da2b7c07408caaa31e30b755acc297234f "docs: fix expired Discord invite \(#5433\) \(#5437\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")  | Sep 29, 2026  |  
|   |   |  [docs: simplify Chinese README community signup (](https://github.com/deepseek-ai/deepseek-harness/commit/f84703543ca4be99d8ac19b52301c9899a8dc85b "docs: simplify Chinese README community signup \(#5311\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")[#5311](https://github.com/deepseek-ai/deepseek-harness/discussions/5311)[)](https://github.com/deepseek-ai/deepseek-harness/commit/f84703543ca4be99d8ac19b52301c9899a8dc85b "docs: simplify Chinese README community signup \(#5311\)

Co-authored-by: ag <ag@agdeMacBook-Pro.local>")  | Sep 29, 2026  |  
|   |   |  [feat(i18n): key translation pairing records by heading section (](https://github.com/deepseek-ai/deepseek-harness/commit/e7def469e1390891cc45f78bea4063009abf6edd "feat\(i18n\): key translation pairing records by heading section \(#5036\)

* feat\(i18n\): key translation pairing records by heading section

Replace the whole-file blob hashes in *.i18n.yaml with one entry per
heading section that still holds language-specific content, keyed by the
English heading-slug path. Blocks identical across the pair \(generated
table rows, code blocks, shared regions\) stay out of the hash, so edits to
different sections and identical regenerations merge with Git's default
text merge, including on GitHub.

Remove the dsh-translation-pairing merge driver, its resolver command and
installer wiring; gen-translation-brief recovers last-confirmed text from
commit history. Migrate all active records, archive the superseded Agent
Note, and record the replayed conflict reduction in the new one.

* test\(i18n\): refresh translation prompt snapshot for the terminology note

* feat\(i18n\): exclude only code blocks and generated regions from pairing records

Replace byte-equality masking with an explicit rule: a record hash skips
fenced code blocks and BEGIN/END GENERATED regions, the two kinds of
content the pairing gate already requires to be identical on both sides.

Move generated data into regions written into both pages:
gen-config-catalog renders both languages and the record with per-package
regions labelled by code identifiers; gen-module-graph keeps its table in a
region; gen-doc-graphs splices the event matrix regions into the Chinese
page. Add a generic region splice beside the region grammar.")[#5036](https://github.com/deepseek-ai/deepseek-harness/discussions/5036)[)](https://github.com/deepseek-ai/deepseek-harness/commit/e7def469e1390891cc45f78bea4063009abf6edd "feat\(i18n\): key translation pairing records by heading section \(#5036\)

* feat\(i18n\): key translation pairing records by heading section

Replace the whole-file blob hashes in *.i18n.yaml with one entry per
heading section that still holds language-specific content, keyed by the
English heading-slug path. Blocks identical across the pair \(generated
table rows, code blocks, shared regions\) stay out of the hash, so edits to
different sections and identical regenerations merge with Git's default
text merge, including on GitHub.

Remove the dsh-translation-pairing merge driver, its resolver command and
installer wiring; gen-translation-brief recovers last-confirmed text from
commit history. Migrate all active records, archive the superseded Agent
Note, and record the replayed conflict reduction in the new one.

* test\(i18n\): refresh translation prompt snapshot for the terminology note

* feat\(i18n\): exclude only code blocks and generated regions from pairing records

Replace byte-equality masking with an explicit rule: a record hash skips
fenced code blocks and BEGIN/END GENERATED regions, the two kinds of
content the pairing gate already requires to be identical on both sides.

Move generated data into regions written into both pages:
gen-config-catalog renders both languages and the record with per-package
regions labelled by code identifiers; gen-module-graph keeps its table in a
region; gen-doc-graphs splices the event matrix regions into the Chinese
page. Add a generic region splice beside the region grammar.")  | Sep 23, 2026  |  
|   |   |  [Merge pull request](https://github.com/deepseek-ai/deepseek-harness/commit/cc8ea70dc033b9fe449aa7a0fbe2755ba924644d "Merge pull request #2560 from deepseek-harness/codex/add-security-policy

docs: add bilingual experimental safety notice") [#2560](https://github.com/deepseek-ai/deepseek-harness/discussions/2560) [from deepseek-harness/codex/add-security-policy](https://github.com/deepseek-ai/deepseek-harness/commit/cc8ea70dc033b9fe449aa7a0fbe2755ba924644d "Merge pull request #2560 from deepseek-harness/codex/add-security-policy

docs: add bilingual experimental safety notice")  | Aug 23, 2026  |  
|   |   |  [Merge pull request](https://github.com/deepseek-ai/deepseek-harness/commit/cc8ea70dc033b9fe449aa7a0fbe2755ba924644d "Merge pull request #2560 from deepseek-harness/codex/add-security-policy

docs: add bilingual experimental safety notice") [#2560](https://github.com/deepseek-ai/deepseek-harness/discussions/2560) [from deepseek-harness/codex/add-security-policy](https://github.com/deepseek-ai/deepseek-harness/commit/cc8ea70dc033b9fe449aa7a0fbe2755ba924644d "Merge pull request #2560 from deepseek-harness/codex/add-security-policy

docs: add bilingual experimental safety notice")  | Aug 23, 2026  |  
|   |   |  [Merge pull request](https://github.com/deepseek-ai/deepseek-harness/commit/9dd1ecc1f463baf1620c984f054f2ab6c52a5cbb "Merge pull request #5961 from deepseek-harness/worktree/forge-pr-worktree-panel

feat\(forge\): add the pull request panel and worktree Sessions") [#5961](https://github.com/deepseek-ai/deepseek-harness/discussions/5961) [from deepseek-harness/worktree/forge-pr-work…](https://github.com/deepseek-ai/deepseek-harness/commit/9dd1ecc1f463baf1620c984f054f2ab6c52a5cbb "Merge pull request #5961 from deepseek-harness/worktree/forge-pr-worktree-panel

feat\(forge\): add the pull request panel and worktree Sessions")  | Oct 26, 2026  |  
|   |   |   | Oct 14, 2026  |  
|   |   | [release(dsh): 0.2.2-alpha.2](https://github.com/deepseek-ai/deepseek-harness/commit/00d541438b9beabb4d876a14371aea69f58c397a "release\(dsh\): 0.2.2-alpha.2")  | Oct 27, 2026  |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   | [fix(ui-primitives): end bare URLs before CJK punctuation](https://github.com/deepseek-ai/deepseek-harness/commit/bdfc0c1d12baf4d7aee85d976e7d234f567cd672 "fix\(ui-primitives\): end bare URLs before CJK punctuation")  | Oct 26, 2026  |  
|   |   | [Merge remote-tracking branch 'origin/master' into codex/trim-ai-prose](https://github.com/deepseek-ai/deepseek-harness/commit/972e7cc77d582f822dbb42056c05d9a47ab85086 "Merge remote-tracking branch 'origin/master' into codex/trim-ai-prose

# Conflicts:
#	docs/config-catalog.md
#	docs/event-producer-consumer.md
#	docs/rfc/implemented/feature/2026-07-05-dynamic-workflows.md
#	examples/acp-agent/tests/acp.snapshot.ts
#	packages/code-runtime/code-runtime-worker/tests/built-lib.e2e.ts
#	packages/code-runtime/code-runtime-worker/tsdown.config.ts")  | Jul 13, 2026  |  
| [tsconfig.base.client.json](https://github.com/deepseek-ai/deepseek-harness/blob/master/tsconfig.base.client.json "tsconfig.base.client.json")  | [tsconfig.base.client.json](https://github.com/deepseek-ai/deepseek-harness/blob/master/tsconfig.base.client.json "tsconfig.base.client.json")  | [feat(client): serve plugin package assets by URL instead of data URLs](https://github.com/deepseek-ai/deepseek-harness/commit/ce84953e462aed211e4fcd7bc18a367f1d2da9c7 "feat\(client\): serve plugin package assets by URL instead of data URLs")  | Oct 19, 2026  |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   | [refactor(repo): retire top-level examples](https://github.com/deepseek-ai/deepseek-harness/commit/4125514a08819514255717514a233aba9e0ffd2e "refactor\(repo\): retire top-level examples")  | Aug 24, 2026  |  
|   |   | [Build shared Client bundles independently for Node and browser](https://github.com/deepseek-ai/deepseek-harness/commit/e137ebaaa1a4574df80887aafb4b83434c284c6f "Build shared Client bundles independently for Node and browser")  | Oct 14, 2026  |  
|   |   | [Generate source metadata before package compilation](https://github.com/deepseek-ai/deepseek-harness/commit/9b310b2b4b16fa77da8b1e744125dcb9821bfe9a "Generate source metadata before package compilation")  | Oct 18, 2026  |  
|   |   |  [Merge pull request](https://github.com/deepseek-ai/deepseek-harness/commit/b9266aefd669e81eef2047a91db6ad434c019dff "Merge pull request #7094 from deepseek-harness/worktree/ci-schedule

ci: cut PR check latency across the slow lanes") [#7094](https://github.com/deepseek-ai/deepseek-harness/discussions/7094) [from deepseek-harness/worktree/ci-schedule](https://github.com/deepseek-ai/deepseek-harness/commit/b9266aefd669e81eef2047a91db6ad434c019dff "Merge pull request #7094 from deepseek-harness/worktree/ci-schedule

ci: cut PR check latency across the slow lanes")  | Oct 24, 2026  |  
|   |   |  [feat(liveshare): add the host, viewer, and client share surfaces (](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")[#6749](https://github.com/deepseek-ai/deepseek-harness/discussions/6749)[)](https://github.com/deepseek-ai/deepseek-harness/commit/635d9c88f6abd6c0c36861abee7cd6c1aa8bd7f5 "feat\(liveshare\): add the host, viewer, and client share surfaces \(#6749\)

* feat\(liveshare\): add the owner host, viewer host, and share runtime

The owner-side half of the bundle: the share host that publishes a Session to a Relay and answers one viewer per share, the owner credential/authorization records, the fork registry and its enforcement, the read-only viewer access policy and read budgets, the turn-requester fold, and the Relay gateway worker. The viewer host renders the served page's assets and declarations; no browser code is included in this layer.

* test\(liveshare\): cover the owner host, viewer host, and gateway

Keyless host-side coverage: share publication and restore, owner login/authority, fork registry and enforcement, viewer read policy and budgets, the turn-requester fold, the Relay tunnel worker and gateway commands, and the served viewer page. The browser surfaces are covered by the client layer's own suite.

* chore\(build\): register the host bundle in the compiler, dependency policy, and CI

The package manifest, Host compiler face, and tsdown host entries the bundle needs; the workspace constraints the built gateway/declaration artifacts require; the release-family and README model-experience rows; the coverage-lane exemption; and the keyless CI job that runs the share cases on Linux. The dependency-policy classifications wait for the client layer, which is where the package's client face \(and its imports\) first appears.

* docs\(liveshare\): record the bundle's subsystem, projection, and decision rationale

The package README for the host layer, the subsystem page, the persistence record that declares the viewer principal projection, and the note that keeps the protocol and owner-surface decisions with their evidence.

* feat\(boot\): offer the Liveshare host bundle in the CLI profile and plugin manager

The bundle joins the optional bundles the CLI installation carries and the Official group the plugin manager lists, so an owner can switch it on without editing a profile by hand. The plugin-manager and plugin-config expectations follow in the client layer that renders the card's browser half.

* chore\(docs\): regenerate the graphs, catalogs, and persistence records for the host

Run the generators over the host layer: the event producer/consumer graphs, the persistence catalog and schema inventory, the config catalog, the module graph, and the Cordis API catalog. The persisted viewer-principal event appears in the catalog and the historical format index counts it.

* fix\(liveshare\): keep the bundle's locale display metadata in this layer

The CLI profile registers the bundle as optional, so the plugin manager reads title and description from ./locale/*.json. Ship the two locale files and their export here; the browser half is not needed for display metadata.

* refactor\(liveshare\): read the turn boundary through the typed Agents service

The retained projection-handle migration left two assertions converted through unknown; ctx.get\('agents'\) already exposes turnBoundaryOf, so the host and the cancel-admission case call it directly and the unknown-cast baseline stays untouched.

* test\(liveshare\): expect the canonical viewer tier from the three-mode harness

The Relay reports a share published with the withdrawn fork-readonly tier as view and carries the fork grant separately, so the harness compares the canonical tier and forwards an explicit allowsFork when the case names one.

* refactor\(liveshare\): share the reader-facing record and body readers

The fork decision and the access snapshot built the same share facts twice, and the two share-writing routes read the same share-naming JSON body twice; both pairs are now one helper each, so jscpd no longer reports them. Behavior is unchanged.

* test\(web\): record the host layer's optional-bundle expectations

Registering the LiveShare bundle in the Official group adds its card and description to the plugin manager and plugin-config pages, and the packed preview must state that its host plugin needs LIVESHARE_RELAY_URL instead of a generic applied toggle. Refresh the affected goldens locally \(keyless web snapshot refresh\) and keep the card badge at this layer: the client list that labels it experimental arrives with the client layer.

* docs\(liveshare\): mark the shipping owner policy note implemented

The protocol-and-owner-surfaces decision shipped with this bundle, so the note moves from proposed/ to implemented/ in both languages, its proposal-era headings become Decision/Verification/Consequences, and the subsystem page plus package README link to the new path. The pairing record moves with the triplet.

* fix\(liveshare\): judge tool turns from the open Session turn and recheck the narrowed write

The master baseline has no ToolExecutionInput.turn, so the host derives the turn a tool execution serves from the Agent's Session: the latest turn/start with no turn/end after it. A missing Agent, Session, or open turn yields no turn and the fork guard refuses the execution \(fail-closed\) instead of reading it as the owner's. Also refuse a fork that names a child without a bound rpcId/operationId, classify forwarded paths by their normalized pathname so /api/session/./fork or a query suffix cannot skip the fork decision, and ask the write gate again after the final authorization refresh so a share narrowed to view during fs/write-intent cannot write. The subsystem page, package README, and model-experience census follow the two-tier model and the bounded-write child ceiling.

* refactor\(liveshare\): read the open turn beside the requester fold

The derivation reads the same Session log the requester fold decides, so it
lives with that fold and the host imports it instead of keeping a private copy.

* test\(liveshare\): cover the derived turn and the refusal paths

Drive the host's real derivation from Session events: the open turn of the
Agent's Session decides a viewer turn is confined and an owner turn is not,
while a missing Agent, an absent open turn, and a requester the host no longer
drives all refuse instead of being read as the owner's. Cover the three safety
behaviours the host commit added: fork child naming without a bound request
identity, dot-segment/query fork paths that must still reach the fork decision,
and a share narrowed to view while fs/write-intent awaits.

* fix\(liveshare\): avoid the deprecated snapshot reader and the extra casts

The host derived the open turn by scanning the Session event log, which the
deprecation note forbids for new production calls. Read the same state from the
turnBoundary projection the Agents service maintains instead, and let a spec
supply a fixture boundary reader where production supplies turnBoundaryOf.
The live attribution of an execution is unchanged: an absent boundary or one
between turns still yields no turn and the guard refuses it fail-closed.

* docs\(liveshare\): describe the bundle's indirect model experience

The bundle's Model Experience moved to the audited indirect classification,
so the README sentence now names the path: viewer prompts the owner host
forwards into a shared Session drive that Session's model requests. The
KV-cache paragraph and the bilingual pairing record follow.

* test\(liveshare\): pin the turn-start admission for steered and admitted reader input

The pre-step admission already re-reads Relay authority from each entering message's own source and refuses queued reader input whose grant ended before the model runs; the new cases pin the steer path and the admitted viewer turn, so the turn-start half stays proven next to the delivery-time recheck the Session Controller owns.

* test\(liveshare\): adapt the replay and cancel expectations to the parsed tier

* test\(liveshare\): align the access-state expectations with protocol v2

The parsed share-access-state frame always carries allowsFileUpload, the
withdrawn fork-readonly word no longer implies a view tier or forking, and a
hand-built frame may not name it. Update the hand-built expectations and the
two fixture specs that named the retired word, without touching production
semantics.

* test\(liveshare\): record the in-flight cancel race after the controller revert

The Session Controller no longer re-reads a caller's access before cancelling,
so a cancel admitted before the reader's grant ends keeps its effect. State that
as the known limitation the earlier refusal tests documented instead.

* feat\(liveshare\): add the viewer attachment-upload switch

The share record, registration handshake, access-state replay, and share-viewer
policy carry an owner switch that is off by default: it admits fileUploads/upload
on the shared Session and the viewer's own forks, is independent of the tier and
of forking, and is normalized to off at every untrusted state-file or frame
boundary.

* docs\(liveshare\): state the sandbox tiers and the attachment switch

Name the two execution tiers as a read-only sandbox and a bounded writable
sandbox, and document the independent default-off switch that lets admitted
viewers upload attachments, including that legacy shares read as off.

* refactor\(liveshare\): drop the withdrawn fork-readonly migration

The feature never shipped, so no stored record can name the withdrawn tier and
the boundary needs no compatibility path. Read a stored fork switch as exactly
what it states, let an old Relay state the switch explicitly instead of
inferring it from the tier, and stop accepting the retired mode name on create
or restore.

* fix\(liveshare\): preflight a resumed child's limit before publishing it

A resumed child is announced through agent/created before its execution limit
installs, so an installability failure left a created Session whose guard never
landed. Resolve the recorded child's granted workspace before activation and
refuse the resume there, so a child this host cannot confine is never published.

* refactor\(liveshare\): render the viewer page through the reader's own Peer

The served-page seam now hands the frontend reader the reader's Peer, which renders that page's own
opening access rows; the Liveshare side no longer assembles a global access snapshot and the removed
global is gone. The viewer read service builds the same Peer it already creates for every dispatch and
passes it to the asset reader.

* fix\(liveshare\): keep the owner upload switch across an older Relay's access frame

The Relay is the authority for what a viewer receives, but only for the fields its frame states. An
older Relay predates the upload switch and omits it entirely; the protocol parser rightly normalizes a
missing switch to off for frames that state it, so the host must inspect the raw answer to tell not

* test\(liveshare\): adapt the host specs to the current tool and session APIs

The host specs drove a single tool through the pre-batch executor shape and handed
some tests a Session outside its store; the current tool executor takes a call batch
and Session appends require the owning SessionStore. This adapts those fixtures to
the current shapes without changing what each test asserts.

Also gives the reader's own fork the same Session permissions as the source grant:
forking its own child again and renaming it are allowed on the child only, while the
source Session still refuses renaming and keeps forking as its one Session verb.

* fix\(liveshare\): let the owner's background turns run while a share is served

The requester fold only counts a message with `source.kind === 'user'`, so a
turn a background event opened has no attributable input and stayed `unknown`;
the source-session tool guard refused every tool in that turn. Establish the
owner's own turn for an input-less turn and leave unattributable input unknown.

* fix\(liveshare\): grant the reader its own fork's rename and gate child forks by the fork switch

* refactor\(liveshare\): read the served page through webServer.readResource

* feat\(boot\): offer the Liveshare host bundle from the official bundle list

`@deepseek-ai/dsh-official-bundles` owns the shipped template, retired, and
optional bundle lists now, so the liveshare bundle joins `OPTIONAL_BUNDLES`
there instead of being restated in the app-boot profile module.

* feat\(liveshare\): gate the reader's own fork independently of its input permissions

The reader's child gets prompt, cancel, and rename from a role with no extra
condition, while forking the shared Session or one of the reader's own forks
belongs to a separate role bound to the owner's fork switch. A viewer cannot
rename the shared Session, and a withdrawn fork switch also withdraws forking
a child.

* test\(liveshare\): adapt the admission specs to the current tool and driver APIs

* feat\(liveshare\): accept only the declarations a plugin's own package owns

A viewer plugin may contribute endpoints a share can offer, so a declaration
has to name a live Host Remote endpoint whose generated id belongs to the
declaring package. Fail closed: no loader entry, no local endpoint, no owning
package, or a foreign owner all refuse the declaration, and the recorded
attribution is the package name the owner sees.

The package's Typert artifact registers after its apply runs, so a plugin
declares once that registration has happened.

* feat\(liveshare\): classify every Remote endpoint before the reader policy decides it

The share-viewer policy refuses by default, so the endpoints it decides were a
handwritten whitelist that could drift from the generated endpoint set. State
every endpoint's reason in one shared table: the Client face proves it covers
`RemoteEndpoint` \(both directions\), the Host derives `POLICY_DECIDED_ACTIONS`
from the reader entries, and a load-time assertion fails if the derived set and
the roles' actions disagree.

* fix\(liveshare\): declare the Client face its classification gate compiles in

Typert attributes a package's exports to a face only for manifests declaring
`dsh.client` plus a `./client` subpath \(`isDualFacePackage`\). Without that row
the client catalog read `exports\["."\]` — the Host entry — from the Client
program, which holds only the classification table and its completeness gate,
and failed on the source that program does not contain.

Export the gate module as `./client`, declare the Client row, publish its
bundle, and exempt the package from Client/Host dependency treatment: the
runtime importing these dependencies is the Host's, and `dsh.client` here only
attributes the compilation face.

* test\(liveshare\): align worker fixtures with the protocol tenant contract

The protocol layer rejects a share RPC actor whose tenant is empty at the IPC ingress. The worker fixtures still described a peer normalizing the tenant to an empty string, so the Host dropped every fabricated request event and the lifecycle and correlation polls timed out. Use a concrete tenant in the fixtures; those scenarios do not depend on an empty tenant.

* chore\(docs\): count the liveshare persistence nodes in the format index

The regenerated current-checkout catalog adds the liveshare viewer-principal nodes, so the v4 row's node count moves from 622 to 626. Refresh the generated format index rather than keeping the pre-liveshare count.

* refactor\(liveshare\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry, so the Host face reads the wire codecs, identity contract, and viewer-state vocabulary from the package root instead of the removed /protocol and /identity subpaths.

* fix\(liveshare\): classify the schedule cleanup endpoint before the Client gate reads it

The Client completeness gate compiles against the generated Remote endpoint map; master added schedule/deleteInactive after the table was last filled. It mutates the owner's schedules like its neighbours, so it stays owner-only.

* chore\(release\): carry the liveshare package to the rc.3 family version

* docs\(liveshare\): align the host docs with the shipped two-tier shares

The subsystem page still described a withdrawn fork-readonly compatibility, a
write-only source drive, and an immutable execution.turn. State the two tiers,
the independent fork and upload switches, the refused unknown mode, and the
turn derived from the Session boundary. Mirror the Chinese pages and re-record
the pairing hashes.

* fix\(liveshare\): describe the writable tier in the plugin card

The package description, both locale descriptions, and the three Web goldens
still told the owner that sharing is read-only. State driving, bounded writes,
forking, and the independent upload switch instead.

* chore\(liveshare\): forward the owner credential file from the bundle patch

The README lists LIVESHARE_OWNER_CREDENTIAL_FILE beside the other owner
settings, but the patch left it to a direct process.env read. Pass it through
the same config field as its siblings.

* docs\(liveshare\): drop stale fork module comments

The registry header still said read-only forks only, and both the registry
and the policy carried an orphan JSDoc block in front of the real one.

* refactor\(liveshare\): drop unreachable fork tool effect fields

ForkToolRequest.writesWorkspace and changesConfiguration had no producer in
the repository: the guard never sets them, and the only callers were the
tests. The write-denying branch also contradicted WRITE_FORK_CEILING, which
admits the bounded write tool. Remove the fields, their refusal codes, and
the test cases that manufactured them.

* refactor\(liveshare-protocol\): retire the attachment-upload capability

Sharing itself now carries attachment upload, so the protocol no longer
states an independent switch: `LIVESHARE_CAPABILITIES` drops
`file-upload`, and share specs and access-state frames drop
`allowsFileUpload`. Wire frames stay v1 and no Relay is deployed, so no
compatibility layer is needed.

* refactor\(liveshare\): grant attachment upload with visibility

The owner controls sharing, audience, the tier, and forking only.
`fileUploads/upload` now rides the Session read role, so every Session a
share serves the viewer accepts files, independent of the tier and the
fork switch. The owner record, the share APIs, the registration handshake,
and access-state adoption no longer carry an upload switch; an older owner
state file that still contains the field loads with it ignored.

Accepted risk, recorded in Known Limitations: an owner cannot refuse
uploads for an admitted viewer.

* feat\(liveshare\): share the owner wire records

Move the owner identity report into a module both compiler faces can import, and
declare the share-management request, result, audit, and capability records there
with the same fields the same-origin routes already answer. The Remote failure
vocabulary joins the same module so a client learns the liveshareShares/ codes
without importing the Host.

* refactor\(liveshare\): extract the owner share operations

Move the twelve share-management handler bodies out of the route closures into
operations implemented once inside apply\(\), leaving each HTTP route with its JSON
parsing, normalization, and legacy status/body. Each operation documents the
side-effect order it keeps and what reordering would break.

* feat\(liveshare\): serve share management over Typert Remote

Register a LiveshareShares Remote service over the same operations the routes
call, publish its ./typert and ./remote artifacts plus the shared ./types module,
and make the shared records part of the Client compiler face. The owner page gains
the Remote endpoints while the HTTP routes stay as thin adapters.

* chore\(docs\): regenerate the Cordis catalog for share management

Record the liveshareShares service on the LiveShare subsystem page, link its
wire records to that page, and regenerate the runtime API catalog. The service
declaration moves to the package entry so the host-face catalog projection can
render it.

* test\(liveshare\): refuse share management to viewer Peers over Remote

Cover the owner Peer's Remote list and the share-viewer denial of list, create,
stop, and setRelay. The refused calls leave the share list empty, the selected
Relay unchanged, and the worker channel without an add-share.

* chore\(liveshare\): mark the typert resource follow-ups behind #7003

The share-management Remote ships against today's resource registration. Default
resource resolvers and the stricter identity rules arrive with #7003, so the two
places that will change carry a TODO naming the PR.

* fix\(docs\): classify the liveshareShares service role

The share-management Remote adds one owner-side service, so the capability
seams graph owed it a role row; without the classification the generator
refuses to render and doc-sync fails.

* fix\(liveshare\): complete the bundle metadata and restore the static gates

The bundle shipped only two of the eight shipped-language metadata files, and its
browser face had no named tsdown config, so the locale metadata gate and the
browser bundle walk both failed. Ship the full locale set and name the client
build; share one owner-body registrar between the two POST adapters so jscpd
stops reporting an eight-line clone.

* fix\(liveshare\): give the bundle a client source route and a typed peer double

The product-use walk follows `${name}/client` for every mounted bundle, so the
package needs the source mapping and a Client entry the mapping resolves to.
Replace the unknown-cast peer double with a complete PeerScope literal.

* test\(liveshare\): adapt the viewer admission rows to the Session default resolver

#7003 replaced the `session/page` and `session/follow` resource readers with the
Session kind's default resolver. A body carrying both `sessionId` and `address`
is now refused as invalid resources before the share policy reads either, while
a lone hidden `sessionId` still resolves and is refused by the policy.

Records the new expectations; the served page names one identity per request.

* feat\(liveshare\): resolve create's request Session through the default resolver

#7003 registers the `session` kind's default resolver with the Session
Controller, and `liveshareShares/create` names its Session in the one request
object, so the Gateway resolves that Session for a non-owner Peer without a
reader declared on the method. The owner Peer reaches the operation without
an access decision.

Adds the Gateway resource assertion and the owner-path assertion to the
share-management security spec, regenerating the Cordis catalog.

* test\(liveshare\): refuse a viewer body naming two Session identities

A prompt or cancel body carrying both `sessionId` and `address` reaches the
Gateway, whose Session resolver refuses it as invalid resources, so the target
child operation never runs and no request content comes back. Prompt and
cancel requests name their Session by `sessionId` alone.

* test\(liveshare\): widen the two-identity coverage across the reader endpoints

The resolver refuses a request that names two Session identities for every
namespace, so cover the remaining reader endpoints with one parametrized case
instead of leaving them to the generic Gateway tests.

* refactor\(liveshare\): remove the unreferenced gateway heartbeat policy

The production worker keeps its own interval and missed-pong counter, so
nothing imported this module; only its spec did.

* refactor\(liveshare\): extract the owner state persistence

The state file reader, writer, serialized write queue, and stored-share
record types move out of the host plugin unchanged.

* refactor\(liveshare\): extract the Relay authority reader

The access-state cache, its generation fence, the admission rule, and the
authoritative read that adopts a frame move behind one factory.

* refactor\(liveshare\): extract the tunnel worker supervision

Worker start, settlement, registration replay, expiry timers, owed Relay
rows, and the credential state each registration presents move out of the
host plugin behind one factory.

* refactor\(liveshare\): extract the owner share operations

The twelve operations keep their order and side effects but move behind an
explicit deps factory, so the host plugin mounts them instead of owning
their bodies.

* refactor\(liveshare\): extract the owner routes and source access

The sixteen owner HTTP routes, their request adapters, and the credential
store move behind registerOwnerHttpRoutes. The confined source Session
layer and its turn control move to source-access, which the share-host
re-exports for its public helpers.

* refactor\(liveshare\): split the viewer reader into dispatch, fork, and lifecycle

The request entry and endpoint handlers, fork orchestration and branch
facts, and the streams/calls/Peers lifecycle move out of viewer-read,
which keeps the deps types and assembly. Order, TOCTOU re-checks, and
Peer ownership are unchanged.

* refactor\(liveshare\): share the wire JSON helpers and the fork enforcement record

The split duplicated `json`/`isRecord` across the extracted owner modules and the
child enforcement options at three call sites; the stored ACL selection type also
lost its reference to the wire type. One helper module and one record factory keep
the split modules from carrying their own copies.

* refactor\(liveshare\): move the shared owner record and one-definition helpers

The split published OwnerShare from the assembly while every extracted module
imported it back, and left each host module carrying its own isRecord. Move the
share record and its ACL summary to a neutral module, name the two optional
service seams instead of inline casts, and import one wire JSON helper.

* refactor\(liveshare\): remove the fork-enforcement audit event

Nothing consumes `liveshare/fork-enforcement` except the spec that watched
it, so the minimal-surface rule drops the declaration, the reporter, and
every report call instead of reserving an extension point for later.

The wiring spec now asserts the outcomes an observer could previously
infer stages from: an install that returns nothing leaves
`ForkRegistry.enforcementInstalled` false and the child's prompt gate
refused with `fork-ceiling-uninstalled`. The subsystem prose no longer
names the removed refusal code, and the Cordis/doc catalogs are
regenerated.

* fix\(liveshare\): surface fork enforcement failures

Three registration paths swallowed the error behind a fail-closed
refusal. Keep refusing, but carry the reason:

- `preflightForkChild` now throws `fork <id> preflight failed: <message>`
  when the stored child cannot be read, instead of returning and letting
  activation fail later; `share-host`'s `prepareChild` caller already
  propagates that through the viewer's `fork-prepare-failed` answer.
- A child's confined `read`/`write` registration keeps its error in a
  `ForkEnforcementFailure`, so `prepareChild` throws
  `fork execution limits are unavailable: <message>` with the error as
  the cause instead of the bare message.
- Source-session access keeps the refused registration on the
  installation and logs it beside the existing confinement refusal.

The wiring spec asserts the preflight failure and both captured errors.

* refactor\(liveshare\): move the client placeholder face out of this layer

The `./client` entry existed only so the package's Client face could
compile the viewer endpoint classification against the generated Remote
map; it published no runtime this product used. P3b owns the real Client
face, so P3a drops the placeholder instead of shipping a surface ahead of
its consumer:

- delete `src/client/*` and the package's Client tsconfig; the endpoint
  spec keeps the Host-table diagnostics, and the Host still derives the
  policy action set from that table
- drop `dsh.client`, `exports\["./client"\]`, the `lib/client.js` publish
  entry, the browser tsdown build, and the package path alias
- remove the dependency-policy exemption and the devDependencies only
  those client sources imported
- the Host tsdown face still skips the Client build pass; `./typert` and
  `./remote` stay Host-generated and the Client tsconfig never fed them
- README and subsystem prose no longer claim a browser face

* chore\(ci\): drop the stacked-PR e2e dispatch input

The narrow dispatch scope existed only to verify a stack's exact SHA while its
ordinary pull-request checks were unavailable; it is not part of LiveShare and
never belonged in this layer's diff.

* feat\(liveshare\): add the share dialogs, viewer seats, and client surfaces

The browser half of the bundle: the owner's share dialog and management surfaces, the owner sign-in flow, the viewer page's session plugin, brand, status, and seat components, and the read-only permission and model seats that replace the shipped composer controls at a shadow rank. The package README regains the client implementation links this layer provides.

* test\(liveshare\): cover the client surfaces and viewer seats

jsdom coverage for the share dialogs, owner login and identity, the viewer page composition, the read-only seats and their shadow rank, the served-page artifacts, and the client-face registration. The host-side suite stays in the lower layer.

* chore\(build\): ship the Liveshare client bundle

The client compiler face and solution reference, the tsdown client entry beside the host phase, the manifest's client export, client runtime files, locale assets, and client dependencies; the dependency-policy classifications whose consumers appear with the client face; the generated client slot catalog; and the plugin-manager expectations that list the bundle's card.

* fix\(liveshare\): shadow the shipped brand seats instead of colliding with them

sidebar.brand.mark and sidebar.brand.name are single slots, and a served viewer page mounts the owner's plugins, so on an official build ui-brand-official already registers both at the default rank. Register the viewer entries at a shadow rank and pin the collision in a registration spec, as the composer seats already do.

* fix\(liveshare\): clear the viewer's composer blocks when its plugin is disposed

The honest-composer effect raised a per-Session block but its disposer only unsubscribed, so a disposed or replaced viewer page left the owner's composer blocked. Track the Sessions it addressed and clear their blocks on disposal; a spec pins the recovery.

* style\(liveshare\): drop unnecessary type assertions in the registration specs

The slot test runtime's renderSlot already accepts these owner props, so the contracts-ready lint reports the as-never assertions as unnecessary.

* test\(web\): mark the client layer's LiveShare card experimental

The client layer ships the card that renders the bundle, and the recorded goldens already carry its Experimental badge. Add the bundle to the manager's always-held extension list and to the presentation's experimental set, and expect badge 1 in the plugin-manager spec.

* fix\(liveshare-client\): return to the share after viewer sign-in

The viewer page names its share in its own query \(?shareId=...\), so a
sign-in that returned to the bare path brought the reader back to a page
that no longer named their share. Build the Relay sign-in entry from the
page's path and query, and keep the entry's construction in one testable
function.

* fix\(liveshare-client\): state a half-saved share permission accurately

Saving the share permission writes the session tier first and the plugin
endpoint selection second. When the second write was refused the dialog
claimed the whole save had failed, though the tier and fork switch were
already stored. State which half landed, and re-read the host's record so
the fields show what it kept while the refused endpoint pick stays for the
retry.

* fix\(liveshare-client\): route viewer copy through the client locale seat

The viewer surfaces translated their own copy from navigator.language, so
a language chosen in Settings could not reach them and a Node boot read the
machine's language instead of the page's. Register the package dictionaries
once, as the client face already does, and take the bound translate seat:
React seats get it from their locale registration, and the plain-DOM status
banner takes it from the plugin and repaints on locale changes.

Also move the viewer status banner's copy and reason helpers to that seat,
and update the viewer specs to provide a LocaleRuntime the way the assembled
viewer page does.

* test\(liveshare\): assert the two-tier fork ceiling in the viewer artifact

The branched row states the ceiling the host installed: a view-tier
\(fork-readonly reads as view\) share's child runs under the read-only fork
ceiling, while a write-tier share's child carries the bounded write
ceiling, whose host half readonly-fork-cold-child.spec.ts covers. Read
that statement through the shipped Tooltip's pointer events: after the
rebase it listens to pointerenter/pointerleave, so the previous mouse-event
hover never raised the bubble and the row's statement stayed unread.

* feat\(plugins\): hide LiveShare until its plugin rows run

A default installation ships the LiveShare package but composes none of
its plugins, so the plugin manager must list it nowhere; enabling it
through the profile's cordis.patch.yml or its bundle selection starts
those rows and only then shows the card under Experimental plugins.

The visibility rule reads the bundle rows' own run state rather than the
profile's bundle selection, because a row inserted through cordis.patch.yml
runs while the bundle stays unselected. The hidden bundle ID stays
addressable, so openBundle still opens its details.

* test\(web\): assert the hidden LiveShare card across both lists

The plugin-manager scenario now checks that the default profile lists no
LiveShare card in the Experimental plugins group or on the More page, and
that the offered count is one lower than the shipped optional bundles. A
dedicated scaffold writes the bundle's declarations row into the profile
patch, waits for the loader to recompose it with bounded timeouts, and
checks the card joins the list and leaves it again when the row is removed.

* docs\(plugins\): document LiveShare's default hidden state and enablement

The package README now states that a default installation shows LiveShare
in neither plugin list, and gives both enable routes: inserting the
bundle's two entries in the profile's cordis.patch.yml \(placeholders for
the deployment's Relay identity values, with the recomposition caveat\), or
selecting the bundle in dsh.profile.bundles. It also states that removing
or disabling the rows takes the card away again. The subsystem page keeps
the rule and links to the README for the exact entries, and the plugin
manager README describes the hidden-until-running list behavior.

This also repairs the README's pre-existing Model Experience mismatch with
its audited indirect classification, which failed the documentation gate
before this change.

* docs\(agent-notes\): record LiveShare's hidden-until-running rule

Record why the plugin manager keys visibility on the bundle rows' run state
rather than the profile's bundle selection \(the cordis.patch.yml route
leaves the bundle unselected while its plugins run\), and why the detail
entry by bundle ID survives the hidden card. The rejected alternatives and
the costs of the decision are stated for review.

* test\(web\): expect the hidden LiveShare card in the configuration scenario

The configuration-page scenario reads the same More list as the plugin
manager, so its offered count is one lower than the installed optional
bundles while LiveShare's declared rows do not run.

* test\(web\): re-record the plugin goldens without the default LiveShare card

Refresh goldens remove the LiveShare entry from the Experimental plugins
list of both plugin-manager snapshots and from the plugin-configuration
snapshot, and drop the refresh card count from 12 to 11. Re-analysis under
replay confirms both scenarios green.

* fix\(liveshare-client\): release the viewer page state with its plugin

The viewer context facts, capability, and status stores are module-level so
every viewer surface reads one page's answer, but nothing released them when
the plugin owning the page was disposed or HMR-replaced, so the next mount
inherited the previous page's share facts, tier, and status. The viewer
session plugin now owns that lifetime: it clears the stores when it mounts
and disposes, and advances the read generation so a previous page's in-flight
answer cannot publish into the new page. A spec pins the disposed page and
the inherited state.

* feat\(liveshare-client\): add the viewer attachment-upload switch

The share carries whether viewers may upload attachments as its own switch,
off by default and independent of the session tier and the fork switch: a
view-tier share may allow uploads and a writable one may refuse them. The
share dialog sets it in both the create and edit flows and submits it with
the permission write; the manager sets it per share beside the fork switch.
A share the Host does not report reads as off. The dialog also states the
tier as the sandbox it runs in, so neither tier is described as carrying
file uploads.

* docs\(liveshare\): describe the sandbox tiers and the upload switch

The host layer owns the package README statement of the two tier sandboxes
and the upload switch; this layer's documentation adds the subsystem
contract for the switch and the client README's attachment-intake sentence —
file intake follows fileUploads/upload, which a share grants only while its
own switch is on.

* refactor\(liveshare-client\): drive the owner dialogs through the modal layer and shared primitives

Both owner dialogs ran their own focus trap beside Modal's layer, so initial focus, Tab wrapping, Escape
and focus restoration were each installed twice and could disagree. The hand-written trap is removed;
the shared layer owns the keyboard lifetime, including the dialog's own restore target. The hand-written
returns focus to the opener exactly as before.

The same surfaces also stop inventing their own controls: the session permission and the share lifetime
are SegmentedControl choices like the capability tier, and the independent fork and upload switches are
the shared Switch primitive. Stopping a published share now asks for the shared RiskConfirmation
acknowledgement before the destructive request runs.

* feat\(liveshare-client\): state the narrowed owner copy and correct the viewer surface

The share manager no longer promises a request-and-approval flow that the protocol dropped: its
description states the online state and access scope it actually shows. Stopping a share is now gated
on acknowledging that the published link stops working immediately.

The viewer status banner keeps its placement inline but takes its colors from the theme tokens with
system-color fallbacks, so the served page stays readable when the client stylesheet never loads. Both
owner dialogs size against the Modal padding box instead of a second viewport calculation, and a long
list title wraps instead of pushing the status out of its row.

A forked branch is stated as a branch, without claiming a read-only workspace the write tier does not
have; the same correction applies to a branch whose sandbox limits failed to install.

* fix\(liveshare-client\): align the viewer face with the current Client services

The rebased Client surface no longer carries uiConversation.noticeBranchRefusal: a refused branch leaves the view unchanged, so the viewer row consumes the rejection and the refusal-notice tests become containment tests. The plugin manager's bundle lists moved to dsh-official-bundles, so the liveshare bundle joins the centralized experimental and extension lists. Master's sidebar keeps the brand identity out of the accessibility tree when the page cannot start a Session, so the assembled-page test reads the viewer home link from the DOM. The roster gains the file-drag plugin ui-chat and ui-attachment now inject, and the fixture reads the protocol's Client-face carrier from its own project and brands the fabricated reasoning effort.

* refactor\(liveshare-client\): consume the protocol package's single public entry

The protocol layer now publishes only its root entry; the client tests read the wire and identity contracts from that root. The dependency policy keeps one liveshare entry carrying both the protocol vocabulary and the identity helpers.

* feat\(plugin-manager\): leave the LiveShare bundle unranked in the extension list

The bundle already stays invisible until one of its patch rows runs, which
keeps ordinary users from encountering it. Removing its ranking entry means an
internal profile that enables it finds the card at the end of the experimental
list instead of pinned to the front; the Experimental badge and the hidden-
until-running card both stay.

* refactor\(liveshare-client\): drop the attachment-upload switch

The share dialog and share management present only the tier and the fork
switch; attachment upload follows visibility on the Host, so there is
nothing left to toggle. Removes the field from the client share record,
both locale seats, and the dialog tests, and states the new rule in the
viewer README.

* feat\(liveshare-client\): drive share management through the liveshareShares Remote

The owner dialogs stop posting the twelve management routes and call the
generated namespace instead. The share list, creation, stopping, permission and
endpoint writes, the Relay read and override, the owner identity read, the
audit, and both Relay checks resolve to a RemoteResult, so a refusal is read
from its `liveshareShares/` code instead of an HTTP status. The sign-in round
trip keeps its three same-origin routes.

The package's client entry mounts its own generated contribution and passes the
namespace to the share surfaces through the slot inject face. `dsh.client.inject`
now names `@deepseek-ai/dsh-api-remotes`, and the viewer endpoint table
classifies the twelve management endpoints as owner-only so the Client
completeness gate stays total.

Client specs substitute the namespace with a scripted double instead of stubbing
`fetch`; the assertions read the recorded requests.

* test\(liveshare\): drive the owner host cases through the Remote service

The host cases no longer register a route map and post JSON to it. They call
`ctx.liveshareShares` directly, which runs the same OwnerShareOperations the
remote Gateway dispatches, so each case keeps its side-effect coverage and
asserts the RemoteError code and details a refusal carries instead of a status
and body.

The ping case is gone with the route: the header action reads `relay\(\)` for the
effective address, which the Relay-state cases already cover. The e2e harness
publishes through `liveshareShares/create` over the owner's own `/api` carrier,
and the sign-in/credential cases keep their same-origin routes.

* refactor\(liveshare\): remove the owner share-management HTTP routes

The twelve same-origin management routes are gone, together with the thin
adapter layer that existed only for them: the status/body error translation,
the per-route request-body readers, and the capability-selection parser. Every
side effect stays in OwnerShareOperations, which the `liveshareShares` Remote
dispatches.

The four remaining routes are the sign-in and credential ones:
ownerLoginStart, ownerLoginRedeem, ownerLoginCancel, and ownerCredential. The
route-registration case now asserts exactly those.

* docs\(liveshare\): describe share management as the liveshareShares Remote

The package README \(both languages\) and the subsystem page now state that the
share list, creation, stopping, permission and endpoint writes, Relay state,
identity, audit, and both Relay checks are `liveshareShares` methods, and that
the sign-in round trip and credential storage are the only same-origin HTTP
routes left. The owner source table points at share-operations.ts and
share-remote.ts for management.

Re-record the README pairing hashes and regenerate the Cordis surface sections,
including the inspect catalog's service description.

* test\(liveshare\): restore the Client classification gate

P3a dropped the Client-face completeness gate together with its placeholder
face. P3b owns the browser runtime, so the gate returns: the Client program
proves every generated Remote endpoint has a table row, and the spec pins the
compiled export beside the diagnostics the Host also uses.

* chore\(build\): restore the Liveshare Client compiler face

The rebase onto the Host layer lost the solution reference and the Host
exclude that kept `src/client` out of the Host program. The package now
carries a real browser runtime, so it takes the ordinary Client/Host
dependency treatment instead of the exemption its placeholder face needed.

* docs\(liveshare\): restore the package's client faces

The subsystem overview names the client faces again now that the browser face
is back, and the translation pairing record is re-recorded.

* test\(liveshare\): cover the browser surfaces and client readers

The browser half of the package now meets the per-file gate on its own
terms: the viewer request decoder, the share-type readers, the viewer
session selection, and the owner identity readers are pinned by direct
specs, and the seats, brand row, share-path chip, status banner, model
seat, and menu row gain the cases their uncovered branches named.

Two internal simplifications remove branches that no input can reach: the
brand row strips build metadata with one replace instead of a split whose
second operand was unreachable, and the viewer-session subscription no
longer starts behind a placeholder disposer that subscribe can never call.

* test\(liveshare\): cover the owner host and gateway glue

The host half gains the direct specs its uncovered branches named: the
stored credential file \(absent, corrupt, unbound, empty facts, deletion\),
the viewer principal comparison, the share Remote's audit delegation, the
registration handshake's plain-socket scheme, the relay refusal status
reader, the JSON body reader, the fork policy's mode helpers and empty
prefix, and the fork guard's unreachable-context refusal. The worker entry
is covered through a mocked worker module, so its boot decision runs
without a spawned process.

The served-page resource answer no longer carries a `string` body: both
call sites hand it bytes, and the string branch could not run.

* test\(liveshare\): cover owner state, authorization, and the header action

Pins the owner state file's restore and refusal rules against real files
\(every optional fact, every invalid record, the owed Relay rows, and a
failed write\), the authorization transaction's four bindings and its
single-use state, the declaration surface's stable package order and
repeated withdrawal, and the Session-header action that opens the share
dialog and switches it to management.

The owner state write chain no longer catches a rejection it cannot
observe: the map holds only promises whose failures were already absorbed.

* test\(liveshare\): close the owner and declaration surface gaps

Pins the authorization URL the browser opens and the production clock and
lifetime a transaction gets when the host passes neither, the declaration
surface's stable package order and repeated withdrawal, the owner state
file's restore and refusal rules against real files, and the Session-header
action's open, manage, and close paths.

The declaration disposer's two optional lookups are annotated instead of
tested: this effect registers each accepted name once, so its own disposer
cannot reach a missing entry, and the effect disposers are idempotent, so a
second withdrawal never re-enters that loop.

* test\(liveshare\): satisfy the lint and compiler gates in the new specs

The refusal double takes the empty details its code declares, the waits
return nothing instead of a void expression, and the IPC entry reads the
channel through a computed access so the lint rule does not read it as an
unbound method reference.

* test\(liveshare\): cover the gateway worker and tunnel supervision

* test\(liveshare\): cover the owner, relay, fork, and viewer host modules

* refactor\(liveshare\): keep the coverage hooks behavior-preserving

* test\(liveshare\): fix the typed listener and endpoint fixtures

* test\(liveshare\): cover the owner login, share manager, and viewer plugin

* test\(liveshare\): cover the share dialog and host fork wiring

* test\(liveshare\): satisfy the contract lint in the gateway worker spec

* chore\(coverage\): drop the liveshare lane exemption

* feat\(liveshare\): ship the remaining shipped-language dictionaries

The locale parity gate requires every shipped language beside each object-form
dictionary, so the Liveshare browser plugin now carries Japanese, Spanish,
French, German, Russian, and Brazilian Portuguese alongside `zh` and `en`, and
registers all eight.

Each dictionary is typed `Record<keyof typeof zh, string>` so a missing or extra
key fails the build, and named placeholders, slash commands, and API field names
stay verbatim in every language.

* docs\(liveshare\): document the host config and two exported host contracts

`verify-export-jsdoc` requires prose on every exported declaration: `Config`
states what a deployment sets and why `relayUrl` has no default,
`requestedBoundary` states how a fork request names its prefix and what an
unnamed one becomes, and `OpenStream` states what the reader tracks and when it
releases the stream.

* chore\(docs\): regenerate the liveshare catalogs and acknowledgement after rebasing

Rebasing the host layer onto current master left the generated artifacts at the
new base's state, because each conflict was resolved to master's side rather
than merged by hand. Recompute them from the rebased tree with the repository
generators: `gen-config-catalog`, `gen-doc-graphs`, `gen-persistence-catalog`,
`gen-client-catalog`, `gen-tool-catalog`, and `verify-persistence-formats
--write`. `gen-module-graph`, `gen-cordis-catalog`, and
`gen-official-bundle-catalog` computed no change.

The LiveShare persistence acknowledgement predated master's later changes to the
four user-message source roots and stored the inventory in a non-canonical
layout, so `verify-persistence-changes` could not read it. Re-record it with
`persistence-changes --update ... --decision same-version`, which chains it onto
master's current tips and rewrites the snapshot, the bilingual declaration, and
their pairing record. Re-record the ui-plugin-manager README pair, whose
LiveShare paragraph now matches on both sides.

* test\(liveshare\): read attachments by the complete image reference

Current master sends `session/attachment` the complete image reference the
conversation folded from the log and answers with the stored reference plus
bytes, instead of accepting a bare `attachmentId`. The viewer fixture still
read the old field, so every assembled-page image read failed and the
viewer-shell and viewer-global-privacy artifact tests timed out waiting for the
delivered image. Follow the new request field and keep verifying by id against
the Session's log.

* test\(liveshare\): pass the complete reference in the owner attachment probe

`session/attachment` now takes the complete image reference, so the admission
spec's owner-side probe sends the fixture's reference instead of a bare id.

* fix\(liveshare\): classify the current Client endpoints for the share-viewer policy

Master added session read/observation endpoints to the Client's Remote map, and
the share-viewer policy's reader role is the only grant they can receive. Name
the six read endpoints in the reader role and in the classification table, keep
the endpoints this Client assembly cannot name out of the table \(they stay
owner-only by default\), and extend the served-page contract plus an admission
test so a hidden Session is still refused.

* fix\(liveshare\): await and type the turn-requester projection

Register the fold before publishing the policy and source layer that read
it, surface a refused registration instead of leaving it unobserved,
reset the retained handle when the projection service reloads, and type
the boundary and execution reads from Agent and TurnBoundaryProjection.

* fix\(liveshare\): withdraw only the fork children a revocation saw

Apply a withdrawal to the entries the registry file holds when it
commits, leave a child recorded afterwards live across restarts, and
retry a failed withdrawal without replaying it over a newer child.

* fix\(liveshare\): refuse a fork that names no Session

Answer 400 with a named code before dispatch, so a malformed fork body
cannot reach the owner's Gateway unrecorded.

* fix\(liveshare\): stop injecting a child id into fork requests

SessionForkRequest mints the child id, so the injected field was ignored.
Forward the caller's envelope and rely on the recorded operation for a
retry; document the crash window that needs a caller-supplied child id.

* fix\(liveshare\): classify and dispatch one normalized path

Use the same pathname plus query for the endpoint decision and the owner
dispatch, and parse with URL.canParse instead of an empty catch.

* docs\(liveshare\): record the two-tier driving model

Rewrite the implemented note's stale tier, turn-carrier, upload, and
retry facts, add the superseding decision note, and keep the subsystem
page and package READMEs aligned.

* fix\(liveshare\): publish only the exported type module from lib/types

The package published every tsc-emitted lib/types/**/*.js file, so the client
JavaScript that imports .module.css files entered the tarball without those
stylesheets. Retain only lib/types/share-api-types.js, the one runtime file
the ./types export names, alongside the declaration tree.

Teach the publication allowlist that this package's emitted tree is completed
by its exact runtime file rather than the whole glob, and pin both the accepted
and rejected payloads.

* test\(liveshare\): mock the generated remote for assembled viewer pages

The assembled viewer specs load the client entry, which statically imports the
generated ./remote contribution. A clean checkout has no lib/ build, and Vite
resolves a static import while transforming the entry, before vi.mock can
answer it, so the jsdom suites failed to import the page roster.

Mock the contribution in each assembly spec, matching the owner-side face
tests, and provide a resolvable test stand-in whenever the artifact is absent.

* fix\(liveshare\): guard hover styles and draw the viewer banner hairline

Wrap the owner action, dialog actions, and viewer wordmark hover rules in
@media \(hover: hover\) so touch devices do not latch the hover treatment, and
draw the viewer status banner's neutral border at the 0.5px hairline width.

* refactor\(liveshare\): name the owner gateway directory

The owner-side Relay connection process is LiveShare's own gateway, not the
Host API gateway; move it to src/owner-gateway so the published entry
lib/owner-gateway/cli.js and the module headers say which gateway they mean.
The protocol vocabulary \(frames, tunnel mode\) keeps the word gateway.

* docs\(liveshare\): merge the tier and visibility notes into the owner note

* docs\(liveshare\): call the Relay the Liveshare server

* docs\(liveshare\): name the Liveshare server in the share-management JSDoc

* docs\(liveshare\): document that new shares are organization links

The shipped Share dialog sends neither accessMode nor allowedSubjectIds, so
every share it creates is open. The agent note, both package READMEs, and
CreateShareRequest's JSDoc now say that selected/approval shares are legacy
stored records that keep their ACL and access summary, that the UI has no
creation entry for them, and that the create fields remain for those records
and direct Remote callers.

* refactor\(liveshare\): drop the configurable owner display name

The reader-facing owner name now always resolves from the Relay-verified
credential: its display name, otherwise the subject label, otherwise the
Relay's host name. Config.ownerDisplayName and the namedOwner dependency
only fed the removed override, so delete both and the test configuration
that set the field.

* docs\(liveshare\): read the owner name only from the verified credential

Remove the LIVESHARE_OWNER_NAME row and its cordis patch mapping, and say
in both READMEs that a reader-facing share name comes from the
Relay-verified credential rather than local configuration. The
LIVESHARE_OWNER_DISPLAY_NAME legacy identity label stays.

* feat\(liveshare\): save the relay address from the share dialog

The public address is the owner's runtime choice, not deployment configuration:
the host loads without one, the dialog saves it into the owner state, and new
shares publish there until the owner saves another or clears it. A host with no
saved address contacts no server and its sharing surfaces state that.

* docs\(liveshare\): describe the address saved in the share dialog

The README, subsystem page, generated API reference, and their bilingual
pairing now state the dialog-owned address and the no-address host state.

* refactor\(liveshare\): sandbox a shared session instead of attributing turns

Retire per-turn origin isolation: delete the turn-requester fold, the
turn-boundary derivation, and every per-turn verdict, and make the source
access layer a session-level sandbox.

While any share over a Session is active the layer's guard permits only the
confined read it mounted \(plus the bounded write when some share may write\);
every turn of that Session, the owner's own included, runs through them and
nothing else. The layer is released once no active share is left, which
restores the Session's own tools, and the read-only layer is re-installed
when the last write share narrows to view. Each operation re-reads the
shares' current Relay grants and checks the resolved target against the
granted root.

A viewer's session/cancel now travels the standard Gateway dispatch under
the source-write role instead of a host-side ownership comparison, and a
share that stops, expires, or loses admission stops whatever turn its
Session is running.

Behavior changes:
- The owner is confined too: while a share is active the owner's own turns
  can only use the confined read \(and bounded write\), and the full tool set
  returns when every share stops or expires.
- Cancellation has no attribution: a viewer's stop cancels the shared
  Session's running turn, including one the owner started.

* test\(liveshare\): exercise the session sandbox and gateway cancel dispatch

Delete the specs that asserted per-turn attribution \(turn-requester, source
cancel ownership, source execution turn, source turn revocation\) and the test
fixtures only they used. Cover the behavior that replaced them: every turn of
a shared Session is confined while the layer is mounted, the layer is released
when no share is left, a write-to-view narrowing re-installs the read-only
layer, a share ending stops the running turn, and a viewer's cancel and prompt
both travel the standard Gateway dispatch as the reader's Peer.

The pre-step admission test now covers the messages' own principals, and the
projection double is gone with the projection it stood in for.

* docs\(liveshare\): document the session sandbox and retiring turn origin isolation

Update the package READMEs, the LiveShare subsystem, the share-viewer
principal persistence record, and the merged Agent Note: remove the
turn-requester fold, turn-boundary derivation, pinned source cancel, and
per-turn origin prose, and state the shipped facts instead — a Session-level
sandbox that also confines the owner while a share is active, a standard
Gateway cancel with no ownership comparison, and the pre-step admission check
as the principal's only consumer. Re-record the bilingual pairing records.

* refactor\(liveshare\): extract share dialog relay and identity hooks

Move the Relay address read/save/draft state and its connectivity and
permission checks into useShareRelayAddress, and the owner identity read
plus the one sign-in attempt into useOwnerIdentityLogin. ShareDialog
keeps the step guide and passes the identity facts saving an address
needs, so neither hook reaches into the other.

* refactor\(liveshare\): extract the share dialog create form

Move the session permission, fork switch, lifetime, and the create
action into useShareCreateForm and ShareCreateForm. The dialog keeps the
link, error, and created-record adoption it already owned, and the
shared choice builders live in share-options so the edit panel can use
the same session-mode list.

* refactor\(liveshare\): extract the share edit panel and tier picker

Move the stored share's permission, fork switch, endpoint tier, and the
one save into useShareEdit and ShareEditPanel, with the tier expansion and
summary in ShareCapabilitiesPicker. ShareDialog now composes the relay,
identity, create, and edit hooks and keeps only the link, advanced help,
and close/manage surface.

* fix\(liveshare\): take share dialog hook options as named parameters

The exported hooks documented an `options` parameter while destructuring it
in their signatures, so their JSDoc could not name the binding.

* chore\(docs\): regenerate graphs, catalogs, and pairing after rebasing on master

The rebase merged this branch's liveshare entries with master's forge entries;
the generated English sources and their bilingual pairing records now reflect
both.

* feat\(liveshare\): open the shared read and write tool surface

The source-session sandbox and each fork child's limit now admit one shared surface: read, read_image, glob, grep, present, todo_write, skill, web_search, and web_fetch at the view tier, plus edit and write at the write tier.

Every path a call declares is resolved and checked against the granted root before the deployment tool receives its canonical form; a pathless search uses the Session's working directory. Tools with no local file effect keep the deployment's own definition, which the guard vouches for by identity. Everything else, including bash, pwsh, cua, the plugin manager, and the schedule tools, stays refused.

* test\(liveshare\): cover the shared tool surface

Drive the view and write surfaces through the source sandbox and a fork child's limit: canonical paths, symlink and relative escapes, pathless searches, deliveries, the no-effect tools, both mutation tools, and every capability the surface does not name. Registration counts in the host wiring now read the shared table instead of one confined read.

* docs\(liveshare\): describe the shared tool surface

The package README, the subsystem reference, and the owner note now state the admitted tools per tier, how each declared path is checked, and that the no-effect tools keep the deployment's definition. Re-record the bilingual pairing and the generated event graph for the new fs/edit-intent consumer.

* feat\(liveshare\): confine viewer turns and admit PTC run_code

Owner turns of a shared Session keep the deployment's native tool chain. The
source layer now decides per turn, from the admitted input's share-viewer
principals, whether the turn is confined; agent/pre-step records that answer
in Host memory only, and the guard plus every confined replacement read it.
A turn the owner starts runs the deployment's tools unchanged, an owner's
steering input inside a viewer's turn stays confined, and stopping every
share still disposes the layer.

Both tiers also admit the PTC transport run_code. A non-empty
sandbox_permissions is refused; every nested tools.* call is a separate
execution through the same guard and confined replacements, so tools.bash
stays refused and read/edit/glob/grep keep their grantedRoot checks. Before
the runtime starts a program, run_code dispatches the new sandbox/policy
waterfall with the Session-resolved policy; the source layer caps it to the
share tier \(read-only for view, workspace-write at most for write, never
danger-full-access\) and drops the deployment's extra writable roots. A fork
child's installation applies the same cap from its live tier.

Verification: pnpm run typecheck, oxlint on the changed files, and the
focused liveshare specs for the turn marker, owner/viewer turns, run_code
admission and nested calls, and the policy caps. Local commits only; not
pushed.

* refactor\(liveshare\): drop the uncommitted-prefix fork state

The host never reads the source Session log, so it cannot know a completed
sequence. The forking command validates the requested boundary against its own
committed history instead, which makes the local boundary refusal unreachable.

* feat\(ui-chat\): export the official user renderer and shared-session copy

* feat\(liveshare\): mark shared-session reader messages through the chat node seat

* test\(liveshare\): cover shared-session attribution and the reused chat node seat

* fix\(liveshare\): leave steering rows to Chat

Only the message that opens a conversation carries the reader attribution;
steering is a turn-internal insertion, so its official Chat cell is untouched.
The wrapper now shadows the user cell alone.

* feat\(plugin-manager\): hide default bundles through their manifest

The LiveShare bundle now declares `dsh.bundle.listedByDefault: false` and the
page applies one manifest rule to every bundle: a default-hidden bundle is
listed only when the profile enables it, the installation carries it selected,
or one of its declared rows runs. The client-side name set and its special
details-by-id fallback are gone.

* docs\(sandbox\): document the per-program sandbox policy extension

The new `sandbox/policy` waterfall owns one event scope, the generated event
graph and subsystem reference now list …")  | Oct 27, 2026  |  
|   |   | [refactor: remove runtime invariant plugins](https://github.com/deepseek-ai/deepseek-harness/commit/f028f25667dbf378c83da80fbb29685b197d00e3 "refactor: remove runtime invariant plugins

Delete @deepseek-ai/dsh-invariants, every package's ./invariant companion
and its tests, the invariant gates and Vitest setup, the scoped-event
resolver generator, and the INVARIANT-coded listener rethrow paths.
Update docs, READMEs, Agent Notes, and add an upgrade guide.")  | Sep 30, 2026  |  
| [vitest.expected.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.expected.config.ts "vitest.expected.config.ts")  | [vitest.expected.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.expected.config.ts "vitest.expected.config.ts")  | [refactor: remove runtime invariant plugins](https://github.com/deepseek-ai/deepseek-harness/commit/f028f25667dbf378c83da80fbb29685b197d00e3 "refactor: remove runtime invariant plugins

Delete @deepseek-ai/dsh-invariants, every package's ./invariant companion
and its tests, the invariant gates and Vitest setup, the scoped-event
resolver generator, and the INVARIANT-coded listener rethrow paths.
Update docs, READMEs, Agent Notes, and add an upgrade guide.")  | Sep 30, 2026  |  
|   |   | [fix(typert): close remote gateway review gaps](https://github.com/deepseek-ai/deepseek-harness/commit/1ea5507bf893cae71de68da12d534d6d5dca6d03 "fix\(typert\): close remote gateway review gaps")  | Aug 7, 2026  |  
| [vitest.snapshot.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.snapshot.config.ts "vitest.snapshot.config.ts")  | [vitest.snapshot.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.snapshot.config.ts "vitest.snapshot.config.ts")  | [refactor: remove runtime invariant plugins](https://github.com/deepseek-ai/deepseek-harness/commit/f028f25667dbf378c83da80fbb29685b197d00e3 "refactor: remove runtime invariant plugins

Delete @deepseek-ai/dsh-invariants, every package's ./invariant companion
and its tests, the invariant gates and Vitest setup, the scoped-event
resolver generator, and the INVARIANT-coded listener rethrow paths.
Update docs, READMEs, Agent Notes, and add an upgrade guide.")  | Sep 30, 2026  |  
| [vitest.web-stress.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.web-stress.config.ts "vitest.web-stress.config.ts")  | [vitest.web-stress.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.web-stress.config.ts "vitest.web-stress.config.ts")  | [test(web): run fixture browser cases through Host](https://github.com/deepseek-ai/deepseek-harness/commit/eb2cb668a54476cc8b46433db4e16b8451d3c336 "test\(web\): run fixture browser cases through Host")  | Sep 13, 2026  |  
|   |   | [feat(inspector): define shared protocol foundation](https://github.com/deepseek-ai/deepseek-harness/commit/189fb34797ca88439a907011a77a3c44e31d45a2 "feat\(inspector\): define shared protocol foundation")  | Aug 27, 2026  |  
| [vitest.web.perf.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.web.perf.config.ts "vitest.web.perf.config.ts")  | [vitest.web.perf.config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/vitest.web.perf.config.ts "vitest.web.perf.config.ts")  | [fix(history): adapt packed pages to session journal](https://github.com/deepseek-ai/deepseek-harness/commit/04c0758fe9cff8941658d699244ae76f13ba9ebc "fix\(history\): adapt packed pages to session journal")  | Aug 25, 2026  |  
| View all files |  
# DeepSeek Harness
English | [中文](https://github.com/deepseek-ai/deepseek-harness/blob/master/README.zh.md)
DeepSeek Harness (`dsh`) is an open-source agent harness developed by [DeepSeek AI](https://deepseek.com).
It is built on an **everything-is-a-plugin** architecture and powered by [Cordis](https://github.com/cordiverse/cordis), whose design is described in [_A Programming Paradigm for Spatiotemporal Composability_](https://arxiv.org/abs/2608.25512).
Documentation: <https://deepseek-harness.github.io/deepseek-harness/>
## Developer preview
DeepSeek Harness is in _developer preview_ and iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**
Review the [safety notice](https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md) before running the project.
### Run from `npm`
Install `Node.js`, then run:

```
npx @deepseek-ai/dsh web
```

The command starts the Web UI at `http://127.0.0.1:3080` by default and opens it in the default browser for a local launch. An SSH launch only prints the host URL because the SSH client or editor owns the local forwarded address. Pass `--no-open` to run the server without opening a browser. See [Web UI guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/index.md).
### Run from source
To run from a repository checkout:

```
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

`pnpm run build` prepares the repository artifacts. `pnpm dsh web` uses those built artifacts without rebuilding.
## Community and support
  * Submit feedback or bug reports through [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions).
  * Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your plugin repository for discoverability.
  * Join [DeepSeek Harness Discord community](https://discord.gg/4MrtZUhpxg).


## Contributing
See [CONTRIBUTING.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/CONTRIBUTING.md).
## Development
Start with the [development guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/development.md) and [architecture documentation](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md).
`pnpm run dev:web` builds, serves, and rebuilds client bundles on source edits in one terminal, and `make help` lists the matching Make targets for Web and Desktop; the guide's application commands section owns the full table.
For agents, follow [AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md).
## Citation

```
@misc{deepseek-harness2026,
  title={DeepSeek Harness: Everything is a Plugin},
  author={DeepSeek-AI},
  year={2026},
  publisher={GitHub},
  howpublished={\url{https://github.com/deepseek-ai/deepseek-harness}},
}
```

## License
Third-party dependencies and their licenses are disclosed in [THIRD_PARTY_NOTICES.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/THIRD_PARTY_NOTICES.md).
## About
DeepSeek Harness: Everything is a Plugin.
**265.6k** stars
**1.1k** watching
[**32.2k** forks](https://github.com/deepseek-ai/deepseek-harness/forks)
## 
[35tags](https://github.com/deepseek-ai/deepseek-harness/tags)
## 
## Languages
  * [TypeScript95.9%](https://github.com/deepseek-ai/deepseek-harness/search?l=typescript)
  * [CSS1.3%](https://github.com/deepseek-ai/deepseek-harness/search?l=css)
  * [Python1.1%](https://github.com/deepseek-ai/deepseek-harness/search?l=python)
  * [JavaScript0.7%](https://github.com/deepseek-ai/deepseek-harness/search?l=javascript)
  * [Swift0.5%](https://github.com/deepseek-ai/deepseek-harness/search?l=swift)
  * [PowerShell0.3%](https://github.com/deepseek-ai/deepseek-harness/search?l=powershell)
  * [Other0.2%](https://github.com/deepseek-ai/deepseek-harness/search?l=Other)


You can’t perform that action at this time. 
