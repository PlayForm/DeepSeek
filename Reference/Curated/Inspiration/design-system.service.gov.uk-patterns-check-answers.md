# Help users to Check answers

Let users check their answers before submitting information to a service.

[Open this example in a new tab](https://design-system.service.gov.uk/patterns/check-answers/default/)

HTML

```html
<div class="govuk-width-container">
  <a href="#" class="govuk-back-link">Back
  <main class="govuk-main-wrapper " id="main-content" role="main">
    <div class="govuk-grid-row">
      <div class="govuk-grid-column-two-thirds-from-desktop">
        <h1 class="govuk-heading-l">Check your answers before sending your application</h1>
        <h2 class="govuk-heading-m">Personal details</h2>
        <dl class="govuk-summary-list govuk-!-margin-bottom-9">
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Name
            </dt>
            <dd class="govuk-summary-list__value">
              Sarah Phillips
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> name</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Date of birth
            </dt>
            <dd class="govuk-summary-list__value">
              5 January 1978
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> date of birth</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Customer reference
            </dt>
            <dd class="govuk-summary-list__value">
              Not provided
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> customer reference</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Address
            </dt>
            <dd class="govuk-summary-list__value">
              72 Guild StreetLondonSE23 6FH
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> address</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Contact details
            </dt>
            <dd class="govuk-summary-list__value">
              <p class="govuk-body">07700 900457
              <p class="govuk-body">sarah.phillips@example.com
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> contact details</span>
            </dd>
          </div>
        </dl>
        <h2 class="govuk-heading-m">Application details</h2>
        <dl class="govuk-summary-list govuk-!-margin-bottom-9">
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Previous application number
            </dt>
            <dd class="govuk-summary-list__value">
              502135326
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> previous application number</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Licence type
            </dt>
            <dd class="govuk-summary-list__value">
              For personal use
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> licence type</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Home address
            </dt>
            <dd class="govuk-summary-list__value">
              72 Guild StreetLondonSE23 6FH
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> home address</span>
            </dd>
          </div>
          <div class="govuk-summary-list__row">
            <dt class="govuk-summary-list__key">
              Licence period
            </dt>
            <dd class="govuk-summary-list__value">
              Valid for 6 months
            </dd>
            <dd class="govuk-summary-list__actions">
              <a class="govuk-link" href="#">Change<span class="govuk-visually-hidden"> licence period</span>
            </dd>
          </div>
        </dl>
        <h2 class="govuk-heading-m">Now send your application</h2>
        <p class="govuk-body">By submitting this application you are confirming that, to the best of your knowledge, the details you are providing are correct.
        <form action="/form-handler" method="post" novalidate>
          <input type="hidden" name="answers-checked" value="true">
          <button type="submit" class="govuk-button" data-module="govuk-button">
            Accept and send
          </button>
        </form>
      </div>
    </div>
  </main>
</div>
```

Nunjucks

```nunjucks
{% from "govuk/components/back-link/macro.njk" import govukBackLink %}{% from "govuk/components/summary-list/macro.njk" import govukSummaryList %}{% from "govuk/components/button/macro.njk" import govukButton %}{% block containerStart %}{{ govukBackLink({
    text: "Back",
    href: "#"
  }) }}{% endblock %}{% block content %}
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds-from-desktop">

      <h1 class="govuk-heading-l">Check your answers before sending your application</h1>

      <h2 class="govuk-heading-m">Personal details</h2>

      {{ govukSummaryList({
        classes: "govuk-!-margin-bottom-9",
        rows: [
          {
            key: {
              text: "Name"
            },
            value: {
              text: "Sarah Phillips"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "name"
                }
              ]
            }
          },
          {
            key: {
              text: "Date of birth"
            },
            value: {
              text: "5 January 1978"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "date of birth"
                }
              ]
            }
          },
          {
            key: {
              text: "Customer reference"
            },
            value: {
              text: "Not provided"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "customer reference"
                }
              ]
            }
          },
          {
            key: {
              text: "Address"
            },
            value: {
              html: "72 Guild Street<br>London<br>SE23 6FH"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "address"
                }
              ]
            }
          },
          {
            key: {
              text: "Contact details"
            },
            value: {
              html: '<p class="govuk-body">07700 900457</p><p class="govuk-body">sarah.phillips@example.com</p>'
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "contact details"
                }
              ]
            }
          }
        ]
      }) }}

      <h2 class="govuk-heading-m">Application details</h2>

      {{ govukSummaryList({
        classes: "govuk-!-margin-bottom-9",
        rows: [
          {
            key: {
              text: "Previous application number"
            },
            value: {
              text: "502135326"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "previous application number"
                }
              ]
            }
          },
          {
            key: {
              text: "Licence type"
            },
            value: {
              text: "For personal use"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "licence type"
                }
              ]
            }
          },
          {
            key: {
              text: "Home address"
            },
            value: {
              html: "72 Guild Street<br>London<br>SE23 6FH"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "home address"
                }
              ]
            }
          },
          {
            key: {
              text: "Licence period"
            },
            value: {
              text: "Valid for 6 months"
            },
            actions: {
              items: [
                {
                  href: "#",
                  text: "Change",
                  visuallyHiddenText: "licence period"
                }
              ]
            }
          }
        ]
      }) }}

      <h2 class="govuk-heading-m">Now send your application</h2>

      <p class="govuk-body">By submitting this application you are confirming that, to the best of your knowledge, the details you are providing are correct.

      <form action="/form-handler" method="post" novalidate>

        <input type="hidden" name="answers-checked" value="true">

        {{ govukButton({
          text: "Accept and send"
        }) }}

      </form>

    </div>
  </div>
{% endblock %}
```

## When to use this pattern

Show a single check answers page immediately before the confirmation screen for small to medium-sized transactions.

When designing a very large transaction with multiple sections, it may help to include a check answers pages at the end of each section.

This can be valuable for services where different users might be completing each section. You should test this approach with your users to find out if it's helpful.

Use the [Summary card component](https://design-system.service.gov.uk/components/summary-list/#summary-cards) when users need to check multiple things of the same type. For example to review a series of interview appointments or application choices.

## How it works

Check answers pages help to:

* increase users' confidence as they can clearly see that they have completed all the sections and that their data has been captured
* reduce error rates as users are given a second chance to notice and correct errors before submitting data

### Choose the right layout for the page

Many services ask users for short answers, which are suitable for a layout that takes up two-thirds of the screen on desktop devices. For example, the 'Check your answers before submitting your application' page included in this guidance.

Using a two-thirds layout stops lines of text getting so long that the page becomes difficult to read. To learn more about line length, see ['Layout'](https://design-system.service.gov.uk/styles/layout/). It also means the action links are closer to the other content on the page. Users with screen magnifiers are less likely to miss them.

However, if your service asks users for longer or more detailed answers, a full width layout may be more suitable.

### Make the page easy to understand

Use the page title to tell the user what they need to do - otherwise, they might miss the 'submit' button at the end of the page.

On the page, you should also:

* make it clear the transaction will not be complete until a user confirms their information is correct
* break the content up into sections when you can
* only show sections that are relevant to users - for example, if they've said they're from the UK, do not show sections for questions they have not answered about locations outside of the UK
* rephrase questions if you need to - for example, you do not need to label every individual line of an address, and you can rewrite long questions as shorter statements
* make sure the 'submit' button clearly shows the action it performs - for example, 'Change your tax details' or 'Send your claim form'

### Let users go back and change their answers

You should provide a 'Change' link next to each section on your check answers page so that users can add or change the information. 'Change' links contain hidden text to make them accessible to screen reader users. Update the hidden text to describe what each 'change' link is for.

If a user decides to go back to a previous answer, make sure information they've already entered is pre-populated.

The answers pages should look the same way they did when the user last used them.

When they've finished, the 'Continue' button should return them to the check answers page. They should not need to go through the rest of the transaction again.

If a user changes their response in a way that means you need to ask them more questions, do this before returning them to the check answers page.

If you have questions that are optional, let users know that they've skipped it without giving an answer by showing their response as 'Not provided'.

## Research on this pattern

Read a blog about [how the Carer's Allowance Service used check answers to improve its users' experience](https://dwpdigital.blog.gov.uk/2016/07/08/a-live-service-is-not-the-end-of-the-story/).

## Help improve this pattern

To help make sure that this page is useful, relevant and up to date, you can:

* take part in the ['Check answers' discussion on GitHub](https://github.com/alphagov/govuk-design-system/discussions/6105/) and share your research
* [propose a change on GitHub](https://github.com/alphagov/govuk-design-system/edit/main/src/patterns/check-answers/index.md) - read more about [how to propose changes in GitHub](https://design-system.service.gov.uk/community/propose-a-content-change-using-github/)

## Need help?

If you've got a question about the GOV.UK Design System, [contact the team](https://design-system.service.gov.uk/contact/).
