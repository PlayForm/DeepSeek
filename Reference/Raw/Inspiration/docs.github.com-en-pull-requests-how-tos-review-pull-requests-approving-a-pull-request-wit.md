[Skip to main content](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews#main-content)
# Approving a pull request with required reviews
Approve pull requests with required reviews, including setting approval rules, reviewing changes, and submitting feedback before merging.
Copy markdown
You can comment on a pull request, approve the changes, or request improvements before approving. See [Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request).
You can find a pull request where you or a team you're a member of is requested for review with the search qualifier `review-requested:[USERNAME]` or `team-review-requested:[TEAMNAME]`. For more information, see [Searching issues and pull requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests).
Tip
If a pull request you approved has changed significantly, you can dismiss your review. The pull request will need a new review before it can be merged. See [Dismissing a pull request review](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/dismissing-a-pull-request-review).
  1. Under your repository name, click **Pull requests**.
  2. In the list of pull requests, click the pull request you'd like to review.
  3. On the pull request, click **Files changed**.
  4. Review the changes in the pull request. Optionally, comment on specific lines or files. See [Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request#starting-a-review).
  5. Above the changed code, click **Review changes**.
  6. Type a comment summarizing your feedback on the proposed changes.
  7. Select **Approve** to approve merging the proposed changes.
  8. Click **Submit review**.


Tip
  * The **Request changes** option is purely informational and will not prevent merging unless a ruleset or classic branch protection rule is configured with the "require a pull request" option. If configured and a collaborator with `admin`, `owner`, or `write` access to the repository submits a review requesting changes, the pull request cannot be merged until the same collaborator submits another review approving the changes in the pull request.
  * Repository owners and administrators can merge a pull request even if it hasn't received an approving review, or if a reviewer who requested changes has left the organization or is unavailable.
  * If both required reviews and stale review dismissal are enabled and a code-modifying commit is pushed to the branch of an approved pull request, the approval is dismissed. The pull request must be reviewed and approved again before it can be merged.
  * When several open pull requests each have a head branch pointing to the same commit, you won’t be able to merge them if one or both have a pending or rejected review.
  * If your repository requires approving reviews from people with write or admin permissions, the reviewers sidebar groups approvals by permission level. Approvals can appear in two sections: 
    * The **top section** mostly contains approvals from people with write or admin permissions that count toward merge requirements. Approvals by GitHub Copilot also appear in this section even though GitHub Copilot reviews do not count toward those requirements.
    * The **collapsible section (if present)** shows approvals from reviewers whose reviews do not affect whether the pull request can be merged.
  * Pull request authors cannot approve their own pull requests. You will also not be able to approve a pull request that was raised by GitHub Copilot if it was you who assigned Copilot to the issue to which the pull request relates.


## [Further reading](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews#further-reading)
  * [Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)
  * [Commenting on a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/commenting-on-a-pull-request)


