# API Reference

Find anything - Ask AI (sidebar search widgets removed)

[Include-dependent response values (API v2)](https://docs.stripe.com/api/include_dependent_response_values)

Core Resources

* [Accounts (v2)](https://docs.stripe.com/api/v2/core/accounts)
* [Account Links (v2)](https://docs.stripe.com/api/v2/core/account-links)
* [Account Tokens (v2)](https://docs.stripe.com/api/v2/core/account-tokens)
* [Events (v2)](https://docs.stripe.com/api/v2/core/events)
* [Event Destinations (v2)](https://docs.stripe.com/api/v2/core/event-destinations)
* [Persons (v2)](https://docs.stripe.com/api/v2/core/persons)
* [Person Tokens (v2)](https://docs.stripe.com/api/v2/core/person-tokens)
* [Stripe Balance Debit Agreements](https://docs.stripe.com/api/stripe_balance_debit_agreements)

Payment Methods

* [Payment Method Configurations](https://docs.stripe.com/api/payment_method_configurations)

Products

Product Catalog

Agentic Commerce

* [Shared Payment Issued Tokens](https://docs.stripe.com/api/shared-payment/issued-token)
* [Shared Payment Granted Tokens](https://docs.stripe.com/api/shared-payment/granted-token)

Checkout

Payment Links

Billing

* [Customer Balance Transactions](https://docs.stripe.com/api/customer_balance_transactions)
* [Customer Portal Configurations](https://docs.stripe.com/api/customer_portal/configurations)
* [Meter Event Adjustments (v2)](https://docs.stripe.com/api/v2/billing/meter-event-adjustments)
* [Meter Event Streams (v2)](https://docs.stripe.com/api/v2/meter-event-streams)
* [Meter Events (v2)](https://docs.stripe.com/api/v2/meter-events)

Capital

Connect

## Overview

The Stripe API is organized around [REST](https://en.wikipedia.org/wiki/Representational_State_Transfer). Our API has predictable resource-oriented URLs, accepts [form-encoded](https://en.wikipedia.org/wiki/POST_\(HTTP\)#Use_for_submitting_web_forms) request bodies, returns [JSON-encoded](https://www.json.org/) responses, and uses standard HTTP response codes, authentication, and verbs.

You can use the Stripe API in [sandboxes](https://docs.stripe.com/sandboxes) without affecting your live data or interacting with banking networks. The API key that you use to [authenticate](https://docs.stripe.com/api/authentication) the request determines whether the request runs in live mode or in a sandbox. Sandboxes support all v2 APIs. Test mode sandboxes support some [v2 APIs](https://docs.stripe.com/testing-use-cases#compare).

The Stripe API doesn't support bulk updates. You can work on only one object per request.

The Stripe API differs for every account as we release new [versions](https://docs.stripe.com/api/versioning) and tailor functionality. [Log in](https://dashboard.stripe.com/login?redirect=https%3A%2F%2Fdocs.stripe.com%2Fapi) to see docs with your test key and data.

## Authentication

The Stripe API uses [API keys](https://docs.stripe.com/keys) to authenticate requests. You can view and manage your API keys in [the Stripe Dashboard](https://dashboard.stripe.com/login?redirect=/apikeys).

Test mode secret keys start with `sk_test_` and have unrestricted access to their sandboxes. In live mode, you configure a [restricted API key](https://docs.stripe.com/keys#create-restricted-api-key) (starts with `rk_live_`) with specific API permissions. Using a restricted API key with only a subset of API permissions limits the damage a bad actor could cause if they obtained the key. In both test mode and live mode, you can create as many restricted API keys as you need for different use cases or components of your application. We also create a live mode secret key (starts with `sk_live_`) that grants access to all Stripe API resources. To protect your business, use restricted API keys instead.

Your API keys carry many privileges. Follow [best practices](https://docs.stripe.com/keys-best-practices) to keep your keys safe. Don't embed secret or restricted API keys in source code or client-side applications. Instead, use your server platform's secrets vault to provide keys to your server-side applications. If your platform doesn't offer a secrets vault, set your keys in environment variables.

For added security, [Workload Identity Federation](https://docs.stripe.com/workload-identity-federation) lets your service authenticate without storing a long-lived API key. Your service exchanges a short-lived identity token from its cloud provider for a Stripe access token that expires after 1 hour.

The Stripe API authenticates requests using [HTTP Basic Auth](https://en.wikipedia.org/wiki/Basic_access_authentication). Provide your API key as the basic auth username value. You don't need to provide a password.

If you need to authenticate using bearer auth (for example, for a cross-origin request), use `-H "Authorization: Bearer sk_test_..."` instead of `-u sk_test_...`.

Make all API requests over [HTTPS](https://en.wikipedia.org/wiki/HTTP_Secure). Calls made over plain HTTP fail. API requests without authentication also fail.

## Errors

Stripe uses conventional HTTP response codes to indicate the success or failure of an API request. In general:

* Codes in the `2xx` range indicate success.
* Codes in the `4xx` range indicate an error that failed given the information provided. For example, an omitted required parameter, a failed charge, or a [declined](https://docs.stripe.com/declines) card.
  * Many of these include an [error code](https://docs.stripe.com/error-codes) that briefly explains the error reported.
  * See [Error handling](https://docs.stripe.com/error-handling) for guidance.
* Codes in the `5xx` range indicate an error with the Stripe servers (these are rare).

### Attributes

* #### code (nullable string)

  For some errors that could be handled programmatically, a short string indicating the [error code](https://docs.stripe.com/error-codes) reported.

* #### decline_code (nullable string)

  For card errors resulting from a card issuer decline, a short string indicating the [card issuer's reason for the decline](https://docs.stripe.com/declines#issuer-declines) if they provide one.

* #### message (nullable string)

  A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.

* #### param (nullable string)

  If the error is parameter-specific, the parameter related to the error. For example, you can use this to display a message near the correct form field.

* #### payment_intent (nullable object)

  The [PaymentIntent object](https://docs.stripe.com/api/payment_intents/object) for errors returned on a request involving a PaymentIntent.

* #### type (enum)

  The type of error returned. One of `api_error`, `card_error`, `idempotency_error`, or `invalid_request_error`.

  Possible enum values:

  | | |
  | --- | --- |
  | `api_error` | |
  | `card_error` | |
  | `idempotency_error` | |
  | `invalid_request_error` | |

### More

* #### advice_code (nullable string)
* #### charge (nullable string)
* #### doc_url (nullable string)
* #### network_advice_code (nullable string)
* #### network_decline_code (nullable string)
* #### payment_method (nullable object)
* #### payment_method_type (nullable string)
* #### request_log_url (nullable string)
* #### setup_intent (nullable object)
* #### source (nullable object)

Our client libraries raise exceptions for many reasons, such as a failed charge, invalid parameters, authentication errors, and network unavailability. We recommend writing code that gracefully handles all possible API exceptions.

* Related guide: [Error Handling](https://docs.stripe.com/error-handling)

## Expanding responses

Many objects allow you to request additional information as an expanded response by using the `expand` request parameter. This parameter is available on all API requests, and applies to the response of that request only. You can expand responses in two ways: by expanding the ID of a related object that appears in the response, or by requesting a field that isn't included by default. For example, a `Charge` might have an associated `Customer` ID that you can expand in line using the `expand` request parameter-the `expandable` label in this documentation indicates which ID fields you can expand into objects. Some fields, such as the `number` and `cvc` fields for the `Issuing Card` object, aren't included in the response by default, but you can request them the same way.

You can expand recursively by specifying nested fields after a dot (.). For example, requesting `payment_intent.customer` on a charge expands the `payment_intent` property into a full `PaymentIntent` object, then expands the `customer` property on that payment intent into a full `Customer` object. You can expand multiple objects at the same time by including multiple items in the `expand` array, up to a maximum depth of four levels-for example, the deepest expansion allowed when listing charges is `data.payment_intent.customer.default_source`.

You can use the `expand` parameter on any endpoint that returns expandable fields, including list, create, and update endpoints. Expansions on list requests start with the `data` property-for example, you can expand `data.customers` on a request to list charges and associated customers. Performing deep expansions on numerous list requests might result in slower processing times.

* Related guide: [Expanding responses](https://docs.stripe.com/expand)
* Related video: [Expand](https://www.youtube.com/watch?v=m8Vj_CEWyQc)

## Idempotency

The API supports [idempotency](https://en.wikipedia.org/wiki/Idempotence) for safely retrying requests without accidentally performing the same operation twice. When creating or updating an object, use an idempotency key. Then, if a connection error occurs, you can safely repeat the request without risk of creating a second object or performing the update twice.

To perform an idempotent request, provide an additional `IdempotencyKey` element to the request options.

For API v1, Stripe saves the status code and body of the first request made with a given idempotency key after endpoint execution begins. Retries with the same key return the saved response, including `500` errors. With [API v2](https://docs.stripe.com/api-v2-overview#idempotency), retries don't repeat successful operations. Stripe retries failed or partially failed work to completion when possible and returns an updated response. If a retry can't succeed, Stripe returns an error explaining why.

A client generates an idempotency key, which is a unique key that the server uses to recognize subsequent retries of the same request. How you create unique keys is up to you, but we suggest using V4 UUIDs, or another random string with enough entropy to avoid collisions. Idempotency keys are up to 255 characters long. Avoid using sensitive data (for example, email addresses or personal identifiers) as idempotency keys.

For API v1, you can remove keys from the system automatically after they're at least 24 hours old. We generate a new request if a key is reused after the original is pruned. The idempotency layer compares incoming parameters to those of the original request and errors if they're not the same to prevent accidental misuse.

For API v1, we save results only after the execution of an endpoint begins. If incoming parameters fail validation, or the request conflicts with another request that's executing concurrently, we don't save the idempotent result because no API endpoint initiates the execution. You can retry these requests. Learn more about when you can [retry idempotent requests](https://docs.stripe.com/error-low-level#idempotency).

For API v1, all `POST` requests accept idempotency keys. Don't send idempotency keys in `GET` and `DELETE` requests because it has no effect. These requests are idempotent by definition.

## Include-dependent response values (API v2)

Some API v2 responses contain null values for certain properties by default, regardless of their actual values. That reduces the size of response payloads while maintaining the basic response structure. To retrieve the actual values for those properties, specify them in the `include` array request parameter.

To determine whether you need to use the `include` parameter in a given request, look at the request description. The `include` parameter's enum values represent the response properties that depend on the `include` parameter.

Note: Whether a response property defaults to null depends on the request endpoint, not the object that the endpoint references. If multiple endpoints return data from the same object, a particular property can depend on `include` in one endpoint and return its actual value by default for a different endpoint.

A hash property can depend on a single `include` value, or on multiple `include` values associated with its child properties. For example, when updating an Account, to return actual values for the entire `identity` hash, specify `identity` in the `include` parameter. Otherwise, the `identity` hash is null in the response. However, to return actual values for the `configuration` hash, you must specify individual configurations in the request. If you specify at least one configuration, but not all of them, specified configurations return actual values and unspecified configurations return null. If you don't specify any configurations, the `configuration` hash is null in the response.

* Related guide: [Include-dependent response values](https://docs.stripe.com/api-includable-response-values)

## Metadata

Updateable Stripe objects-including [Account](https://docs.stripe.com/api/accounts), [Charge](https://docs.stripe.com/api/charges), [Customer](https://docs.stripe.com/api/customers), [PaymentIntent](https://docs.stripe.com/api/payment_intents), [Refund](https://docs.stripe.com/api/refunds), [Subscription](https://docs.stripe.com/api/subscriptions), and [Transfer](https://docs.stripe.com/api/transfers) have a `metadata` parameter. You can use this parameter to attach key-value data to these Stripe objects.

You can specify up to 50 keys, with key names up to 40 characters long and values up to 500 characters long. Keys and values are stored as strings and can contain any characters with one exception: you can't use square brackets ([ and ]) in keys.

You can use metadata to store additional, structured information on an object. For example, you could store your user's full name and corresponding unique identifier from your system on a Stripe [Customer](https://docs.stripe.com/api/customers) object. Stripe doesn't use metadata-for example, we don't use it to authorize or decline a charge and it won't be seen by your users unless you choose to show it to them.

Some of the objects listed above also support a `description` parameter. You can use the `description` parameter to annotate a charge-for example, a human-readable description such as `2 shirts for test@example.com`. Unlike `metadata`, `description` is a single string, which your users might see (for example, in email receipts Stripe sends on your behalf).

Don't store any sensitive information (bank account numbers, card details, and so on) as metadata or in the `description` parameter.

* Related guide: [Metadata](https://docs.stripe.com/metadata)

### Sample metadata use cases

* **Link IDs**: Attach your system's unique IDs to a Stripe object to simplify lookups. For example, add your order number to a charge, your user ID to a customer or recipient, or a unique receipt number to a transfer.
* **Refund papertrails**: Store information about the reason for a refund and the individual responsible for its creation.
* **Customer details**: Annotate a customer by storing an internal ID for your future use.

## Pagination

All top-level API resources have support for bulk fetches through "list" API methods. For example, you can [list charges](https://docs.stripe.com/api/charges/list), [list customers](https://docs.stripe.com/api/customers/list), and [list invoices](https://docs.stripe.com/api/invoices/list). These list API methods share a common structure and accept, at a minimum, the following three parameters: `limit`, `starting_after`, and `ending_before`.

Stripe's list API methods use cursor-based [pagination](https://docs.stripe.com/pagination) through the `starting_after` and `ending_before` parameters. Both parameters accept an existing object ID value (see below) and return objects in reverse chronological order. The `ending_before` parameter returns objects listed before the named object. The `starting_after` parameter returns objects listed after the named object. These parameters are mutually exclusive. You can use either the `starting_after` or `ending_before` parameter, but not both simultaneously.

Our client libraries offer [auto-pagination helpers](https://docs.stripe.com/pagination#auto-pagination) to traverse all pages of a list.

### Parameters

* #### limit (optional, default is 10)

  This specifies a limit on the number of objects to return, ranging between 1 and 100.

* #### starting_after (optional object ID)

  A cursor to use in pagination. `starting_after` is an object ID that defines your place in the list. For example, if you make a list request and receive 100 objects, ending with `obj_foo`, your subsequent call can include `starting_after=obj_foo` to fetch the next page of the list.

* #### ending_before (optional object ID)

  A cursor to use in pagination. `ending_before` is an object ID that defines your place in the list. For example, if you make a list request and receive 100 objects, starting with `obj_bar`, your subsequent call can include `ending_before=obj_bar` to fetch the previous page of the list.

### List Response Format

* #### object (string, value is "list")

  A string that provides a description of the object type that returns.

* #### data (array)

  An array containing the actual response elements, paginated by any request parameters.

* #### has_more (boolean)

  Whether or not there are more elements available after this set. If `false`, this set comprises the end of the list.

* #### url (string) - the heading text was lost in conversion

  The URL for accessing this list.

v2 API pagination: APIs within the `/v2` namespace contain a different [pagination](https://docs.stripe.com/api-v2-overview#list-pagination) interface than the `v1` namespace.

## Search

Some top-level API resource have support for retrieval via "search" API methods. For example, you can [search charges](https://docs.stripe.com/api/charges/search), [search customers](https://docs.stripe.com/api/customers/search), and [search subscriptions](https://docs.stripe.com/api/subscriptions/search).

Stripe's search API methods utilize cursor-based pagination via the `page` request parameter and `next_page` response parameter. For example, if you make a search request and receive `"next_page": "pagination_key"` in the response, your subsequent call can include `page=pagination_key` to fetch the next page of results.

Our client libraries offer [auto-pagination](https://docs.stripe.com/api/pagination/auto) helpers to easily traverse all pages of a search result.

### Search request format

* #### query (required)

  The search query string. See [search query language](https://docs.stripe.com/search#search-query-language).

* #### limit (optional)

  A limit on the number of objects returned. Limit can range between 1 and 100, and the default is 10.

* #### page (optional)

  A cursor for pagination across multiple pages of results. Don't include this parameter on the first call. Use the `next_page` value returned in a previous response to request subsequent results.

### Search response format

* #### object (string, value is "search_result")

  A string describing the object type returned.

* #### url (string) - the heading text was lost in conversion

  The URL for accessing this list.

* #### has_more (boolean)

  Whether or not there are more elements available after this set. If `false`, this set comprises the end of the list.

* #### data (array)

  An array containing the actual response elements, paginated by any request parameters.

* #### next_page (string)

  A cursor for use in pagination. If `has_more` is true, you can pass the value of `next_page` to a subsequent call to fetch the next page of results.

* #### total_count (optional positive integer or zero)

  The total number of objects that match the query, only accurate up to 10,000. This field isn't included by default. To include it in the response, [expand](https://docs.stripe.com/api/expanding_objects) the `total_count` field.

## Auto-pagination

Our libraries support auto-pagination. This feature allows you to easily iterate through large lists of resources without having to manually perform the requests to fetch subsequent pages.

Since curl simply emits raw HTTP requests, it doesn't support auto-pagination.

## Request IDs

Each API request has an associated request identifier. You can find this value in the response headers, under `Request-Id`. You can also find request identifiers in the URLs of individual request logs in your [Dashboard](https://dashboard.stripe.com/logs).

To expedite the resolution process, provide the request identifier when you contact us about a specific request.

## Connected accounts

If you use Stripe [Connect](https://docs.stripe.com/connect), you can issue requests on behalf of your [connected accounts](https://docs.stripe.com/connect/accounts). To act as a connected account, include a `Stripe-Account` header containing the connected account ID, which typically starts with the `acct_` prefix.

The connected account ID is set per-request. Methods on the returned object reuse the same account ID.

* Related guide: [Making API calls for connected accounts](https://docs.stripe.com/connect/authentication)

## Versioning

Starting with the 2024-09-30.acacia release, Stripe follows a [new API release process](https://stripe.com/blog/introducing-stripes-new-api-release-process) where we release new API versions monthly with no breaking changes. Twice a year, we issue a new major release (for example, [Basil](https://docs.stripe.com/changelog/basil)) that starts with an API version containing breaking changes. You can safely upgrade to any monthly release without updating your code. Upgrading to a new major release can require changes to your existing integration.

The current version is 2026-09-30.endive. For information on all API updates, view our [API changelog](https://docs.stripe.com/changelog). To upgrade your API version, see [API upgrades](https://docs.stripe.com/upgrades).

Requests made with curl use your Stripe account's default API version (controlled in [Workbench](https://dashboard.stripe.com/workbench)) unless you override it by setting the `Stripe-Version` header.

Webhook events also use your account's default API version unless you set an API version during [endpoint creation](https://docs.stripe.com/api/webhook_endpoints/create).

You can upgrade your API version in [Workbench](https://dashboard.stripe.com/workbench). As a precaution, use API versioning to test a new API version before committing to an upgrade.

## Enums

Some properties on API resources use a fixed set of possible string values, which are known as enums. Enums can be _closed_ or _open_:

* **Closed**: The set of values for the enum is fixed and won't grow or change over time.
* **Open**: The set of values for the enum can grow or change over time. Stripe can add new values as a backward-compatible change without requiring an [API version](https://docs.stripe.com/api/versioning) upgrade. Each enum's reference entry indicates whether it is open.

### Handling open enums in responses

Don't assume that the values documented for an open enum are exhaustive. When you read an open enum from an API response, your code should include a safe fallback-such as a default branch in a switch statement-to gracefully handle values your integration doesn't yet recognize.

### Sending enum values in requests

When sending an enum value in a request, use only the values documented for the parameter you're setting. Even if an enum is open, Stripe validates request values against the set of values that are currently supported.
