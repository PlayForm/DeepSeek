[Skip to content](https://docs.stripe.com/stripe-apps/routing#main-content)
Routing
[Overview](https://docs.stripe.com/development)
Versioning
[Upgrade your integration](https://docs.stripe.com/upgrades)[How API versioning works](https://docs.stripe.com/api-versions)
Essentials
Tools
[Provisioning](https://docs.stripe.com/provisioning) [Stripe for Visual Studio Code](https://docs.stripe.com/stripe-vscode) [Stripe Discord server](https://docs.stripe.com/discord)
Features
[Stripe health alerts](https://docs.stripe.com/health-alerts)[File uploads](https://docs.stripe.com/file-upload)
AI tools
[Agent plugins](https://docs.stripe.com/agents/plugin)[Model Context Protocol](https://docs.stripe.com/mcp)[Agent skills](https://docs.stripe.com/skills)[Stripe Directory](https://docs.stripe.com/directory)
Extend Stripe
[Build Stripe apps](https://docs.stripe.com/stripe-apps)
Get started
Build an app
[API authentication methods](https://docs.stripe.com/stripe-apps/api-authentication)
[Enable local network access](https://docs.stripe.com/stripe-apps/enable-local-network-access)
[Build a UI](https://docs.stripe.com/stripe-apps/build-ui)
[Experimental UI components](https://docs.stripe.com/stripe-apps/experimental-ui-components)
[Component hierarchy constraints](https://docs.stripe.com/stripe-apps/component-hierarchy-constraints)
[Upgrade Stripe's UI extension SDK](https://docs.stripe.com/stripe-apps/upgrade-stripes-ui-extension-sdk)
Distribute your app
[Navigate with route descriptors](https://docs.stripe.com/stripe-apps/route-descriptors)
[Assign roles in UI extensions](https://docs.stripe.com/stripe-apps/using-roles-in-ui-extensions)
Embedded components
[Embed third-party Stripe Apps](https://docs.stripe.com/stripe-apps/embedded-apps)
Migrating to Stripe Apps
[Migrate or build a Connect extension](https://docs.stripe.com/stripe-apps/migrate-connect-extension)
[Migrate a plugin to Stripe Apps or Stripe Connect](https://docs.stripe.com/stripe-apps/plugins/decide-migration)
Reference


[Custom objects](https://docs.stripe.com/custom-objects)
Security and privacy
[Activity logs](https://docs.stripe.com/activity-logs)[Stripebot web crawler](https://docs.stripe.com/stripebot-crawler)
Partners
[Partner certification](https://docs.stripe.com/partners/training-and-certification)
[Public preview](https://docs.stripe.com/release-phases)
# 
## Define URL routes in your full-page app so users can bookmark, share, and navigate between views with the browser's back and forward buttons.
Ask about this page
Copy for LLMView as Markdown
Set up agent
As your app grows beyond a single view, it needs routing. Routing is a way to map URLs to components so different views render depending on where the user navigates. The `@stripe/ui-extension-sdk/navigation` module provides a router for this purpose. Its APIs are designed primarily for , where each route controls the path segment after your app’s base URL (for example, `/customers/cus_123` in `https://dashboard.stripe.com/<ACCOUNT_ID>/app/<APP_ID>/customers/cus_123`). Because routes map to real Dashboard URLs, users can bookmark views, share links, and navigate with the browser’s back and forward buttons.
Routing has three pieces that work together:
  * A _route config_ created with `createRoutes()` that maps route names to URL patterns and render functions.
  * A `NavigationProvider` that owns the route config and makes it available to the router and to navigation hooks anywhere in your app—including non-full-page viewports such as `stripe.dashboard.drawer.default`.
  * An `AppRouter` that matches the current URL against the config and renders the matching route inside your full-page view.


## Before you begin
  * Install the latest version of the .
  * or use an existing one with a `stripe.dashboard.fullpage` .
    * To  a new app with a full-page view, run `stripe apps create <app-name>`.
    * To add the viewport to your existing app, install SDK version `9.2.1` or later and run `stripe apps add view` and choose `stripe.dashboard.fullpage`.


## Example
Before you read through the details about how routing works, see the following example of a full-page app that uses routing. Click the navigation links and see how the Dashboard URL updates in the address bar as you transition between views—each route corresponds to a shareable URL:
Loading example...
The following sections explain how to set up routing like this in your own app, starting with the route config.
## Define a route config
Routing uses a route config—a single object that maps to  and their corresponding . You declare it once, and the rest of the system (the router, the navigation hooks, TypeScript support) derives its behavior from that definition. Use `createRoutes()` to build this route config.
#### Note
We recommend placing all routes and the  interface in a dedicated `src/routes.ts` file.

```

// src/routes.tsimport{createRoutes, route}from'@stripe/ui-extension-sdk/navigation';import{Home}from'./Home';import{Customers}from'./Customers';import{Customer}from'./Customer';exportconst routes =createRoutes({
  home:route('/',()=>Home/>),
  customers:route('/customers',()=>Customers/>),
  customer:route(// Route name'/customers/:id',// URL pattern({id})=>Customerid={id}/>// Render function),});

```

### Enable type-safe navigation
After defining your routes, declare the `RouteRegister` interface so TypeScript can validate route names and parameters across your entire app.

```

// src/routes.ts (continued)exportconst routes =createRoutes({...});declaremodule'@stripe/ui-extension-sdk/navigation'{interfaceRouteRegister{
    routes:typeof routes;}}

```

With this augmentation of the `RouteRegister` interface in place, the following type-safety features are enabled:
  * Passing invalid or missing parameters when  causes a TypeScript error.
  * Access to type-safe route parameters when .
  * Using an unknown route name when reading or updating the current route causes a TypeScript error.


The following subsections describe each building block of a route definition in more detail.
### Route names
Each route is identified by a name (`'home'`, `'customer'`) rather than a raw URL string. All navigation throughout your app uses these names, never raw paths. This indirection is intentional—if you later change `/customers/:id` to `/clients/:id`, you update the path in one place and every `navigateToAppRoute({key: 'customer', params: {id}})` call continues to work without modification.
### Path patterns
Each full-page app owns a URL namespace under the Dashboard. Your route paths control the segment that follows your app’s base URL:

```

https://dashboard.stripe.com/<ACCOUNT_ID>/app/<APP_ID>/customers/cus_123
                                                      └────────────────┘
                                                       Your route: /customers/:id


```

The path string in each `route()` call determines which URLs it matches. Patterns support static segments, required parameters, and optional parameters:  
| Pattern type  | Example  |  
| --- | --- |  
| Static  |  `/customers`, `/settings`  |  
| Required parameters  |  `/customers/:id`, `/customers/:customerId/invoices/:invoiceId`  |  
| Optional parameters  |  `/customers/:status?`, `/search/:query?`  |  
| Mixed  | `/customers/:id/invoices/:invoiceId?`  |  
Dynamic segments use colon syntax—`/customers/:id` matches `/customers/cus_123` and passes `{id: 'cus_123'}` to the render function. Appending a question mark makes a segment optional, meaning `/labels/:name?` matches both `/labels` and `/labels/Deutsche-Grammophon`.
#### Caution
In , we validate route patterns at runtime to detect invalid definitions early. Segments must use lowercase alphanumeric characters, hyphens, and colons (for parameters) only. A pattern that violates these rules produces an error before your app reaches users.
### Render function
When a URL matches a pattern, the router extracts the dynamic segments and passes them as the first argument to the render function. The second argument is the `ExtensionContextValue`—the same  the `FullPage` view receives. This means each route has access to environment information, such as the current user or the object being viewed.
Types are inferred directly from the pattern string, so you get autocompletion and compile-time checking without writing any type annotations yourself:
  * Required parameters (`:id`) are a `string` type.
  * Optional parameters (`:id?`) are a `string | undefined` type.



```

exportconst routes =createRoutes({// params: {}, context: ExtensionContextValue
  customers:route('/customers',(params, context)=>Customers/>),// params: {id: string}, context: ExtensionContextValue
  customer:route('/customers/:id',({id}, context)=>Customerid={id}/>),// params: {id: string, invoiceId: string | undefined}
  invoice:route('/customers/:id/invoices/:invoiceId?',({id, invoiceId}, context)=>(InvoicecustomerId={id}invoiceId={invoiceId}/>)),});

```

Now that you have a route config, the next step is to make it available to your app with `NavigationProvider`.
## Provide routes with NavigationProvider
A route config on its own is nothing more than data. `NavigationProvider` connects it to your app. Wrap the root of your view in `NavigationProvider` and pass your route config to its routes prop:

```

// src/views/FullPage.tsximport{NavigationProvider}from'@stripe/ui-extension-sdk/navigation';importtype{ExtensionContextValue}from'@stripe/ui-extension-sdk/context';import{routes}from'../routes';exportdefaultfunctionFullPage(context: ExtensionContextValue){return(NavigationProviderroutes={routes}{/* ... */}</NavigationProvider);}

```

The navigation hooks work in any component beneath the provider, whether or not an `AppRouter` is rendered. This is what lets you [navigate from non-full-page viewports](https://docs.stripe.com/stripe-apps/routing#navigate-from-non-fullpage-viewports) such as `stripe.dashboard.drawer.default`.
#### Note
Render a single `NavigationProvider` near the root of each view rather than wrapping individual components.
## Wire up the AppRouter
Render `AppRouter` in your `stripe.dashboard.fullpage` view, and the router matches the URLs and renders the components:

```

// src/views/FullPage.tsximport{AppRouter, NavigationProvider}from'@stripe/ui-extension-sdk/navigation';importtype{ExtensionContextValue}from'@stripe/ui-extension-sdk/context';import{routes}from'../routes';exportdefaultfunctionFullPage(context: ExtensionContextValue){return(NavigationProviderroutes={routes}AppRoutercontext={context}/></NavigationProvider);}

```

You can wrap `AppRouter` with `FullPageView` if every route shares the same layout. However, because different pages often need different structures such as a list page, a detail page with two columns, a settings form, we recommend defining the appropriate layout inside each route’s render function instead. This gives every route full control over its view structure:

```

import{FullPageView}from'@stripe/ui-extension-sdk/ui';import{createRoutes, route}from'@stripe/ui-extension-sdk/navigation';import{Home}from'./Home';import{Customers}from'./Customers';import{Customer}from'./Customer';exportconst routes =createRoutes({
  home:route('/',()=>(FullPageViewHome/></FullPageView)),
  customers:route('/customers',()=>(FullPageViewCustomers/></FullPageView)),
  customer:route('/customers/:id',({id})=>(FullPageViewCustomerid={id}/></FullPageView)),});

```

### Redirect on unmatched routes
When the current URL doesn’t match any defined route (a stale bookmark, a typo, or a path you’ve since removed) `AppRouter` performs a replace navigation to the route specified by `redirectOnNotFound`. This removes the unmatched URL from browser history so the user doesn’t get into a back-button loop:

```

AppRoutercontext={context}redirectOnNotFound={{key:'home'}}/>

```

## Navigate between routes
With routes defined and the router wired up, your app has structure, but users also need to move between those routes in response to their actions. Examples of these actions include clicking a breadcrumb, selecting a row in a table, or submitting a form. The `useNavigation()` hook, available in any component beneath a `NavigationProvider`, returns two navigation mechanisms:

```

import{useNavigation}from'@stripe/ui-extension-sdk/navigation';functionCustomerActions(){const{navigateToAppRoute, createAppRoute}=useNavigation();// ...}

```

The two mechanisms serve different purposes: `createAppRoute` for declarative link-based navigation, and `navigateToAppRoute` for imperative programmatic navigation.
### Declarative navigation with Link
Use `createAppRoute` to build a route descriptor and pass it as the `href` prop to . This is the preferred approach for most navigation because it renders a real anchor element, giving users standard browser behavior such as hover to preview the URL, right-click to open in a new tab, and accessible keyboard navigation.

```

import{Link}from'@stripe/ui-extension-sdk/ui';import{useNavigation}from'@stripe/ui-extension-sdk/navigation';functionCustomerBreadcrumb(){const{createAppRoute}=useNavigation();returnLinkhref={createAppRoute({key:'customers'})}All customers</Link;}

```

`createAppRoute` accepts the same descriptor as `navigateToAppRoute`—an object with the route name as `key` and, for routes with dynamic segments, a `params` object:

```

const{createAppRoute}=useNavigation();createAppRoute({key:'home'});createAppRoute({key:'customers'});createAppRoute({key:'customer', params:{id:'cus_123'}});

```

The route that `createAppRoute` returns isn’t limited to the `Link#href`. Any component that accepts a  as a prop (such as `DetailPage#breadcrumbs`) works with it too. This lets you build navigable UI elements without imperative callbacks:

```

import{DetailPage, PageModule}from'@stripe/ui-extension-sdk/ui';import{useNavigation}from'@stripe/ui-extension-sdk/navigation';functionCustomer({id, name}:{id:string; name:string}){const{createAppRoute}=useNavigation();return(DetailPagetitle={name}breadcrumbs={[{type:'link',
          label:'Customers',
          route:createAppRoute({key:'customers'}),},{type:'label', label: name},]}primaryColumn={PageModuletitle="Details"{/* customer details */}</PageModule}/>);}

```

### Imperative navigation with navigateToAppRoute
Not every navigation originates from a link. Use `navigateToAppRoute` when a user action triggers navigation where a link doesn’t make semantic sense. For example, this can be after a form submission, in an `onPress` callback, or when navigating in response to a data table row click:

```

import{useCallback}from'react';import{useNavigation}from'@stripe/ui-extension-sdk/navigation';import{Box, Link}from'@stripe/ui-extension-sdk/ui';functionCustomerList(){const{navigateToAppRoute}=useNavigation();const handleClick =useCallback((item:{id:string})=>navigateToAppRoute({key:'customer', params:{id: item.id}}),[navigateToAppRoute],);return(Boxcss={{stack:'y', gap:'small'}}LinkonPress={()=>navigateToAppRoute({key:'home'})}
        Back to home
      </LinkLinkonPress={()=>handleClick({id:'cus_123'})}
        View customer
      </Link</Box);}

```

Because of the type registration you set up earlier, TypeScript enforces that `navigateToAppRoute({key: 'customer', params: {id: item.id}})` includes the required `id` parameter, and that `navigateToAppRoute({key: 'home'})` doesn’t accept any. The types flow from your route definitions through to every navigation call—a misspelled route name or a missing parameter is caught at compile time, not at runtime.
## Navigate from non-full-page viewports
Other viewports, such as `stripe.dashboard.drawer.default` and `settings`, can link into your full-page routes with `createAppRoute` and `navigateToDashboardRoute`.
Wrap the view in the same `NavigationProvider`, then use `createAppRoute` to build links:

```

// src/views/Settings.tsximport{Box, Button}from'@stripe/ui-extension-sdk/ui';import{NavigationProvider, useNavigation}from'@stripe/ui-extension-sdk/navigation';importtype{ExtensionContextValue}from'@stripe/ui-extension-sdk/context';import{routes}from'../routes';functionSettingsContent(){const{createAppRoute}=useNavigation();return(Boxcss={{stack:'y', gap:'medium'}}Buttontype="primary"href={createAppRoute({key:'customers'})}
        Manage customers
      </Button</Box);}exportdefaultfunctionSettings(context: ExtensionContextValue){return(NavigationProviderroutes={routes}SettingsContent/></NavigationProvider);}

```

Reuse the same `routes` config you defined for your full-page view so the links resolve to the correct URLs. `createAppRoute({key: 'customers'})` returns a route descriptor that points at your full-page app’s `/customers` URL, so selecting the button takes the user into the full-page view.
To navigate in response to an event instead, pass the route to :

```

import{Button}from'@stripe/ui-extension-sdk/ui';import{navigateToDashboardRoute, useNavigation}from'@stripe/ui-extension-sdk/navigation';functionOpenCustomerButton({id}:{id:string}){const{createAppRoute}=useNavigation();return(ButtononPress={()=>navigateToDashboardRoute(createAppRoute({key:'customer', params:{id}}))}
      Open customer
    </Button);}

```

### API support by viewport
Only the `stripe.dashboard.fullpage` viewport syncs with the Dashboard URL.  
| API  | `stripe.dashboard.fullpage`  | Other viewports  |  
| --- | --- | --- |  
|  `createAppRoute`, `navigateToDashboardRoute`  | Supported  | Supported  |  
|  `navigateToAppRoute`, `Redirect`  | Supported  | Not supported. Use `navigateToDashboardRoute(createAppRoute(...))`.  |  
|  `AppRouter`, `useAppRoute`  | Supported  | Not supported  |  
|  `useAllSearchParams`, `useSearchParam`  | Supported  | Not supported. To open the full-page view with search parameters, pass them to .  |  
## Read the current route
Sometimes you need to know _where_ you are rather than navigate somewhere else. The `useAppRoute()` hook, available in any component rendered inside `AppRouter`, returns the currently active app route. When you check `route.key`, TypeScript narrows `route.routeParams` to the exact configuration declared by that route’s pattern—so you get type-safe access to parameters without casts or assertions:

```

import{useAppRoute}from'@stripe/ui-extension-sdk/navigation';functionCurrentRouteInfo(){const route =useAppRoute();if(route.key ==='customer'){
    console.log(route.routeParams.id);// string — defined on /customers/:id// @ts-expect-error — 'name' doesn't exist on this route
    console.log(route.routeParams.name);}}

```

## Read and write search parameters
A route’s path tells you _which_ view to show, but an app URL also carries so-called [search parameters](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) that follow the `?`. For example, these search parameters might capture the state defining _how_ the current app view is configured: which tab is open, how a list is sorted, which filters are applied. Keep this state in the URL so users can bookmark and share it, but it rarely needs a route of its own.

```

https://dashboard.stripe.com/<ACCOUNT_ID>/app/<APP_ID>/my-customers?status=active&sort=recent
                                                      └────────────┘└────────────────────────┘
                                                      Route path     Search parameters


```

#### Note
Search parameter hooks only sync with the Dashboard URL in the `stripe.dashboard.fullpage` viewport. See .
The `useAllSearchParams()` hook reads and writes this state. It works like React’s `useState`, returning a `[searchParams, setSearchParams]` tuple:

```

import{Button}from'@stripe/ui-extension-sdk/ui';import{useAllSearchParams}from'@stripe/ui-extension-sdk/navigation';functionCustomerFilters(){const[searchParams, setSearchParams]=useAllSearchParams();return(ButtononPress={()=>setSearchParams({status:'archived'})}
      Show archived customers(current:{searchParams.status ??'none'})</Button);}

```

### Replace or merge
The `setSearchParams` function returned by `useAllSearchParams` lets you update the search parameters to a different value.
You can pass the next state of search parameters directly, or a function that calculates it from the previous state.
Pass the next state of search parameters directly when you need to replace the entire set of search parameters:

```

// URL: ?status=active&sort=recentsetSearchParams({status:'archived'});// URL: ?status=archived   — sort is gone

```

Pass a function to update only certain search parameters and keep the rest:

```

// URL: ?status=active&sort=recentsetSearchParams((prev)=>({...prev, status:'archived'}));// URL: ?status=archived&sort=recent

```

Use the function form when a component updates some parameters while preserving others. It reads the latest values when it runs, so two controls don’t overwrite each other.
### Read and write one search parameter
Use `useSearchParam()` when a component reads and writes only one search parameter. Pass the parameter’s name to the hook. It returns a `[value, setValue]` tuple and preserves all other search parameters when you update the value:

```

import{Button}from'@stripe/ui-extension-sdk/ui';import{useSearchParam}from'@stripe/ui-extension-sdk/navigation';functionCustomerStatusFilter(){const[status, setStatus]=useSearchParam('status');const showingArchived = status ==='archived';return(ButtononPress={()=>setStatus(showingArchived ?'active':'archived')}{showingArchived ?'Show active customers':'Show archived customers'}</Button);}

```

Like `setSearchParams`, the setter returned by `useSearchParam` accepts either the next value or a function that calculates it from the previous value. Pass `undefined` to remove the parameter.
Pass `defaultValue` in the options to return a value when the parameter is absent from the URL. The setter’s update function also receives the default as the previous value when the parameter is absent:

```

const[sort, setSort]=useSearchParam('sort',{defaultValue:'desc'});// No sort parameter in the URL: sort is 'desc'.setSort('asc');// URL: ?sort=ascsetSort('desc');// URL: ?sort=desc

```

Calling the setter with the default value writes that value to the URL.
### Encoding and decoding
A URL can only hold text. This means that when you write a search parameter, its value is turned into text and added to the URL (encoded); when you read it, that text is turned back into a value (decoded). A value can be a string, `null`, `undefined`, an array, or a nested object—but not a number or boolean.

```

setSearchParams({
  query:'acme',
  tags:['vip','overdue'],
  range:{from:'2024-01', to:'2024-03'},
  archived:undefined,});

```

is encoded as:

```

?query=acme&tags[0]=vip&tags[1]=overdue&range[from]=2024-01&range[to]=2024-03


```

A few rules follow from this:
  * Arrays get numbered keys (`tags[0]`, `tags[1]`), so their order is kept.
  * Objects nest with bracketed keys (`range[from]`).
  * A value of `undefined` is left out, which is how you remove a parameter.
  * Nullish values, empty arrays or objects, and objects containing only `null` or `undefined` values are omitted from the search state.


Reading gives you the same structure back. Because a value can be a string, an array, or an object, cast it to the shape you saved—and because everything is text, convert numbers yourself:
#### Note
In the Dashboard URL, all of the search parameters your app defines are stored under a special `app` key. The example below appears in the address bar as `?app[query]=acme&app[tags][0]=vip&app[tags][1]=overdue&app[range][from]=2024-01&app[range][to]=2024-03`. This `app` prefix isn’t exposed to your app. Both hooks expose your app’s parameters without this prefix, so use top-level names such as `query` and `tags` directly.

```

const[searchParams]=useAllSearchParams();const tags =(searchParams.tags asstring[])??[];const page =parseInt(searchParams.page ??'1',10);// everything is text, so convert numbers

```

### Link to a route with search parameters
The `createAppRoute` function takes search parameters too, so a link can point at a route with the search parameters already applied. Pass a descriptor with `key` and `searchParams`:

```

import{Link}from'@stripe/ui-extension-sdk/ui';import{useNavigation}from'@stripe/ui-extension-sdk/navigation';functionArchivedCustomersLink(){const{createAppRoute}=useNavigation();return(Linkhref={createAppRoute({
        key:'customers',
        searchParams:{status:'archived'},})}
      Archived customers
    </Link);}

```

Selecting the link opens the `customers` route with `?status=archived` applied. This works anywhere a  is accepted, so you can preset a view from a breadcrumb, a table row, or a menu item.
### Updates replace the current history entry
By default, writing search parameters with either hook replaces the current URL rather than adding a browser history entry, so the back button returns the user to the route they came from. Set `replace` to `false` in the hook options to add a browser history entry instead.
### Example: keep UI state in the URL
The following example keeps a set of selected language tags in the URL. Choose a few and observe how the search parameters are updated in the address bar.
Loading example...

```

import{useCallback, useMemo}from'react';import{useSearchParam}from'@stripe/ui-extension-sdk/navigation';functiontoggleTag(selected: Setstring, tag: string){const updated =newSet(selected);if(updated.has(tag)){
    updated.delete(tag);}else{
    updated.add(tag);}return Array.from(updated);}exportfunctionuseLanguageTags(tagParam: string){const[tags, setTags]=useSearchParam(tagParam,{replace:false});const selected =useMemo(()=>newSet((tags as string[])??[]),[tags]);const toggle =useCallback((tag: string)=>setTags(toggleTag(selected, tag)),[selected, setTags],);return{selected, toggle};}

```

## Handle redirects
As your app evolves, you’ll mostly likely rename or restructure routes. But after an app is published, users might have URLs that they bookmarked or shared that point to the old paths, and those URLs must continue to work. The `Redirect` component solves this. Place it in a route’s render function to transparently forward an old path to its current destination:

```

import{FullPageView}from'@stripe/ui-extension-sdk/ui';import{createRoutes, route, Redirect}from'@stripe/ui-extension-sdk/navigation';import{Home}from'./Home';import{Customers}from'./Customers';import{Customer}from'./Customer';exportconst routes =createRoutes({// Current routes
  home:route('/',()=>(FullPageViewHome/></FullPageView)),
  customers:route('/customers',()=>(FullPageViewCustomers/></FullPageView)),
  customer:route('/customers/:id',({id})=>(FullPageViewCustomerid={id}/></FullPageView)),// Redirects from paths used in v1 of the app
  legacyUsers:route('/users',()=>Redirectroute={{key:'customers'}}/>),
  legacyUser:route('/users/:id',({id})=>(Redirectroute={{key:'customer', params:{id}}}/>)),});

```

`Redirect` immediately navigates to the route specified by `key`, forwarding any `params`. The user never sees the intermediate route, which means they go directly to the destination. As a general rule, if a URL was supported in any published version of your app, keep a redirect route for the old path so that bookmarks, shared links, and external references remain functional after you make route changes.
## See also
  *   * 

On this page
[Enable type-safe navigation](https://docs.stripe.com/stripe-apps/routing#enable-type-safe-navigation "Enable type-safe navigation")
[Provide routes with NavigationProvider](https://docs.stripe.com/stripe-apps/routing#provide-routes-with-navigationprovider "Provide routes with NavigationProvider")
[Redirect on unmatched routes](https://docs.stripe.com/stripe-apps/routing#redirect-on-unmatched-routes "Redirect on unmatched routes")
[Declarative navigation with Link](https://docs.stripe.com/stripe-apps/routing#declarative-navigation-with-link "Declarative navigation with Link")
[Imperative navigation with navigateToAppRoute](https://docs.stripe.com/stripe-apps/routing#imperative-navigation-with-navigatetoapproute "Imperative navigation with navigateToAppRoute")
[Navigate from non-full-page viewports](https://docs.stripe.com/stripe-apps/routing#navigate-from-non-fullpage-viewports "Navigate from non-full-page viewports")
[Read and write search parameters](https://docs.stripe.com/stripe-apps/routing#read-and-write-search-parameters "Read and write search parameters")
[Read and write one search parameter](https://docs.stripe.com/stripe-apps/routing#read-and-write-one-search-parameter "Read and write one search parameter")
[Link to a route with search parameters](https://docs.stripe.com/stripe-apps/routing#link-to-a-route-with-search-parameters "Link to a route with search parameters")
[Updates replace the current history entry](https://docs.stripe.com/stripe-apps/routing#updates-replace-the-current-history-entry "Updates replace the current history entry")
[Example: keep UI state in the URL](https://docs.stripe.com/stripe-apps/routing#example-keep-ui-state-in-the-url "Example: keep UI state in the URL")
