[Skip to main content](https://docs.github.com/en/pull-requests/reference/pull-requests#main-content)
# Pull requests
Propose, review, and merge code changes using pull requests to collaborate effectively and maintain code quality.
Copy markdown
Pull requests are proposals to merge code changes into a project. A pull request is GitHub's key **collaboration feature** , letting you discuss and review changes before merging them. This helps teams work together, catch issues early, and maintain code quality.
[View your pull requests ](https://github.com/pulls?ref_product=github&ref_type=engagement&ref_style=button)
## [Working with pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests#working-with-pull-requests)
A pull request brings together the context reviewers need to understand a change. This context is organized into tabs:
  * The **Conversation** tab shows the description, timeline, comments, and reviews.
  * The **Commits** tab shows how the pull request branch changed over time.
  * The **Checks** tab shows automated tests, builds, and other validations.
  * The **Files changed** tab shows the diff that reviewers use to understand the proposed changes.
  * The **Findings** tab shows automated code review results, such as code scanning alerts, for the proposed changes.


Separately from the tabs, the **merge status** highlights blockers, missing approvals, and other requirements before merging. It appears in the pull request header and in the merge box.
Together, these views help authors and reviewers discuss the change, track feedback, and decide when the pull request is ready to merge.
## [Draft pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests#draft-pull-requests)
When you create a pull request, you can choose to make it a draft pull request. Draft pull requests cannot be merged, and code owners are not automatically requested to review them. Drafts are useful when you want to share work-in-progress without formally requesting reviews.
When you're ready to get feedback on your pull request, you can mark your draft pull request as ready for review. Marking a pull request as ready for review will request reviews from any code owners. You can convert a pull request to a draft at any time. See [Changing the stage of a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/changing-the-stage-of-a-pull-request).
## [Pull request refs and merge branches](https://docs.github.com/en/pull-requests/reference/pull-requests#pull-request-refs-and-merge-branches)
When you open a pull request, GitHub creates temporary Git references that point to the pull request's head branch and, when possible, to a simulated merge result. These refs help GitHub and integrations evaluate the pull request without changing the base branch.
For most contributors, these refs stay in the background. They are most relevant when you are building automation, debugging CI behavior, or fetching pull request state locally. For information about how GitHub Actions uses the merge branch, see [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#how-the-merge-branch-affects-your-workflow).
## [Differences between commits on compare and pull request pages](https://docs.github.com/en/pull-requests/reference/pull-requests#differences-between-commits-on-compare-and-pull-request-pages)
Compare pages and pull request pages can calculate changed files from different merge bases. As a result, the same branches can sometimes show different diffs in each place.
This usually matters when the base branch has changed since the pull request was created. Pull request pages focus on what the pull request introduced, while compare pages reflect the current comparison between two refs.
## [Collaborative development models](https://docs.github.com/en/pull-requests/reference/pull-requests#collaborative-development-models)
The way you use pull requests depends on the type of development model you use in your project. You can use the fork and pull model or the shared repository model.
### [Fork and pull model](https://docs.github.com/en/pull-requests/reference/pull-requests#fork-and-pull-model)
In the fork and pull model, anyone can fork an existing ("upstream") repository if they have read access and the owner of the upstream repository allows it. Be aware that a fork and its upstream share the same Git data. This means that all content uploaded to a fork is accessible from the upstream and all other forks of that upstream.
You do not need permission from the upstream repository to push to a fork you created. You can optionally allow anyone with push access to the upstream repository to make changes to your pull request branch. This model is popular with open-source projects because it reduces friction for new contributors and lets people work independently without upfront coordination.
Tip
For more information on open source, specifically how to create and grow an open source project, we've created [Open Source Guides](https://opensource.guide/) that will help you foster a healthy open source community. You can also take a free [GitHub Skills](https://skills.github.com/) course on maintaining open source communities.
### [Shared repository model](https://docs.github.com/en/pull-requests/reference/pull-requests#shared-repository-model)
In the shared repository model, collaborators have push access to a single shared repository and create topic branches when they need to make changes. Pull requests are useful in this model because they start code review and general discussion about a set of changes before the changes are merged into the main development branch. This model is more common with small teams and organizations collaborating on private projects.
## [Further reading](https://docs.github.com/en/pull-requests/reference/pull-requests#further-reading)
  * [Creating a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)
  * [Commenting on a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/commenting-on-a-pull-request)
  * [Creating a pull request from a fork](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)
  * [Allowing changes to a pull request branch created from a fork](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork)


