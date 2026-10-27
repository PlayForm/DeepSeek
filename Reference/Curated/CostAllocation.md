# FinOps Cost Allocation and Chargeback

> Decision: Per-file inference cost attribution is a FinOps allocation problem. The conversation's
> token bill is the cost pool and every file the agent touches is an allocation target. The sources
> fix four design points. (1) Attribution rides on metadata attached at creation time, not
> reconstructed later: the Allocation capability's Run-level rule blocks provisioning when required
> ownership and metadata fields are missing, so the plugin should require an owner/allocation tag at
> a file's first touch. (2) Shared cost (a system prompt, a retrieval index, a context window reused
> across files) needs an explicit shared-cost policy: fixed, proportional, or proxy-metric
> apportionment, with "informed ignore" (fund it centrally, do not allocate) as a legitimate
> early-stage choice made per shared item. (3) The recognized unit metric for GenAI already starts
> at cost per token and expands to cost per assist, cost per agent action, cost per case deflected,
> so a per-file cost column slots into an existing unit-metric ladder rather than inventing a new
> one. (4) Where a file's share depends on which other files shared its context, the Shapley value
> is the unique split that is efficient (sums exactly to the bill), symmetric, additive, and zero
> for null files; its coalition sum is exponential, so approximation is the implementation question
> it leaves open. Chargeback turns the per-file numbers into an internal invoice; showback reports
> them without billing.

## Sources

- FOCUS Specification 1.4 (FinOps Open Cost and Usage Specification) -
  https://focus.finops.org/focus-specification/ - Reference/Raw/focus-specification.md
    - 3550 bytes via crawl4ai:fit. Landing-page front matter only (version, abstract, license,
      patent status); the column schema lives on subpages not in scope.
- Chargeback and Showback (FinOps Framework capability) -
  https://www.finops.org/framework/capabilities/chargeback-showback/ -
  Reference/Raw/chargeback-showback.md
    - FAILED: HTTP 404 ("Sorry, this page has not been found"). Fit pass wrote 687 bytes of nav plus
      the 404 heading; raw retry (--filter raw --json) confirmed status_code 404 and final_url
      identical. File kept as the error-page evidence; no capability content captured.
- Allocation (FinOps Framework capability, domain: Understand Usage & Cost) -
  https://www.finops.org/framework/capabilities/allocation/ - Reference/Raw/allocation.md
    - 21263 bytes via crawl4ai:fit. Full capability page: definition, three strategies, maturity,
      personas, KPIs.
- Unit Economics (FinOps Framework capability, domain: Quantify Business Value) -
  https://www.finops.org/framework/capabilities/unit-economics/ - Reference/Raw/unit-economics.md
    - 22650 bytes via crawl4ai:fit. Full capability page: definition, metric taxonomy, maturity,
      KPIs, inputs and outputs.
- Cost allocation (Wikipedia, cost accounting principle) -
  https://en.wikipedia.org/wiki/Cost_allocation - Reference/Raw/cost-allocation.md
    - 7837 bytes via crawl4ai:fit. Short article; carries a "needs more citations" banner dated
      September 2016.
- Shapley value (Wikipedia, cooperative game theory) - https://en.wikipedia.org/wiki/Shapley_value -
  Reference/Raw/shapley-value.md
    - 39322 bytes via crawl4ai:fit. Formula, synergy form, properties, examples, ML section.

## What the sources establish

1. FOCUS is "an open specification for billing data. It defines a common schema for billing data,
   aligns terminology with the FinOps Framework and defines a minimum set of requirements for
   billing data" and "enables FinOps practitioners to perform common FinOps capabilities such as
   chargeback, cost allocation, budgeting and forecasting ... regardless of the origin of the FOCUS
   compatible dataset." (https://focus.finops.org/focus-specification/)
2. FOCUS 1.4 is a published release, publication version 1.4, CC-BY-4.0, produced under the Joint
   Development Foundation Projects agreement. (https://focus.finops.org/focus-specification/)
3. Allocation capability definition: "Define strategies to assign and share cost and usage using
   accounts, tags, labels, and other metadata, creating accountability among teams and projects
   within an organization." It implements the FinOps principle "Everyone takes ownership for their
   technology usage." (https://www.finops.org/framework/capabilities/allocation/)
4. Allocation requires exactly three strategies: (a) the allocation strategy mapping costs to the
   organization; (b) the tagging or metadata strategy mapping usage and resources to the defined
   parts of the organization; (c) the shared cost strategy defining how each set of shared resources
   is allocated to budgets. (https://www.finops.org/framework/capabilities/allocation/)
5. Granularity ladder: splitting aggregated costs by a known owner list of accounts, projects,
   subscriptions, resource groups; then resource-level naming conventions and tags or labels; then
   "Even more granular allocation, or allocation of shared cost elements can be accomplished using
   other sources such as the organization Configuration Management Database (CMDB), observability,
   or utilization data." (https://www.finops.org/framework/capabilities/allocation/)
6. Shared-cost allocation methods: "fixed allocations, proportional or by using proxy metrics to
   determine a variable proportion." "Informed ignore" is the explicit decision to centrally budget
   a shared cost item instead of allocating it; most organizations mix strategies.
   (https://www.finops.org/framework/capabilities/allocation/)
7. Shift-left rule at Run maturity: "Ownership and metadata fields are enforced as a precondition
   for provisioning; requests missing required fields are blocked, with an escalation path for
   changes exceeding agreed thresholds." At Crawl the contrast is "ownership is recorded manually
   and inconsistently after deployment." (https://www.finops.org/framework/capabilities/allocation/)
8. Allocation Accuracy Index (AAI): "Measures the effectiveness of cost attribution practices ...
   The formula calculates the percentage of total infrastructure costs that are directly and
   accurately attributed to the responsible teams, projects, or business units."
   (https://www.finops.org/framework/capabilities/allocation/)
9. Allocation KPI shapes: percentage of technology costs allocated directly to organizational units;
   percentage of costs that cannot be categorized and allocated directly; percentage of costs with
   appropriate allocation metadata; percentage of resource deployments with missing allocation
   metadata. (https://www.finops.org/framework/capabilities/allocation/)
10. The Allocation page defers chargeback: "See the Invoicing & Chargeback Capability for more
    information on the impact of Cost Allocation to Showback / Chargeback." Showback serves teams;
    chargeback serves finance and cost centers.
    (https://www.finops.org/framework/capabilities/allocation/)
11. Unit Economics: "Develop and track metrics that provide an understanding of how an
    organization's technology use and technology management practices impact the value of the
    organization's products, services, or activities." Named unit costs: "cost per service request,
    cost per workload, cost per seat used, cost per VM, cost per GB stored, or cost per token."
    (https://www.finops.org/framework/capabilities/unit-economics/)
12. Unit metric taxonomy: Resource Efficiency Unit Metrics (cost per GB stored, cost per GB
    transferred, cost per virtual CPU, cost per seat used, cost per token) versus Business Unit
    Metrics (cost per tenant, cost per transaction, cost to serve, cost per case resolved).
    (https://www.finops.org/framework/capabilities/unit-economics/)
13. GenAI unit economics: "early unit economics often starts with cost per token and expands toward
    outcome oriented measures, for example cost per assist, cost per agent action, or cost per case
    deflected." KPI "Cost per API Call: Measures the average cost for each API call made to AI
    services." (https://www.finops.org/framework/capabilities/unit-economics/)
14. Unit Economics consumes FOCUS: "Use of FOCUS (FinOps Open Cost and Usage Specification) as a
    standardized billing and usage schema that can simplify normalization of cost datasets as well
    as terminology used in unit economics reporting."
    (https://www.finops.org/framework/capabilities/unit-economics/)
15. Cost allocation (accounting): the process assigning a shared-service cost center's expense to
    the internal cost centers that consume the products and services; the data "may generate an
    internal invoice or feed an ERP system's chargeback module," and invoice or chargeback views are
    "the typical methods that drive personnel behavior."
    (https://en.wikipedia.org/wiki/Cost_allocation)
16. Core components of a cost allocation system: tracking which organizations provide a product or
    service, which organizations consume them, and a list of portfolio offerings (a service
    catalog). (https://en.wikipedia.org/wiki/Cost_allocation)
17. OMB Uniform Guidance recognizes only three cost types: Direct costs (associated specifically to
    a final cost objective), Indirect costs (needed for organizational health and operations, not
    tied to one program), Indirect-Admin / Overhead costs (not Direct but necessary for immediate
    support of the program). (https://en.wikipedia.org/wiki/Cost_allocation)
18. Shapley value: "the only solution that satisfies four fundamental properties: efficiency,
    symmetry, additivity, and the dummy player (or null player) property." Introduced by Lloyd
    Shapley in 1951. (https://en.wikipedia.org/wiki/Shapley_value)
19. Shapley formula: player i receives the sum over all subsets S of N not containing i of [ |S|!
    (n - |S| - 1)! / n! ] * ( v(S + {i}) - v(S) ); equivalently (1/n) times the sum over S of C(n-1,
    |S|)^-1 marginal contributions; or the average of v(predecessors + {i}) - v(predecessors) over
    all n! orderings R. (https://en.wikipedia.org/wiki/Shapley_value)
20. Efficiency axiom: "The sum of the Shapley values of all agents equals the value of the grand
    coalition" - the split covers the entire bill with no residue.
    (https://en.wikipedia.org/wiki/Shapley_value)
21. Synergy form: with w the Harsanyi dividend (w(S) = sum over R subset of S of (-1)^|S-|R|| v(R)),
    the Shapley value is phi_i = sum over coalitions S containing i of w(S) / |S| - each coalition's
    synergy divided equally among its members. (https://en.wikipedia.org/wiki/Shapley_value)
22. Stand-alone bounds: if v is subadditive then phi_i(v) <= v({i}); if superadditive then
    phi_i(v) >= v({i}). (https://en.wikipedia.org/wiki/Shapley_value)
23. In ML, Shapley values explain feature contributions and "unif[y]" LIME, DeepLIFT, and layer-wise
    relevance propagation; "distributional values" extend them to preserve probabilistic output of
    predictive models including large language models. (https://en.wikipedia.org/wiki/Shapley_value)

## Extracts that matter

The three-strategy requirement (allocation URL):

```
"Allocation will require three primary strategies: Allocation Strategy,
Tagging Strategy and Shared Cost Strategy."
1. "The allocation strategy defining how costs should be mapped to the
   organization."
2. "The tagging or metadata strategy defining how usage and resources
   will be mapped to the defined parts of the organization."
3. "The shared cost strategy which defines how each set of shared
   resources will be allocated to budgets."
```

Shared-cost policy options (allocation URL):

```
"Allocation of shared costs can be performed in a variety of ways
including fixed allocations, proportional or by using proxy metrics to
determine a variable proportion."
"Many early FinOps practices adopt an 'informed ignore' approach where a
business decision is explicitly made to centrally budget for shared cost
items, rather than allocating from each cost center's budget."
```

Shift-left enforcement, Run maturity (allocation URL):

```
"Ownership and metadata fields are enforced as a precondition for
provisioning; requests missing required fields are blocked, with an
escalation path for changes exceeding agreed thresholds."
"Cost allocation is performed in near real time allowing for Product and
Engineering Personas to better understand their monthly costs"
```

Unit metric lists (unit-economics URL):

```
Resource Efficiency Unit Metrics (for example cost per GB stored, cost
per GB transferred, cost per virtual CPU, cost per seat used, cost per
token)
Business Unit Metrics (for example cost per tenant, cost per transaction,
cost to serve, cost per case resolved)
```

GenAI token ladder (unit-economics URL):

```
"For organizations adopting Generative AI, early unit economics often
starts with cost per token and expands toward outcome oriented measures,
for example cost per assist, cost per agent action, or cost per case
deflected"
```

Shapley formulas, ASCII rendering (shapley URL):

```
phi_i(v) = SUM_{S subset N, i not in S} ( |S|! (n-|S|-1)! / n! )
           * ( v(S + {i}) - v(S) )
         = (1/n) SUM_{S subset N, i not in S} C(n-1, |S|)^-1
           * ( v(S + {i}) - v(S) )
Alternative: phi_i(v) = (1/n!) SUM_R [ v(P_i^R + {i}) - v(P_i^R) ]
Efficiency:   SUM_i phi_i(v) = v(N)
Synergy:      phi_i(v) = SUM_{i in S subset N} w(S) / |S|
Stand-alone:  v subadditive => phi_i(v) <= v({i}); superadditive => >=
Axioms: efficiency, symmetry, linearity (additivity), null player
```

OMB cost types (cost-allocation URL):

```
1. Direct costs - "can be associated specifically to a final cost
   objective"
2. Indirect costs - needed "for the sake of the organizational health &
   operations, but don't tie back to a specific program"
3. Indirect-Admin (Overhead) costs - "not Direct but are necessary for
   the immediate support of the program"
```

Cost allocation system components (cost-allocation URL):

```
"a way to track which organizations provides a product and/or service,
the organizations that consume the products and/or services, and a list
of portfolio offerings (e.g. service catalog)"
"the cost allocation data may generate an internal invoice or feed an ERP
system's chargeback module"
```

## Open questions

1. The Chargeback and Showback capability page returns HTTP 404 at the specified URL (fit and raw
   passes agree); the framework's own showback-versus-chargeback definitions, invoicing cadence, and
   cost-recovery rules are not captured. The Allocation page only names the "Invoicing & Chargeback
   Capability". A corrected or renamed URL is needed to close this lane.
2. The fetched FOCUS page is front matter only; it names no column fields, so no exact FOCUS column
   list (the billing-data field names the plugin would map token cost onto) is quotable from this
   fetch. The columns subpages were out of scope.
3. No source defines a per-file attribution rule for token cost. "Cost per token" is an established
   unit metric, but no source assigns a conversation's token bill to the files in context; the
   plugin's per-file rollup is the missing layer between the two.
4. The Shapley sum is over 2^(n-1) subsets per player (or n! orderings); the sources give exact
   formulas but no approximation guidance for billing-scale player counts. The ML section covers
   feature attribution, not cost. A sampled-ordering or truncated-coalition policy is unset.
5. Whether shared context (system prompt, retrieval index, files opened once and never touched
   again) should be allocated proportionally, by proxy metric, or funded via "informed ignore" is a
   per-item policy choice; the sources state the options and explicitly say most organizations mix
   them, with no default rule.
6. The Wikipedia cost allocation article carries a "needs more citations" banner (September 2016);
   its three-type taxonomy is attributed to OMB Uniform Guidance but the article itself is a weak
   citation for audit-grade claims.
7. FOCUS copyright is 2023-2026 and the page advertises a v1.5 release scope, so column-level
   requirements may move between versions; the fetched landing page does not pin the schema version
   beyond "Publication version 1.4".
