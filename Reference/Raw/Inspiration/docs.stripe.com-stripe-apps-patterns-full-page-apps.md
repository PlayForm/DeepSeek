[Skip to content](https://docs.stripe.com/stripe-apps/patterns/full-page-apps#main-content)
Full-page apps
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
Distribute your app
[Navigate with route descriptors](https://docs.stripe.com/stripe-apps/route-descriptors)
[Assign roles in UI extensions](https://docs.stripe.com/stripe-apps/using-roles-in-ui-extensions)
Embedded components
[Embed third-party Stripe Apps](https://docs.stripe.com/stripe-apps/embedded-apps)
Migrating to Stripe Apps
[Migrate or build a Connect extension](https://docs.stripe.com/stripe-apps/migrate-connect-extension)
[Migrate a plugin to Stripe Apps or Stripe Connect](https://docs.stripe.com/stripe-apps/plugins/decide-migration)
Reference
[Design patterns](https://docs.stripe.com/stripe-apps/patterns)


[Custom objects](https://docs.stripe.com/custom-objects)
Security and privacy
[Activity logs](https://docs.stripe.com/activity-logs)[Stripebot web crawler](https://docs.stripe.com/stripebot-crawler)
Partners
[Partner certification](https://docs.stripe.com/partners/training-and-certification)
[Public preview](https://docs.stripe.com/release-phases)
#  Full-page 
## Build a custom Stripe Dashboard page with tabbed navigation, list-to-detail flows, and data visualization.
Ask about this page
Copy for LLMView as Markdown
Set up agent
Full-page apps give you an entire page in the Stripe Dashboard. This provides room for tabbed navigation, overview dashboards, list-to-detail flows, and data visualization. This guide describes key design patterns for building a full-page app view.
## Before you begin
Before you build a full-page app, make sure your app meets these requirements:
  * or use an existing one.
  * Install `@stripe/ui-extension-sdk` version `9.2.1` or later.
  * Install the latest version of the .
  * Add a `stripe.dashboard.fullpage` to your app.
  * Review and download the [example app](https://github.com/stripe/stripe-apps/tree/main/examples/full-page) on GitHub for detailed code examples.
  * Review the  for full details on `createRoutes`, `AppRouter`, `useAppRoute`, and `useNavigation`.


## Apply best practices
Keep these principles in mind when you design a full-page app:
  * **Organized** : Structure your app into logical tabs that represent distinct areas of your workflow. Each tab serves a clear purpose so users always know where to find what they need.
  * **Progressive** : Lead with a high-level overview and let users discover details at their own pace. Don’t overwhelm users with all information at once.
  * **Consistent** : Follow the layout and navigation patterns used by native Stripe Dashboard pages.
  * **Connected** : Connect your full-page app to other parts of your Stripe Apps. If your app also uses a drawer view or settings page, provide clear pathways between them.


## Set up your full-page view
Every full-page app wraps its content in the  component. This renders the Dashboard page header that displays your app’s identity and actions.
The page header pulls from your `stripe-app.json`:
  * **App name** : The `name` field.
  * **App icon** : The `icon` field.
  * **Page action** : An optional primary button. See the  component for the `pageAction` prop.
  * **Settings** : Appears automatically to let users navigate to app settings.


Your `stripe-app.json` must include a `stripe.dashboard.fullpage` viewport:

```

{"name":"Ride management","icon":"./assets/icon.png","ui_extension":{"views":[{"viewport":"stripe.dashboard.fullpage","component":"FullpageView"}]}}

```

The `component` field maps to your view file in `src/views/`.
## Structure your page with tabs
Use `Tabs` and `Tab` from `@stripe/ui-extension-sdk/ui/next` to organize content into sections. Full-page apps use  to map URLs to views. This gives users bookmarkable URLs, browser back/forward navigation, and shareable links to specific tabs.
Start by defining your route config with a `/:tabId?` pattern so the selected tab persists in the URL:

```

exportconst routes =createRoutes({
  home:route('/:tabId?',()=>(FullPageViewHome/></FullPageView)),
  customer:route('/customers/:id',({id})=>(FullPageViewCustomerDetailid={id}/></FullPageView)),});

```

See the  for the full setup, including `AppRouter`, type-safe navigation with `RouteRegister`, path patterns, and `redirectOnNotFound`.
Then wire the selected tab to your route parameter:

```

import{useAppRoute, useNavigation}from'@stripe/ui-extension-sdk/navigation';import{Tab, Tabs}from'@stripe/ui-extension-sdk/ui/next';import{OverviewTab}from'./tabs/OverviewTab';import{CustomersTab}from'./tabs/CustomersTab';constDEFAULT_TAB='overview';exportfunctionHome(){const{routeParams, key}=useAppRoute();const{navigateToAppRoute}=useNavigation();const currentTab =(key ==='home' routeParams.tabId)||DEFAULT_TAB;return(TabsselectedKey={currentTab}onSelectionChange={(tabId)=>navigateToAppRoute('home',{tabId})}Tabid="overview"label="Overview"OverviewTab/></TabTabid="customers"label="Customers"CustomersTab/></Tab</Tabs);}

```

This pattern connects tabs to routing in three steps:
  1. **Read the current tab from the route** : `useAppRoute()` returns `routeParams` and `key` directly. Check `key === 'home'` first to narrow the type, then fall back to `DEFAULT_TAB` when no tab is specified (the `/` root URL).
  2. **Control the selected tab** : Pass the resolved tab ID to `selectedKey` so the Tabs component renders the correct panel.
  3. **Update the route on tab change** : Pass `navigateToAppRoute` to `onSelectionChange` so selecting a tab updates the URL from `/` to `/customers`.


This means navigating directly to a URL like `/customers` renders the correct tab automatically, and the browser’s back and forward buttons move between tabs.
## Build an overview tab
An overview tab gives users a high-level summary of activity across your app. Use the  component to structure a two-column layout with summary metrics, charts, and sidebar modules.

```

import{
  Box,
  Inline,
  OverviewPage,
  PageModule,
  Spinner,}from'@stripe/ui-extension-sdk/ui';import{LineChart, MeterChart}from'@stripe/ui-extension-sdk/ui/next';exportfunctionOverviewTab(){if(isLoading){return(Boxcss={{stack:'y', alignX:'center', alignY:'center', height:'fill', paddingTop:'xxlarge'}}Spinnersize="large"/></Box);}return(OverviewPageprimaryColumn={PageModuletitle="Growth"Boxcss={{height:182}}LineChartdata={growthData}/></Box</PageModule</}secondaryColumn={PageModuletitle="Distribution"MeterChart data={tierData} legendEnabled unitFormat={{unit:'number', options:{}}}/></PageModule</}/);}

```

Place the  inside the tab component so the tab bar remains visible and interactive while content loads.
## Build a list view
Use the  component to display structured data with sortable columns, status indicators, and clickable rows. Use `navigateToAppRoute` to navigate to a detail view when a user clicks a row.

```

import{useNavigation}from'@stripe/ui-extension-sdk/navigation';import{DataTable}from'@stripe/ui-extension-sdk/ui';exportfunctionCustomersTab(){const{navigateToAppRoute}=useNavigation();return(DataTable
      columns={[{key:'name', label:'Name'},{key:'email', label:'Email'},{key:'status', label:'Status', cell:{type:'status', statusMap:{Active:'positive','At risk':'warning', Churned:'negative'}}},]}
      items={customers}
      onRowClick={(item)=>navigateToAppRoute('customer',{id: item.id})}
      pagination={{pageSize:10}}
      emptyMessage={{
        message:'No customers yet.',
        action:{label:'Add customer', href:'https://dashboard.stripe.com/customers/create'},}}/);}

```

Include an `emptyMessage` prop to handle . If your list supports , swap the `emptyMessage` based on whether filters are active.
## Build a detail view
When a user selects an item from a list, the router renders the detail route. Use the  component to structure the detail view with breadcrumbs, a two-column layout, and page-level actions.

```

import{DetailPage, PageModule}from'@stripe/ui-extension-sdk/ui';import{useNavigation}from'@stripe/ui-extension-sdk/navigation';exportfunctionCustomerDetail({id}){const{createAppRoute}=useNavigation();const customer =useCustomer(id);return(DetailPagetitle={customer.name}breadcrumbs={[{type:'link', label:'Customers', route:createAppRoute('home',{tabId:'customers'})},{type:'label', label: customer.name},]}primaryColumn={PageModuletitle="Overview"{/* Primary content */}</PageModule}secondaryColumn={PageModuletitle="Details"{/* Sidebar content */}</PageModule}/>);}

```

Because the detail view is its own route, the tab bar isn’t visible. The breadcrumb provides the path back to the list. See the  for more on `createAppRoute` and declarative navigation.
## Build create and edit flows
When users create a new item or edit an existing one, use a  drawer. The drawer overlays the current view without interrupting the user’s place in the app.
Use the component’s `pending` prop to indicate that a save operation is in progress.

```

import{useState}from'react';import{Button, FocusView, TextField}from'@stripe/ui-extension-sdk/ui';functionCreateItemForm({shown, setShown}){const[isSaving, setIsSaving]=useState(false);consthandleSave=async()=>{setIsSaving(true);try{awaitsaveItem();setShown(false);}finally{setIsSaving(false);}};return(FocusViewtitle="Create item"shown={shown}setShown={setShown}TextFieldlabel="Name"/>Buttontype="primary"onPress={handleSave}pending={isSaving}
        Create item
      </Button</FocusView);}

```

## See also
  *   *   * 

On this page
[Set up your full-page view](https://docs.stripe.com/stripe-apps/patterns/full-page-apps#set-up-your-full-page-view "Set up your full-page view")
[Structure your page with tabs](https://docs.stripe.com/stripe-apps/patterns/full-page-apps#structure-your-page-with-tabs "Structure your page with tabs")
[Build create and edit flows](https://docs.stripe.com/stripe-apps/patterns/full-page-apps#build-create-and-edit-flows "Build create and edit flows")
