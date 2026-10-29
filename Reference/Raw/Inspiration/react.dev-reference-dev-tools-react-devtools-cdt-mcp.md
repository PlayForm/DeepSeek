Copy pageCopy
# React DevTools for agents - This feature is available in the latest Experimental version of React
### Experimental Feature
**`react-devtools-cdt-mcp`is experimental.** It is built on the [experimental third-party developer tools API](https://developer.chrome.com/blog/devtools-for-agents-3p-tools) in [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp), and both its tools and their output may change between releases.
`react-devtools-cdt-mcp` gives AI coding agents the same view of your app that React DevTools gives you: the component tree, props, hooks, owners, source locations, and render timing.

```


import 'react-devtools-cdt-mcp/register';


```

  * [Reference ](https://react.dev/reference/dev-tools/react-devtools-cdt-mcp#reference)
    * [`register(target?)` ](https://react.dev/reference/dev-tools/react-devtools-cdt-mcp#register)


## Overview 
Coding agents that drive a browser through [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) can click, take snapshots, and read the DOM, but the DOM doesn’t tell them which component rendered a button, what state it holds, or why an interaction was slow.
`react-devtools-cdt-mcp` is a small browser library that you import into the page you’re debugging. It registers a group of React tools with the page. When Chrome DevTools MCP connects to that page, it discovers the tools automatically, and your agent can call them like any other MCP tool.
### Note
`react-devtools-cdt-mcp` is **not** an MCP server, and it doesn’t go in your MCP client config. It runs inside your page. The only MCP server you configure is Chrome DevTools MCP.
## Setup 
#### Install the package 
Terminal

```
npm install --save-dev react-devtools-cdt-mcp
```

#### Import it before React 
Import the `register` entry point at the very top of your app’s entry file, **before** anything imports `react-dom`:

```


import 'react-devtools-cdt-mcp/register';





import { createRoot } from 'react-dom/client';




import App from './App';





createRoot(document.getElementById('root')).render(App />);


```

`react-devtools-cdt-mcp` has to load before React does. If you import it after React, the tools won’t see your components.
### Pitfall
`react-devtools-cdt-mcp` connects to React the same way the React DevTools extension does, and makes React report every commit to it. This slows down your app, so only include it in development builds.
#### Set up Chrome DevTools MCP 
Your agent needs [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) with [third-party developer tools](https://developer.chrome.com/blog/devtools-for-agents-3p-tools) enabled. Follow the [Chrome DevTools MCP docs](https://github.com/ChromeDevTools/chrome-devtools-mcp#getting-started) to set it up. Once your agent opens a page that imports `react-devtools-cdt-mcp/register`, it can list and call the React tools.
## Try it 
You don’t need an agent to see what the tools return. The sandbox below imports `react-devtools-cdt-mcp/register` exactly as you would in your app, and adds a small **tool console** under the app. The console discovers the React tools the same way Chrome DevTools MCP does, by dispatching the `devtoolstooldiscovery` event, and lets you call them by hand.
Pick a tool, edit the JSON parameters, and press **Run tool**. Here’s a debugging session to follow, playing the agent’s part:
  1. **Find a component.** Run `react_find_components` with `{"name": "Row"}`. Each result has a `uid`, like `"r12"`, that the other tools accept.
  2. **Inspect it.** Run `react_get_component_by_uid` with one of those uids and `"includeHooks": true` to see its props and hooks.
  3. **Start from the screen.** Choose `react_get_component_by_dom_element`, press **Pick element** , and click a product in the list to get the host component that rendered it.
  4. **Profile an interaction.** Run `react_start_profiling`, click **Add to cart** in the app, then run `react_stop_profiling`.
  5. **See what rendered.** Run `react_get_trace_overview`, then `react_get_commit_report` for commit `0` to see which components rendered in that commit and how long each one took.


index.jsApp.js
App.js
ReloadClear[Fork](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

```
import { useState } from 'react';

const PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  name: 'Product ' + (i + 1),
  price: 10 + i,
}));

export default function App() {
  const [query, setQuery] = useState('');
  const visibleProducts = PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    main
      Cart />
      input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter products"
      />
      ProductList products={visibleProducts} />
    </main
  );
}

function Cart() {
  const [count, setCount] = useState(0);
  return (
    header
      CartBadge count={count} />
      button onClick={() => setCount((c) => c + 1)}Add to cart</button
    </header
  );
}

function CartBadge({ count }) {
  return span className="badge"Cart: {count}</span;
}

function ProductList({ products }) {
  return (
    ul
      {products.map((product) => (
        ProductRow key={product.id} product={product} />
      ))}
    </ul
  );
}

function ProductRow({ product }) {
  return (
    li
      {product.name} b${product.price}</b
    </li
  );
}


```

Show more
### Note
The tool console in this sandbox stands in for Chrome DevTools MCP so you can try the tools on this page. In your own app, you don’t write any of this code: Chrome DevTools MCP discovers the tools and your agent decides which ones to call.
## Reference 
### Tools 
`react-devtools-cdt-mcp` registers a tool group called `react`. Your agent calls these tools through Chrome DevTools MCP.
  * `react_get_component_tree`: Returns a snapshot of the component tree.
  * `react_find_components`: Finds components by name.
  * `react_get_component_by_uid`: Returns a component’s props and Hooks.
  * `react_get_component_by_dom_element`: Returns the React host component for a DOM element.
  * `react_get_parent_stack`: Returns where a component is mounted in the tree.
  * `react_get_owner_stack`: Returns the components that created a component in their JSX.
  * `react_get_owner_stack_trace`: Returns the owner stack of a component as a stack trace.
  * `react_get_component_source`: Returns where a component is defined.
  * `react_start_profiling`: Starts recording render timing.
  * `react_stop_profiling`: Stops recording render timing.
  * `react_get_trace_overview`: Returns a summary of every commit in a recording.
  * `react_get_commit_report`: Returns which components rendered in a commit and how long each took.


Components are identified by short, stable uids like `"r5"`. A uid stays the same across every tool and across re-renders, but not across page reloads.
Every tool returns a plain, serializable object. If a tool fails, it returns an object with an `error` message instead.
###  `register(target?)`
Call `register` to install the React DevTools hook and register the React tools with Chrome DevTools MCP yourself, instead of importing `react-devtools-cdt-mcp/register`.

```


import { register } from 'react-devtools-cdt-mcp';





register();


```

#### Parameters 
  * **optional** `target`: The global object to install the hook on. Defaults to `globalThis`.


#### Returns 
`register` returns an object with two properties:
  * `facade`: The installed React DevTools hook and the state the tools read from.
  * `unregister`: A function that stops registering the React tools with Chrome DevTools MCP.


#### Caveats 
  * Call `register` before React initializes, or React won’t connect to the hook.
  * Calling `register` again for the same `target` returns the existing registration.


## Troubleshooting 
#### My agent doesn’t see any React tools 
Check that [third-party developer tools](https://developer.chrome.com/blog/devtools-for-agents-3p-tools) are enabled in your Chrome DevTools MCP setup. Then check that the page selected in Chrome DevTools MCP imports `react-devtools-cdt-mcp/register`. The tools are discovered per page, when the page loads or is selected.
#### The component tree is empty 
`react-devtools-cdt-mcp/register` was imported after React initialized. Move the import to the very first line of your entry file, before any import that loads `react-dom`.
#### I’m getting an error about a browser-like environment 
`react-devtools-cdt-mcp/register` throws if it’s imported outside a browser, for example during server rendering or in tests. Import it only from client-side code, or call `register()` from the package root yourself where it’s safe.
#### Source locations and owner stacks are empty 
This data only exists in development builds of React. Make sure you’re running your app’s development server rather than a production build.
#### A uid stopped working 
Uids don’t survive page reloads. After a reload, get fresh uids with `react_get_component_tree` or `react_find_components`.
[ PreviousReact Performance tracks ](https://react.dev/reference/dev-tools/react-performance-tracks)
