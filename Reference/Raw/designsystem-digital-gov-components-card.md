**Official websites use .gov** A **.gov** website belongs to an official government organization in
the United States. **Secure .gov websites use HTTPS** A **lock** ( Lock Locked padlock icon ) or
**https://** means you’ve safely connected to the .gov website. Share sensitive information only on
official, secure websites. Cards contain content and actions about a single subject. Passed WCAG 2.1
AA

## About the card component

A **card** is often a subset or summary of a larger idea. It acts as an entry point to more detailed
information. This summary can contain a variety of content types, such as text, images and
multimedia, or buttons and links. An individual card is typically **a member of a collection** of
similar cards, not a single card in isolation. A card is distinguished from others in its collection
by its content, and cards are distinguished from the broader page context in form — usually with a
border or a shadow. Finally, a card is **modular** , which means you can vary the order of cards in
a collection without destroying any individual card’s meaning.

## Component preview

### Default card

- #### Card

Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum tenetur quo cupiditate, eaque
qui officia recusandae. [Visit Florida Keys](https://designsystem.digital.gov/components/card/)

- #### Card with Media

Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum tenetur quo cupiditate, eaque
qui officia recusandae. [Visit Florida Keys](https://designsystem.digital.gov/components/card/)

- #### Media with header first

Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore possimus similique nemo odit
doloremque laudantium? [Visit Florida Keys](https://designsystem.digital.gov/components/card/)

- #### Inset media

Etiam vitae sodales metus. Fusce id orci dignissim, efficitur risus eget, tempus odio. Donec lectus
ante, auctor eget cursus sed, convallis quis magna. Orci varius natoque penatibus et magnis dis
parturient montes, nascetur ridiculus mus. Mauris mattis tellus bibendum aliquet malesuada.
[Visit Florida Keys](https://designsystem.digital.gov/components/card/)

- #### Exdent media

Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore possimus similique nemo odit
doloremque laudantium? [Visit Florida Keys](https://designsystem.digital.gov/components/card/)

### Flag layout card

- #### Default flag

Lorem ipsum dolor sit amet consectetur adipisicing elit.
[Visit Florida Keys](https://designsystem.digital.gov/components/card/)

- #### Flag media right inset

Lorem ipsum dolor sit amet consectetur adipisicing elit.
[Visit Florida Keys](https://designsystem.digital.gov/components/card/)

## Component code

```
<h3 class="site-preview-heading"Default card</h3>
<ul class="usa-card-group"
  <li class="usa-card tablet-lg:grid-col-6 widescreen:grid-col-4"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Card</h4>
      </div>
      <div class="usa-card__body"
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum
          tenetur quo cupiditate, eaque qui officia recusandae.
        </p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
  <li class="usa-card tablet-lg:grid-col-6 widescreen:grid-col-4"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Card with Media</h4>
      </div>
      <div class="usa-card__media"
        <div class="usa-card__img"
          <img
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="A placeholder image"
          />
        </div>
      </div>
      <div class="usa-card__body"
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum
          tenetur quo cupiditate, eaque qui officia recusandae.
        </p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
  <li class="usa-card tablet-lg:grid-col-6 widescreen:grid-col-4 usa-card--header-first"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Media with header first</h4>
      </div>
      <div class="usa-card__media usa-card__media--exdent"
        <div class="usa-card__img"
          <img
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="A placeholder image"
          />
        </div>
      </div>
      <div class="usa-card__body"
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
          possimus similique nemo odit doloremque laudantium?
        </p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
  <li class="usa-card tablet-lg:grid-col-6 widescreen:grid-col-4"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Inset media</h4>
      </div>
      <div class="usa-card__media usa-card__media--inset"
        <div class="usa-card__img"
          <img
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="A placeholder image"
          />
        </div>
      </div>
      <div class="usa-card__body"
        <p>
          Etiam vitae sodales metus. Fusce id orci dignissim, efficitur risus
          eget, tempus odio. Donec lectus ante, auctor eget cursus sed,
          convallis quis magna. Orci varius natoque penatibus et magnis dis
          parturient montes, nascetur ridiculus mus. Mauris mattis tellus
          bibendum aliquet malesuada.
        </p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
  <li class="usa-card tablet-lg:grid-col-6 widescreen:grid-col-4"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Exdent media</h4>
      </div>
      <div class="usa-card__media usa-card__media--exdent"
        <div class="usa-card__img"
          <img
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="A placeholder image"
          />
        </div>
      </div>
      <div class="usa-card__body"
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
          possimus similique nemo odit doloremque laudantium?
        </p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
</ul>

<h3 class="site-preview-heading"Flag layout card</h3>
<ul class="usa-card-group"
  <li class="usa-card usa-card--flag flex-1"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Default flag</h4>
      </div>
      <div class="usa-card__media"
        <div class="usa-card__img"
          <img
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="A placeholder image"
          />
        </div>
      </div>
      <div class="usa-card__body"
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
  <li class="usa-card usa-card--flag flex-1 usa-card--media-right"
    <div class="usa-card__container"
      <div class="usa-card__header"
        <h4 class="usa-card__heading"Flag media right inset</h4>
      </div>
      <div class="usa-card__media usa-card__media--inset"
        <div class="usa-card__img"
          <img
            src="https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg"
            alt="A placeholder image"
          />
        </div>
      </div>
      <div class="usa-card__body"
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      </div>
      <div class="usa-card__footer"
        <a href="#" class="usa-button"Visit Florida Keys</a>
      </div>
    </div>
  </li>
</ul>
```

## Guidance

### When to use the card component

- **Collections of related content.** Cards help present a collection of related groups of content,
  like articles or sections of a website.

### When to consider something else

- **Tabular data.** Don’t use a card as a substitute for a table row.
- **Simple calls to action.** Use a button instead.
- **Standalone content.** Consider an `aside` or another standalone element.
- **Sequential, continuous text.** Cards should be self-contained and modular. If the reader is
  meant to read from card to card, consider a list or simple body text and headings.

### Usability guidance

- **Make cards actionable.** Since cards are used as a summary of more detailed information, any
  individual card should link out to that information.
- **Don’t use the card component only for decoration.** Use the card component for cards, not for
  any type of content that’s designed to have a border around it.
- **Include non-redundant content.** Don’t repeat images or content common to all or most cards in a
  collection. Repeated information (like using the same image for each card in a collection) makes
  it more difficult to distinguish cards from one another.
- **Make sure images are properly sized.** Cards often change size depending on the device. Make
  sure you use an image that works well on any device at any size.
- **Use simple styling.** Avoid distracting skeumorphism. Don’t include any card styling that calls
  too much attention to the metaphor of a paper card, like folds, bent edges, or paper texture.

### Accessibility guidance

Test the card component in your own project. USWDS tested the card component for accessibility. You
should test your implementation, too.
[ Use card accessibility tests ](https://designsystem.digital.gov/components/card/accessibility-tests)

- **Use unordered lists and list items.** Use a `ul` for a card group and an `li` for each card.
  This formatting allows screen readers to enumerate the items in the card group and allows
  shortcuts between list items.
- **Use the appropriate heading level for your page.** Update heading level based on the content of
  your page to make sure card headings are in the correct, logical outline order.
- **Use CSS to order the media element.** Logically, the media element should follow the header
  element. Don’t re-organize the markup to reverse their order.

### Using the card component

- **Control card size and layout with USWDS utilities.** The card component works well with
  [layout grid utilities](https://designsystem.digital.gov/utilities/layout-grid/). The
  `usa-card-group` block is functionally a wrap-able `grid-row`, and each individual `usa-card` is a
  `grid-col`. This means you can use a grid utility like `tablet:grid-col-4` to set a four-column
  size on a card at `tablet` width. You can also set custom grid gaps on a `usa-card-group` using
  `grid-gap` utilities. Since the Design System grid is based on flexbox, you can use
  [flex positioning utilities](https://designsystem.digital.gov/utilities/flex/) on the card group.
  The default alignment is stretch (stretch aligns the top and bottom of each card in a row), but
  the `flex-align-start` utility can set the alignment to the top of the row.
- **Control image aspect ratio with the`add-aspect` utility.** Add
  [aspect ratio utility classes](https://designsystem.digital.gov/utilities/height-and-width/#aspect)
  to `usa-card__img` or `usa-card__media` elements to control the aspect ratio on card images.
  Alternatively, control aspect ratio in your Sass files via the
  [`add-aspect` mixin](https://designsystem.digital.gov/utilities/height-and-width/#utility-mixins).
- **Style cards with utilities.** Style the `usa-card__container` element with utilities to achieve
  custom effects, such as changing the border or background color or adding a drop shadow.

#### Card settings

| Variable                                                | Description                                            |
| ------------------------------------------------------- | ------------------------------------------------------ |
| `             $theme-card-border-color           `      | Stroke color of card.                                  |
| `             $theme-card-border-radius           `     | Border radius of card.                                 |
| `             $theme-card-border-width           `      | Stroke thickness of card.                              |
| `             $theme-card-gap           `               | Gap between cards in a card group.                     |
| `             $theme-card-flag-min-width           `    | Width at which flag cards change to horizontal layout. |
| `             $theme-card-flag-image-width           `  | Fixed image width in the card flag variant.            |
| `             $theme-card-font-family           `       | Font family for card body.                             |
| `             $theme-card-header-typeset           `    | Family, size, and line height of the heading.          |
| `             $theme-card-margin-bottom           `     | Bottom margin for card.                                |
| `             $theme-card-padding-perimeter           ` | Padding between card elements and card border.         |
| `             $theme-card-padding-y           `         | Vertical padding between card elements.                |

#### Card variants

| Variant                     | Description                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `.usa-card--flag`           | Display in a horizontal (“flag”) orientation at a specified width (`$theme-card-flag-min-width`).                             |
| `.usa-card--header-first`   | Displays the header element before the media element.                                                                         |
| `.usa-card--media-right`    | In combination with `usa-card--flag`, sets the media element on the right. (Flag cards display media on the left by default.) |
| `.usa-card__media--inset`   | Indents the media element so it doesn’t extend to the edge of the card.                                                       |
| `.usa-card__body--exdent`   | Extends the body element out over the card border. Useful for light-bordered cards.                                           |
| `.usa-card__footer--exdent` | Extends the footer element out over the card border. Useful for light-bordered cards.                                         |
| `.usa-card__header--exdent` | Extends the header element out over the card border. Useful for light-bordered cards.                                         |
| `.usa-card__media--exdent`  | Extends the media element out over the card border. Useful for light-bordered cards.                                          |

## Accessibility test status

The USWDS team did 14 tests based on WCAG 2.1 AA success criteria.  
Overview of recent accessibility test results:

| Total tests                                    | Passed | Passed with exceptions | Conditional | Failed |
| ---------------------------------------------- | ------ | ---------------------- | ----------- | ------ |
| 14                                             | 9      | 0                      | 5           | 0      |
| Overview of recent accessibility test results: |

- **Passed:** 9
- **Passed with exceptions:** 0
- **Conditional:** 5
- **Failed:** 0

Learn more on the
[card accessibility tests page](https://designsystem.digital.gov/components/card/accessibility-tests/).

## Package

- **Package usage:** `@forward "usa-card";`
- **Dependencies:**`uswds-fonts`

## Latest updates

Meaningful code and guidance updates are listed in the following table:

| Date       | USWDS version | Affects | Breaking | Description |
| ---------- | ------------- | ------- | -------- | ----------- |
| 2025-02-14 |

- Guidance

| **Added WCAG compliance tag and accessibility test status section.** More information:
[ uswds-site#3101 ](https://github.com/uswds/uswds-site/pull/3101) |  
| 2024-10-04 | |

- Styles
- Settings

| Breaking | Breaking **Fixed a bug that caused the component to ignore the`$theme-card-font-family`
setting. ** Confirm that your implementation of the card component displays with the expected font
family. More information: [ uswds#5974 ](https://github.com/uswds/uswds/pull/5974) |  
| 2023-11-30 |

- Markup

| **Updated the grid breakpoints in the card template.** This change affects only the template grid,
not the component itself. More information:
[ uswds-site#2299 ](https://github.com/uswds/uswds-site/pull/2299) |  
| 2023-11-20 |

- Guidance

| **Clarified guidance for using layout grid utilities.** More information:
[ uswds-site#2149 ](https://github.com/uswds/uswds-site/pull/2149) |  
| 2023-11-09 | |

- Styles
- Settings

| **Fixed a bug that prevented`$theme-card-padding-y` from accepting expected token values. ** More
information: [ uswds#5571 ](https://github.com/uswds/uswds/pull/5571) |  
| 2023-09-29 | |

- Styles

| **Fixed a margin bug on header-first variants that caused exdent card media to overlap headers.**
More information: [ uswds#5423 ](https://github.com/uswds/uswds/pull/5423) |  
| 2023-09-20 |

- Guidance

| **Added`usa-card__header--exdent` variant to variants table. ** More information:
[ uswds-site#2228 ](https://github.com/uswds/uswds-site/pull/2228) |  
| 2023-08-23 | |

- Styles

| **Fixed a bug that prevented`$theme-card-border-width` from accepting `0` or string tokens. **
More information: [ uswds#5325 ](https://github.com/uswds/uswds/pull/5325) |  
| 2023-06-09 | |

- Accessibility
- Markup

| **Replaced`button` elements with links styled as buttons. ** More information:
[ uswds#4385 ](https://github.com/uswds/uswds/pull/4385) |  
| 2022-08-29 |

- Guidance

| **Added guidance for using aspect ratio utility classes.** More information:
[ uswds-site#1729 ](https://github.com/uswds/uswds-site/pull/1729) |  
| 2022-08-05 | |

- JavaScript
- Markup

| **Added`type="button"` to all non-form buttons to prevent default submit behaviors. ** This
allowed us to remove `preventDefault()` from the relevant component JavaScript. More information:
[ uswds#4695 ](https://github.com/uswds/uswds/pull/4695) |  
| 2022-04-28 | |

- Assets
- JavaScript
- Styles

| Breaking | Breaking **Updated to Sass module syntax and new package structure.** More information:
[ uswds#4656 ](https://github.com/uswds/uswds/pull/4656) |  
| 2021-06-16 | |

- Styles

| **Updated the exdent modifier to work as documented.** Now adding the `.usa-card__body--exdent`
modifier will work as expected. More information:
[ uswds#4165 ](https://github.com/uswds/uswds/pull/4165) |  
| 2021-03-17 |

- Guidance

| **Updated and improved guidance around cards.** More information:
[ uswds-site#1180 ](https://github.com/uswds/uswds-site/pull/1180) |  
Was this page helpful? designsystem.digital.gov An official website of the
[General Services Administration](https://gsa.gov) Looking for U.S. government information and
services? [Visit USA.gov](https://www.usa.gov/) Select "Yes" or "No." Add additional comments if you
would like to, then select "Submit." A red asterisk (*) indicates a required field.

### Success

Thank you. Your feedback has been received.

### Error

alert message _[_]: required
