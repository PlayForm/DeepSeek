# Astro lifecycle: the client router and the explorer's mount contract

> Statement: Astro's ClientRouter intercepts navigation and fires five documented events on the
> document, in order: astro:before-preparation, astro:after-preparation, astro:before-swap,
> astro:after-swap, and astro:page-load. Bundled module scripts execute exactly once, so every
> per-navigation setup belongs behind astro:page-load and every mount must be idempotent because the
> window survives the swap.

## The documented events, in order

- astro:before-preparation: "fires at the beginning of the preparation phase, after navigation has
  started (e.g. after the user has clicked a link), but before content is loaded." Used for loading
  indicators and for changing the navigation direction.
- astro:after-preparation: "fires at the end of the preparation phase, after the new page's content
  has been loaded and parsed into a document." It occurs before the view transition phase.
- astro:before-swap: "fires before the new document (which is populated during the preparation phase)
  replaces the current document. This event occurs inside of the view transition". The event exposes
  newDocument and a replaceable swap implementation.
- astro:after-swap: "fires immediately after the new page replaces the old page"; the documented use
  is passing DOM state across the swap, and it "occurs immediately after the browser history has been
  updated and the scroll position has been set".
- astro:page-load: "fires at the end of page navigation, after the new page is visible to the user
  and blocking styles and scripts are loaded"; it "fires this event both on initial page navigation
  for a pre-rendered page and on any subsequent navigation".

## The one-time module execution rule

- "Bundled module scripts, which are the default scripts in Astro, are only ever executed once. After
  initial execution they will be ignored, even if the script exists on the new page after a
  transition."
- Inline scripts "have the potential to be re-executed during a user's visit to a site", and
  data-astro-rerun forces re-execution for inline scripts only: "Adding any attribute to a script
  also implicitly adds is:inline, so this is only available for scripts that are not bundled".
- "If you have code that sets up a global state in an inline script, this state will need to take
  into account that the script might execute more than once. Check for the global state in your
  script tag, and conditionally execute your code where possible. This works because window is
  preserved."

## The mount and dispose contract the explorer must follow

Mount:

- Register document-level astro:page-load handling once at module scope; do per-page work inside the
  handler, because it fires on first load and after every navigation.
- Build the canvas in astro:page-load, not on DOMContentLoaded: "event listeners for DOMContentLoaded
  can be replaced by the astro:page-load lifecycle event".
- The body is "completely replaced with the new page's body", so nothing built inside the body
  survives navigation; state kept on window, or in an island marked transition:persist, does survive.

Dispose:

- Each astro:page-load pass must remove the previous pass's listeners before adding new ones, or the
  page stacks one listener set per navigation, because the module runs once while the handler runs
  per navigation.
- Release layout workers and observers per pass; the graph-stack note ties the ELK worker's
  terminateWorker() to this dispose point.
- A transition:persist island is never disposed on navigate-away: "the island from the old page with
  its current state will continue to be displayed". Use persist only where cross-page continuity is
  intended, and accept that its dispose path does not run.

Router controls the explorer may use:

- data-astro-reload forces "a full-page navigation"; "Links with the data-astro-reload attribute will
  be ignored by the router".
- data-astro-history with "push", "replace", or "auto" controls whether navigation writes a new
  history entry.
- navigate(href) from astro:transitions/client triggers navigation from scripts or hydrated
  components; "If navigate() is called during the server-side render of your component, it has no
  effect."

## What we reject

- That scripts re-run on every navigation by default; module scripts run once.
- Any lifecycle event name outside the documented five.
- That the explorer can mount on DOMContentLoaded.
- That before-swap runs outside the view transition snapshot.
- That fallback="swap" or "none" changes the event order; fallback changes animation behavior only
  in browsers that lack view transition support.

## Sources

- https://docs.astro.build/en/guides/view-transitions/ - Reference/Raw/astro-view-transitions.md
