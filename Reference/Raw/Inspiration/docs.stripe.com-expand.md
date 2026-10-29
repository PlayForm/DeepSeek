[Skip to content](https://docs.stripe.com/expand#main-content)
Expand responses
[Overview](https://docs.stripe.com/development)
Versioning
[Upgrade your integration](https://docs.stripe.com/upgrades)[How API versioning works](https://docs.stripe.com/api-versions)
Essentials
Authentication
[Workload Identity Federation](https://docs.stripe.com/workload-identity-federation)
[Domains and IP addresses](https://docs.stripe.com/ips)
Make requests
Expand responses
Testing and data
Error handling


Tools
[Provisioning](https://docs.stripe.com/provisioning) [Stripe for Visual Studio Code](https://docs.stripe.com/stripe-vscode) [Stripe Discord server](https://docs.stripe.com/discord)
Features
[Stripe health alerts](https://docs.stripe.com/health-alerts)[File uploads](https://docs.stripe.com/file-upload)
AI tools
[Agent plugins](https://docs.stripe.com/agents/plugin)[Model Context Protocol](https://docs.stripe.com/mcp)[Agent skills](https://docs.stripe.com/skills)[Stripe Directory](https://docs.stripe.com/directory)
Extend Stripe
[Custom objects](https://docs.stripe.com/custom-objects)
Security and privacy
[Activity logs](https://docs.stripe.com/activity-logs)[Stripebot web crawler](https://docs.stripe.com/stripebot-crawler)
Partners
[Partner certification](https://docs.stripe.com/partners/training-and-certification)
#  Expanding responses
## Learn how to reduce the number of requests you make to the Stripe API by expanding objects in responses.
Ask about this page
Copy for LLMView as Markdown
Set up agent
This guide describes how to request additional properties from the API. You’ll learn to modify your requests to include:
  * properties from related objects
  * properties from distantly related objects
  * additional properties on all objects in a list
  * properties that aren’t included by default in a response


## How it works 
The Stripe API is organized into resources represented by objects with state, configuration, and contextual properties. These objects all have unique IDs that you can use to retrieve, update, and delete them. The API also uses these IDs to link related objects together. A [Checkout Session](https://docs.stripe.com/api/checkout/sessions/object), for example, links to a [Customer](https://docs.stripe.com/api/customers/object) by the [Customer ID](https://docs.stripe.com/api/checkout/sessions/object#checkout_session_object-customer).
#### Note
If you represent your customers as customer-configured [Account](https://docs.stripe.com/api/v2/core/accounts/object) objects instead of [Customer](https://docs.stripe.com/api/customers/object) objects, use the [include](https://docs.stripe.com/api/v2/core/accounts/create#v2_create_accounts-include) parameter instead of `expand`.

```

{"id":"cs_test_KdjLtDPfAjT1gq374DMZ3rHmZ9OoSlGRhyz8yTypH76KpN4JXkQpD2G0","object":"checkout.session",
  ...
  "customer":"cus_HQmikpKnGHkNwW",
  ...
}

```

In cases where you need information from a linked object, you can retrieve the linked object in a new call using its ID. However, this approach requires two API requests to access just one value. If you need information from multiple linked objects, each would also require separate requests, which all adds to the latency and complexity of your application.
The API has an Expand feature that allows you to retrieve linked objects in a single call, effectively replacing the object ID with all its properties and values. For example, say you wanted to access details on a customer tied to a given Checkout Session. You would retrieve the Checkout Session and pass the `customer` property to the `expand` array, which tells Stripe to include the entire Customer object in the response:
Command Line
cURL
cURL
Stripe CLI
Ruby
Python
PHP
Java
Node.js
Go
.NET

```

curl -Ghttps://api.stripe.com/v1/checkout/sessions/
{{SESSION_ID}}
  -u"sk_test_...:"  -d"expand[]=customer"

```

Which returns the Checkout Session with the full Customer object instead of its ID:

```

{"id":"cs_test_KdjLtDPfAjT1gq374DMZ3rHmZ9OoSlGRhyz8yTypH76KpN4JXkQpD2G0","object":"checkout.session",
  ...
  "customer":{"id":"cus_HQmikpKnGHkNwW","object":"customer",
    ...
    "metadata":{"user_id":"user_xyz"},
    ...
  }}

```

#### Note
Not all properties can be expanded. The API reference marks expandable properties with the “Expandable” label.
## Expanding multiple properties 
To expand multiple properties in one call, add additional items to the expand array. For example, if you want to expand both the [customer](https://docs.stripe.com/api/checkout/sessions/object#checkout_session_object-customer) and the [payment_intent](https://docs.stripe.com/api/checkout/sessions/object#checkout_session_object-payment_intent) for a given Checkout Session, you would pass `expand` an array with both the `customer` and `payment_intent` strings:
Command Line
cURL
cURL
Stripe CLI
Ruby
Python
PHP
Java
Node.js
Go
.NET

```

curl -Ghttps://api.stripe.com/v1/checkout/sessions/
{{SESSION_ID}}
  -u"sk_test_...:"  -d"expand[]=customer" \
  -d"expand[]=payment_intent"

```

## Expanding multiple levels 
If the value you want is nested deeply across multiple linked resources, you can reach it by recursively expanding using dot notation. For instance, if you needed to know the type of payment method that was used for a given Checkout Session, you would first retrieve the Checkout Session’s payment intent, then retrieve the payment intent’s linked payment method to get its type. With `expand`, you can do this in one call:
Command Line
cURL
cURL
Stripe CLI
Ruby
Python
PHP
Java
Node.js
Go
.NET

```

curl -Ghttps://api.stripe.com/v1/checkout/sessions/
{{SESSION_ID}}
  -u"sk_test_...:"  -d"expand[]=payment_intent.payment_method"

```

Which returns the Checkout Session with the full [PaymentIntent](https://docs.stripe.com/api/payment_intents/object) and [PaymentMethod](https://docs.stripe.com/api/payment_methods/object) objects instead of their IDs:

```

{"id":"cs_test_KdjLtDPfAjT1gq374DMZ3rHmZ9OoSlGRhyz8yTypH76KpN4JXkQpD2G0","object":"checkout.session",
  ...
  "mode":"payment","payment_intent":{"id":"pi_1GkXXDLHughnNhxyLlsnvUuY","object":"payment_intent","amount":100,
    ...
    "charges":{...},"client_secret":"pi_1GkXXDLHughnNhxyLlsnvUuY_secret_oLbwpm0ME0ieJ9Aykz2SwKzj5",
    ...
    "payment_method":{"id":"pm_1GkXXuLHughnNhxy8xpAdGtf","object":"payment_method","billing_details":{...},"card":{...},

```

See all 49 lines
#### Note
Expansions have a maximum depth of four levels. Meaning that an `expand` string can contain no more than four properties: `property1.property2.property3.property4`.
## Expanding properties in lists 
When the API returns a list of objects, you can use the `data` keyword to expand a given property on each object in that list. For example, say you need information about the payment methods used by one of your customers. To get this information, you would [list the customer’s PaymentIntents](https://docs.stripe.com/api/payment_intents/list#list_payment_intents-customer), which returns an object with the following structure:

```

{"object":"list","data":[{"id":"pi_1GrvBKLHughnNhxy6N28q8gt","object":"payment_intent","amount":1000,"payment_method":"pm_1GrvBxLHughnNhxyJjtBtHcc",},

```

See all 23 lines
#### Note
All lists returned in the API have the above structure, where the `data` property contains the array of objects being listed. You can use the `data` keyword in any position in an expand string to move the expand cursor into the list.
Rather than looping through each payment intent in the list and retrieving the linked payment methods in separate calls, you can expand all the payment methods at once using the `data` keyword:
Command Line
cURL
cURL
Stripe CLI
Ruby
Python
PHP
Java
Node.js
Go
.NET

```

curl -Ghttps://api.stripe.com/v1/payment_intents  -u"sk_test_...:"  -d"customer=
{{CUSTOMER_ID}}
" \
  -d"expand[]=data.payment_method"

```

The list then includes the full payment method object on each payment intent:

```

{"object":"list","data":[{"id":"pi_1GrvBKLHughnNhxy6N28q8gt","object":"payment_intent","amount":1000,"payment_method":{"id":"pm_1GrvBxLHughnNhxyJjtBtHcc","object":"payment_method","billing_details":{...},"card":{"brand":"visa",
          ...

```

See all 65 lines
#### Note
Expanding responses has performance implications. To keep requests fast, try to limit many nested expansions on list requests.
## Using expansion to request includable properties
In some cases, resources have properties that aren’t included by default. One example is the Checkout Session’s [line_items](https://docs.stripe.com/api/checkout/sessions/object#checkout_session_object-line_items) property, which is only included in responses if requested using the `expand` parameter, for example:
Command Line
cURL
cURL
Stripe CLI
Ruby
Python
PHP
Java
Node.js
Go
.NET

```

curl -Ghttps://api.stripe.com/v1/checkout/sessions/
{{SESSION_ID}}
  -u"sk_test_...:"  -d"expand[]=line_items"

```

## Expansion with webhooks 
You can’t receive  events with properties auto-expanded. Objects sent in events are always in their minimal form. To access nested values in expandable properties, you must retrieve the object in a separate call within your webhook handler.
## Expansion with TypeScript 
When using the [stripe-node](https://github.com/stripe/stripe-node) SDK with TypeScript, expandable field types are `string | Foo` (where `Foo` is the type of the expanded object). This union type reflects the fact that the field can hold either an unexpanded ID string or a full expanded object. After you expand a field, you must cast it to the appropriate object type to access its properties. This cast is necessary because TypeScript can’t infer at compile time whether a field contains an ID string or a full expanded object. Without the cast, TypeScript treats the field as `string | Stripe.Customer | Stripe.DeletedCustomer | null` and prevents direct property access.
For example, to access the email address of an expanded `customer` field on a `PaymentIntent`:

```

const paymentIntent =await stripe.paymentIntents.retrieve('pi_123456789',{
    expand:['customer'],});// Cast the expanded field to the expected object type to access its propertiesconst customerEmail:string|null=(paymentIntent.customer as Stripe.Customer).email;

```

On this page
[Expanding multiple properties](https://docs.stripe.com/expand#multiple-properties "Expanding multiple properties")
[Expanding multiple levels](https://docs.stripe.com/expand#multiple-levels "Expanding multiple levels")
[Expanding properties in lists](https://docs.stripe.com/expand#lists "Expanding properties in lists")
[Using expansion to request includable properties](https://docs.stripe.com/expand#includable-properties "Using expansion to request includable properties")
[Expansion with TypeScript](https://docs.stripe.com/expand#with-typescript "Expansion with TypeScript")
