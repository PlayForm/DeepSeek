# Documentation

Explore our guides and examples to integrate Stripe.

[Explore all products](https://docs.stripe.com/#products)

[Sign in](https://dashboard.stripe.com/login?redirect=https%3A%2F%2Fdocs.stripe.com%2F) or
[create an account](https://dashboard.stripe.com/register) to load your test API keys.

## Payments

_(The product icons under this and the following two sections were lost in conversion; only the
headings survive.)_

## Revenue

## Developers

## Try it out

Start a payment. Start a checkout session. Create a customer. Sell a product. Issue coupons. Get
your balance. Manage taxes.

```shell
$ stripe payment_intents create --amount 1099 --currency "usd"
```

The interactive response shown on the page was shredded into fragmentary inline code spans by the
conversion; the tokens are reassembled below in the order the capture preserved them.

```json
{
  "id": "xxxxxx",
  "object": "payment_intent",
  "amount": 1099,
  "amount_capturable": 0,
  "amount_details": {
    "tip": {}
  },
  "amount_received": 0,
  "amount_subtotal": 1099,
  "application": null,
  "application_fee_amount": null,
  "automatic_payment_methods": null,
  "canceled_at": null,
  "cancellation_reason": null,
  "capture_method": "automatic",
  "charges": {"... 5 items"},
  "client_secret": "xxxxxx",
  "confirmation_method": "automatic",
  "created": 1793287390,
  "currency": "usd",
  "customer": null,
  "description": null,
  "invoice": null,
  "last_payment_error": null,
  "livemode": false,
  "metadata": {},
  "next_action": null,
  "on_behalf_of": null,
  "payment_method": null,
  "payment_method_options": {
    "card": {"... 5 items"}
  },
  "payment_method_types": [
    "card"
  ],
  "processing": null,
  "receipt_email": null,
  "review": null,
  "setup_future_usage": null,
  "shipping": null,
  "source": null,
  "statement_descriptor": null,
  "statement_descriptor_suffix": null,
  "status": "requires_payment_method",
  "total_details": {"... 3 items"},
  "transfer_data": null,
  "transfer_group": null
}
```

[Sign in](https://dashboard.stripe.com/login?redirect=https%3A%2F%2Fdocs.stripe.com%2F) to edit real
requests.

## Browse by product

### Payments

- [Payments - Online payments](https://docs.stripe.com/payments)
- [Managed Payments - Stripe merchant of record solution](https://docs.stripe.com/payments/managed-payments)
- [Terminal - In-person and omnichannel payments](https://docs.stripe.com/terminal)
- [Climate - Carbon removal](https://docs.stripe.com/climate)
- [Financial Connections - Connect users' financial accounts](https://docs.stripe.com/financial-connections)
- [Crypto - Accept, onramp, or pay out in crypto](https://docs.stripe.com/stablecoins)

### Revenue

- [Billing - Subscriptions and recurring payments](https://docs.stripe.com/billing)
- [Tax - Sales tax and VAT automation](https://docs.stripe.com/tax)
- [Revenue Recognition - Accounting automation](https://docs.stripe.com/revenue-recognition)
- [Atlas - Startup incorporation](https://docs.stripe.com/atlas)

### Risk

- [Radar - Fraud and risk management](https://docs.stripe.com/radar)
- [Identity - Online identity verification](https://docs.stripe.com/identity)

### Data

- [Reports - Financial reporting](https://docs.stripe.com/stripe-reports)
- [Sigma - Custom SQL environment](https://docs.stripe.com/data/sigma)
- [Data Pipeline - Data warehouse sync](https://docs.stripe.com/data/data-pipeline)

### Embedded finance

- [Connect - Embedded finance for platforms](https://docs.stripe.com/connect)
- [Account onboarding - Onboard and verify connected accounts](https://docs.stripe.com/connect/onboarding)
- [Platform payments - Process payments for connected accounts](https://docs.stripe.com/connect/charges)
- [Platform payouts - Send funds to connected accounts](https://docs.stripe.com/connect/manage-connected-account-payouts)
- [Platform management - Monitor and manage your platform](https://docs.stripe.com/connect/dashboard/understand-your-connect-business)
- [Tax forms - Tax reporting and filing](https://docs.stripe.com/connect/tax-reporting)

### Money management

- [Issuing - Card creation](https://docs.stripe.com/issuing)
- [Treasury - Building blocks for financial services](https://docs.stripe.com/treasury)
- [Capital - Business financing](https://docs.stripe.com/capital/how-stripe-capital-works)

### Prebuilt components

- [Payment Links - No-code payments](https://docs.stripe.com/payment-links)
- [Checkout - Prebuilt, Stripe-hosted checkout page](https://docs.stripe.com/payments/checkout)
- [Elements - Secure frontend UI components](https://docs.stripe.com/payments/elements)
