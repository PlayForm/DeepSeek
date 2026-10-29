[ Skip to main content ](https://design.gitlab.com/data-visualization/single-stat/#skipTarget)
# Single stat
Single stat is part of the [design system extended layer](https://design.gitlab.com/contribute/contributing) 🤝  owned by groupoptimize. Questions or feedback? Reach out to [#data-exploration-dashboards on Slack](https://gitlab.enterprise.slack.com/archives/C08MY2Z9BPV). 
The single stat component displays the title and value of a metric.
## [Examples](https://design.gitlab.com/data-visualization/single-stat/#examples)
Single stat
Loading live example...
Edit source

```
<gl-single-stat title="Single stat" value="100" variant="neutral" />
```

A single stat can be used by itself or side-by-side with other single stats to display a topical set of metrics. There are a number of variations to allow for additional context or representation of the metric.
### [When to use a single stat](https://design.gitlab.com/data-visualization/single-stat/#when-to-use-a-single-stat)
  * To show an overview of how a metric is performing.
  * To show multiple metrics around a similar topic side-by-side.


### [When not to use single stat](https://design.gitlab.com/data-visualization/single-stat/#when-not-to-use-single-stat)
  * To display standard text or labels.
  * To display the same metric over a period of time (use a [chart](https://design.gitlab.com/data-visualization/charts) instead).


### [Simple](https://design.gitlab.com/data-visualization/single-stat/#simple)
The default pattern for displaying a metric.
Simple
Loading live example...
Edit source

```
<gl-single-stat title="Single stat" value="100000" variant="neutral" />
```

### [Title icon](https://design.gitlab.com/data-visualization/single-stat/#title-icon)
A single stat with a title icon to convey extra meaning to the metric.
Title icon
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="100"
  variant="neutral"
  title-icon="hourglass"
/>
```

### [Meta icon](https://design.gitlab.com/data-visualization/single-stat/#meta-icon)
A single stat with an icon which can be used to convey status or trend.
Meta icon
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="100"
  variant="neutral"
  meta-icon="check-circle"
/>
```

A single stat with a badge which can be used to convey status or trend in more detail.
Badge
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="100"
  variant="info"
  meta-text="through the roof"
  meta-icon="rocket"
/>
```

The `meta-tooltip` prop adds a [tooltip](https://design.gitlab.com/components/tooltip) to the badge for additional context that doesn't fit in the badge text. When it's set, the badge is wrapped in a focusable button so the tooltip is reachable by keyboard and pointer. See the [tooltip guidelines](https://design.gitlab.com/components/tooltip#guidelines) for what belongs in a tooltip.
Badge with a tooltip
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="100"
  variant="success"
  meta-text="20%"
  meta-icon="trend-up"
  meta-tooltip="Percentage change compared to the previous time period"
/>
```

### [Description](https://design.gitlab.com/data-visualization/single-stat/#description)
A single stat with a description to add context to the metric.
Description
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="100"
  variant="neutral"
  description="Additional text"
/>
```

The description renders on one line. When the text exceeds the available width, it's truncated and the full text is shown in a [tooltip](https://design.gitlab.com/components/tooltip). See [content truncation and overflow](https://design.gitlab.com/product-foundations/layout#content-truncation-and-overflow).
Drag the example below wider to see the truncation and tooltip resolve once the text fits.
Truncated description
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="100"
  variant="neutral"
  description="This is a very long description that will be truncated when it exceeds the available width"
/>
```

### [Supplementary content](https://design.gitlab.com/data-visualization/single-stat/#supplementary-content)
A single stat with supplementary content, which renders below the value and above the description. The default slot accepts content such as a [progress bar](https://design.gitlab.com/components/progress-bar) or a trend indicator.
Supplementary content
Loading live example...
Edit source

```
<gl-single-stat title="Single stat" value="25" variant="neutral">
  <gl-progress-bar :value="25" height="8px" />
</gl-single-stat>
```

Supplementary content can be combined with a description.
Supplementary content with a description
Loading live example...
Edit source

```
<gl-single-stat
  title="Single stat"
  value="25"
  variant="neutral"
  description="Out of 100 items"
>
  <gl-progress-bar :value="25" height="8px" />
</gl-single-stat>
```

A single stat that navigates to detailed information about a metric.
TODO: 
Complete design spec and add "linked" single stat example. [View issue](https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com/-/issues/1555)
## [Design specifications](https://design.gitlab.com/data-visualization/single-stat/#design-specifications)
Color, spacing, dimension, and layout information can be viewed in the [Pajamas UI Kit →](https://www.figma.com/file/17NxNEMa7i28Is8sMetO2H/Data-Visualization?node-id=275%3A731)
## [Code reference](https://design.gitlab.com/data-visualization/single-stat/#code-reference)
The single stat component is used to show a single value. The color of the meta icon / badge is determined by the `variant` prop, which can be one of `success`, `warning`, `danger`, `info`, or `neutral` (default).
The `description` prop renders through [`GlTruncate`](https://design.gitlab.com/components/utility-truncate) using the `with-tooltip` prop, so the full text is shown in a tooltip only when the text is actually truncated.
Content passed to the default slot renders between the value and the description.
The `meta-tooltip` prop wraps the badge in a `button` element, which is what makes the tooltip keyboard accessible.
### [Hover state](https://design.gitlab.com/data-visualization/single-stat/#hover-state)
You can make the component focusable by adding a `tabindex=0` attribute to it. This will also apply a hover state to the component.
### [GlSingleStat](https://design.gitlab.com/data-visualization/single-stat/#glsinglestat)
Loading story... 
## Related


Last updated at: Friday, August 14, 2026 at 6:30 PM
