[Skip to content](https://docs.stripe.com/stripe-apps/components#main-content)
Components
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
Components


[Custom objects](https://docs.stripe.com/custom-objects)
Security and privacy
[Activity logs](https://docs.stripe.com/activity-logs)[Stripebot web crawler](https://docs.stripe.com/stripebot-crawler)
Partners
[Partner certification](https://docs.stripe.com/partners/training-and-certification)
#  UI components
## Use the Stripe components library to build your user interface.
Ask about this page
Copy for LLMView as Markdown
Set up agent
If your app needs a front end, use this reference documentation to compose a UI. The Stripe library of prebuilt components has customizable properties to help you build apps aligned with Stripe best practices. Use components to structure layouts and create graphical or interactive interfaces in your apps.
## 
Every  needs a view component. These determine which view of your app the user sees at different moments, similar to different HTML pages of a website.
The most common view is `ContextView`. When a user begins a workflow or task in your app, switch their view to `FocusView` to hide the background details. To design your app settings page, use `SettingsView`. To design a sign in screen, use `SignInView`. To build a , use `FullPageView`.
Some views are root components. `ContextView`, `FullPageView`, `SettingsView`, and `SignInView` are view roots—the foundational components that contain all other UI elements—whereas `FocusView` is a child component of `ContextView`.  
| Component   | Description  |  
| --- | --- |  
|   | ContextView allows apps to render next to Stripe content in a drawer so users can look at them side by side and share context.  |  
|   | Use FullPageView to render your app in a full-page viewport.  |  
|   | Use OnboardingView to guide users through an onboarding flow in your app.  |  
|   | Use SettingsView to let users to change details about how the app works with their account.  |  
|   | Use SignInView to display a sign in screen to users.  |  
## 
Use layout components to create the structure of your pages and elements.  
| Component   | Description  |  
| --- | --- |  
| Use boxes to wrap other components and add custom styles and layouts.  |  
|   | Use DetailPage to implement detail-style layouts in your app.  |  
|   | Render a simple horizontal rule with the divider component.  |  
|   | Use OverviewPage to implement overview-style layouts in your app.  |  
## Navigation
Use navigation components to help users wayfind and interact with your app.  
| Component   | Description  |  
| --- | --- |  
|   | Buttons allow users to take actions in Stripe products, and you can use them to direct users’ attention or warn them of outcomes.  |  
|   | Use ButtonGroup to handle the layout for multiple buttons and collapse them into an overflow menu when space is limited.  |  
| Links are used for navigating users from one page to another, and for actions that need more subtlety than a button provides.  |  
| A menu presents a group of actions that a user can choose from, often related to a particular object or context.  |  
| Use tabs to display sections of content.  |  
## Content 
Use content components to organize and place information within your app.  
| Component   | Description  |  
| --- | --- |  
|   | Use accordions to split long or complex content into collapsible chunks.  |  
|   | Use badges to indicate states that an item or object might move through or change to.  |  
|   | Use the Banner to show a variety of alerts or messages you want to make explicit to the user.  |  
| Use chips to display and allow users to manipulate values.  |  
| Use Code to display code snippets, terminal output, keyboard input, and other technical content.  |  
|   | Use DataTable to display tabular data with sorting, filtering, and pagination.  |  
|   | Use FocusView to open a dedicated space for the end user to complete a specific task.  |  
| Display an icon graphic in a compatible format.  |  
| Display images with the Img UI component.  |  
|   | Use the inline component to style inline content such as text.  |  
| Display a list of information in a variety of preconfigured formats.  |  
|   | Use PropertyList to display data as key-value pairs.  |  
|   | Use the Spinner component to indicate something is loading.  |  
|   | Display rows and columns of data.  |  
|   | Use TaskList to help users track progress through a list of tasks.  |  
|   | Inform users of temporary status.  |  
|   | Use Tooltips to provide additional contextual information about a particular element or subject.  |  
## 
Use form components to compose input fields and controls that require user input. For example, use them to create checklists or to enable users to select settings.  
| Component   | Description  |  
| --- | --- |  
|   | Use checkboxes to indicate or control boolean values.  |  
|   | Use CurrencyField for handling payment amounts.  |  
|   | Use DateField to create a date input field.  |  
|   | Use DateRangePicker to collect a date range from users.  |  
|   | Group form fields with the FormFieldGroup component.  |  
|   | Use Radios to make a selection from a mutually exclusive set of options.  |  
|   | Use SearchField to let users search and filter content in your app.  |  
|   | Use Select to pick from a set of options in a dropdown.  |  
|   | Similar to Checkboxes, you can use Switches to indicate or control boolean values.  |  
|   | Use TextArea to create an input field for multiple lines of text.  |  
|   | Use TextField to create a text input field.  |  
## 
Use chart components to map data points visually. For example, use a chart in your app to help users track payments data or compare progress over time.  
| Component   | Description  |  
| --- | --- |  
|   | A bar chart visualizes data as a series of data points using bars.  |  
|   | A line chart visualizes data as a series of data points connected into a line.  |  
|   | A type of line chart to display data succinctly as a simple line.  |  
|   | A meter chart displays a whole divided into segments, each representing a proportion of the total.  |  
## See also
  *   *   * 

On this page
