# Your company’s data, connected into one ontology
Connect your database, Stripe, WorkOS, PostHog and your files. Foundry suggests one ontology across them that you explore and ask questions of.
Set up with your agent[Start on Helix Cloud](https://foundry.helix-db.com/login)
Copy local setup$ **git clone github.com/helixdb/helix-foundry.git** $ **cd helix-foundry && docker compose up -d --wait**

```
git clone https://github.com/helixdb/helix-foundry.git
cd helix-foundry && docker compose up -d --wait
```

Schema
## A suggested ontology that matches the same records across sources.
11 tables from 5 sources, condensed into **8 entities** and 7 connections
## Suggested entities
Rename
  * ### Account
60 records · key `account_id`
60 accounts from PlanetScale, joined with WorkOS organizations and Stripe customers.
Merged from 3 sourcesStarts from PlanetScale accounts and adds the matching records from each source.PlanetScale accounts**60 rows · base** WorkOS organizations on organization_id = workos_organization_id**60 of 62 matched** Stripe customers on customer_id = stripe_customer_id**46 of 48 matched**
    * accountsPlanetScale
    * organizationsWorkOS
    * customersStripe
    * Came from **Campaign** 47 of 47 matched · matched ignoring case
  * 337 records · key `user_id`
337 users from PlanetScale, joined with WorkOS users.
Merged from 2 sourcesStarts from PlanetScale users and adds the matching records from each source.PlanetScale users**337 rows · base** WorkOS users on user_id = workos_user_id**320 of 327 matched**
    * usersPlanetScale
    * usersWorkOS
    * Belongs to **Account** 337 of 337 matched
  * ### Subscription
47 records · key `subscription_id`
47 subscriptions from Stripe.
    * subscriptionsStripe
    * Billed to **Account** 46 of 47 matched
  * ### Campaign
6 records · key `campaign_id`
6 campaigns from S3.
    * marketing_campaigns.csvS3
  * ### SSO connection
6 records · key `connection_id`
6 SSO connections from WorkOS.
    * sso_connectionsWorkOS
    * Belongs to **Account** 6 of 6 matched
  * ### Support ticket
119 records · key `ticket_id`
119 support tickets from S3.
    * support_tickets.csvS3
    * Requested by **User** 114 of 119 matched · matched ignoring case
  * ### Event
3,873 rows · key `event_id`
3,873 events from PostHog, linked to users.
Activity stream
    * eventsPostHog
    * Performed by **User** 3,767 of 3,873 matched
  * ### Invoice
215 records · key `invoice_id`
215 invoices from Stripe.
    * invoicesStripe
    * For subscription **Subscription** 215 of 215 matched


Came from**Account → Campaign** 47 of 47 matched _· matched ignoring case_ `accounts.signup_campaign_id → marketing_campaigns.csv.campaign_id` Matched by column name and valuesBelongs to**User → Account** 337 of 337 matched `users.account_id → accounts.account_id` Matched by column name and valuesBilled to**Subscription → Account** 46 of 47 matched `subscriptions.customer_id → customers.customer_id` Matched by column name and valuesFor subscription**Invoice → Subscription** 215 of 215 matched `invoices.subscription_id → subscriptions.subscription_id` Matched by column name and valuesRequested by**Support ticket → User** 114 of 119 matched _· matched ignoring case_ `support_tickets.csv.requester_email → users.email` Matched by column name and valuesBelongs to**SSO connection → Account** 6 of 6 matched `sso_connections.organization_id → organizations.organization_id` Matched by column name and valuesPerformed by**Event → User** 3,767 of 3,873 matched `events.distinct_id → users.user_id` Matched by values
Open a type to see its properties and records. Link Activity Merged across sources
## What we merged
  * Account combines PlanetScale accounts with WorkOS organizations (60 of 62 match, confirmed by external_id) and Stripe customers (46 of 48 match, confirmed by metadata.account_id).
  * User combines PlanetScale users with WorkOS users (320 of 327 match, confirmed by email).


Explorer
## Everything a load wrote: its entities and facts.
Open a record to see its properties and every relationship, in and out, with the load and the version that wrote it.
Find a record
  * Account10
  * Campaign5
  * Invoice46
  * SSO connection4
  * Subscription10
  * Support ticket30
  * User63


168 of 790 records: ten accounts and the records around them. Double-click a record to see everything around it.
##  01Ontology
One model of your business that every app builds on.
##  02Analyst
Ask in plain words, and get an answer you can check.
The point
## Nobody has to agree on a schema first.
Connect a source. Foundry suggests the ontology, you keep or change it, and nothing is published until you say so.
[Start on Helix Cloud](https://foundry.helix-db.com/login)
## Connect the data you already run on, and the models you’re already approved to use.
Bring your own keys for Claude, OpenAI, Azure or Bedrock, any OpenAI-compatible endpoint, or a model that runs locally. Self-hosted, your data stays on your own infrastructure, and columns that look sensitive are masked before samples reach a hosted model, so you stay within the policies you already have.
## Now there is nothing to host. Helix Cloud runs the same build we publish, so you connect a source and explore the ontology without standing up HelixDB, DuckDB and Ollama yourself.
[Start on Helix Cloud](https://foundry.helix-db.com/login)[Read the self-hosted setup](https://github.com/helixdb/helix-foundry)
Self-hosted Foundry listens on 127.0.0.1 only and has no sign-in: anyone on that machine is already in.
