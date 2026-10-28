# Perfetto UI

The [Perfetto UI](https://ui.perfetto.dev) enables you to view and analyze traces in the browser. It supports several different tracing formats, including the perfetto proto trace format and the legacy json trace format.

## [](#loading-a-trace)Loading a Trace

Click one of the examples in the 'New Trace' section of the sidebar to get going.

Drag and drop a trace from your file explorer, or click 'Open trace file' in the sidebar to open a local trace file.

Selecting or dropping several files at once merges them onto a single shared timeline via a configuration dialog: see [Merging traces in the UI](./docs-visualization-merging-traces.md).

## [](#navigating-the-timeline)Navigating the Timeline

Use the WASD cluster to zoom and pan around the timeline. W and S zoom in and out, and A and D pan left and right respectively.

Alternatively you can use Shift+Drag to pan using the mouse. Ctrl+MouseWheel zooms in and out.

## [](#track-event-selections)Track Event Selections

Selecting entities on the trace is the primary way to dig into events of a trace and reveal more data about those events.

Select a track event by clicking on it. Details about the selected event will appear in the 'Current Selection' tab in the tab drawer.

Use '.' and ',' to navigate between adjacent slices on the same track.

Press 'F' to fit the selected entity to the viewport. This can be useful for really short events that cannot otherwise be seen clearly at the current zoom level.

At any point, press 'escape' or click on some empty space in the timeline to clear the selection.

## [](#area-selections)Area Selections

Click and drag over the timeline to make an area selection. An area selection consists of a start + end time and a list of tracks. Click+drag on the markers to move the start and end times. Check or uncheck the checkboxes in the track shells to modify the list of tracks in the selection.

You can also convert a single selection into an area selection using the 'R' hotkey. This turns the currently selected track event in to an area selection using the bounds of the selected event.

## [](#commands)Commands

Commands provide a quick way to run common tasks throughout the UI. Press 'Ctrl+Shift+P' ('Cmd+Shift+P' on Mac) to open the command palette, or by entering '\>' in the omnibox. The omnibox transforms into a command palette. Commands can be searched using fuzzy matching. Press up or down to highlight a command and Enter to run it.

For comprehensive documentation on automating the UI with commands, startup commands, and macros, see [Commands and Macros](./docs-visualization-ui-automation.md). For an overview of all extension mechanisms, see [Extending the UI](./docs-visualization-extending-the-ui.md).

## [](#showing-hiding-the-tab-drawer)Showing/hiding the tab drawer

Press 'Q' to toggle the tab drawer.

## [](#finding-tracks)Finding Tracks

Press 'Ctrl+P' (or 'Cmd+P' on Mac) to open the track finder and start typing to fuzzy find tracks.

## [](#filtering-tracks)Filtering Tracks

Click the filter icon in the timeline toolbar to filter which tracks are shown on the timeline. Type comma separated terms to filter tracks by name, or use the dropdowns to only show tracks belonging to specific processes or threads.

Filters are non-destructive: press 'Clear All Filters' to show all tracks again. While filters are active, the filter icon appears filled.

## [](#pinning-tracks)Pinning Tracks

Press the 'Pin' icon in the track shell to pin a track to the top of the timeline. This operation moves the track to the top of the workspace. This can be handy if you want to keep important tracks in view while scrolling through the main timeline.

## [](#hotkeys)Hotkeys

Hotkey bindings are displayed to the right of the commands in the command palette, or press the '?' hotkey to display all configured hotkeys.

## [](#next-steps)Next Steps

Once you're comfortable with the basic UI interactions, you can customize and extend the UI to speed up your analysis workflow:

- **Automate repetitive tasks:** Use [commands and macros](./docs-visualization-ui-automation.md) to configure startup commands that automatically pin tracks or create debug tracks every time you open a trace, and create macros for specific analysis workflows you run occasionally.
- **Share workflows with your team:** Use [extension servers](./docs-visualization-extension-servers.md) to distribute macros, SQL modules, and proto descriptors to your team.
- **See all extension options:** [Extending the UI](./docs-visualization-extending-the-ui.md) covers all the ways to customize Perfetto, from simple macros to plugins.


- [Loading a Trace](https://perfetto.dev/docs/visualization/perfetto-ui#loading-a-trace)
- [Navigating the Timeline](https://perfetto.dev/docs/visualization/perfetto-ui#navigating-the-timeline)
- [Track Event Selections](https://perfetto.dev/docs/visualization/perfetto-ui#track-event-selections)
- [Area Selections](https://perfetto.dev/docs/visualization/perfetto-ui#area-selections)
- [Commands](https://perfetto.dev/docs/visualization/perfetto-ui#commands)
- [Showing/hiding the tab drawer](https://perfetto.dev/docs/visualization/perfetto-ui#showing-hiding-the-tab-drawer)
- [Finding Tracks](https://perfetto.dev/docs/visualization/perfetto-ui#finding-tracks)
- [Filtering Tracks](https://perfetto.dev/docs/visualization/perfetto-ui#filtering-tracks)
- [Pinning Tracks](https://perfetto.dev/docs/visualization/perfetto-ui#pinning-tracks)
- [Hotkeys](https://perfetto.dev/docs/visualization/perfetto-ui#hotkeys)
- [Next Steps](https://perfetto.dev/docs/visualization/perfetto-ui#next-steps)

<!--
## Source links

- [Perfetto UI](https://ui.perfetto.dev)
- [Merging traces in the UI](./docs-visualization-merging-traces.md) - source: /docs/visualization/merging-traces
- [Commands and Macros](./docs-visualization-ui-automation.md) - source: /docs/visualization/ui-automation
- [Extending the UI](./docs-visualization-extending-the-ui.md) - source: /docs/visualization/extending-the-ui
- [extension servers](./docs-visualization-extension-servers.md) - source: /docs/visualization/extension-servers
- [Loading a Trace](https://perfetto.dev/docs/visualization/perfetto-ui#loading-a-trace)
- [Navigating the Timeline](https://perfetto.dev/docs/visualization/perfetto-ui#navigating-the-timeline)
- [Track Event Selections](https://perfetto.dev/docs/visualization/perfetto-ui#track-event-selections)
- [Area Selections](https://perfetto.dev/docs/visualization/perfetto-ui#area-selections)
- [Commands](https://perfetto.dev/docs/visualization/perfetto-ui#commands)
- [Showing/hiding the tab drawer](https://perfetto.dev/docs/visualization/perfetto-ui#showing-hiding-the-tab-drawer)
- [Finding Tracks](https://perfetto.dev/docs/visualization/perfetto-ui#finding-tracks)
- [Filtering Tracks](https://perfetto.dev/docs/visualization/perfetto-ui#filtering-tracks)
- [Pinning Tracks](https://perfetto.dev/docs/visualization/perfetto-ui#pinning-tracks)
- [Hotkeys](https://perfetto.dev/docs/visualization/perfetto-ui#hotkeys)
- [Next Steps](https://perfetto.dev/docs/visualization/perfetto-ui#next-steps)
- [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/)
- [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)
- Site CC BY 4.0 - source: `//creativecommons.org/licenses/by/4.0/`
- Privacy - source: `//www.google.com/intl/en/policies/privacy/`
-->
