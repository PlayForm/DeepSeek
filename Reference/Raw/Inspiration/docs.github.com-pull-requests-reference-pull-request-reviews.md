[Skip to main content](https://docs.github.com/en/pull-requests/reference/pull-request-reviews#main-content)
# Pull request reviews
Review pull requests to provide feedback, suggest changes, and ensure code quality before merging.
Copy markdown
Pull request reviews let people comment on changes, suggest improvements, and approve or request changes before code is merged. Anyone with read access can review and comment on proposed changes, helping teams maintain code quality and share knowledge.
[View pull requests awaiting your review](https://github.com/pulls/review-requested?ref_product=github&ref_type=engagement&ref_style=button)
## [Review decision types](https://docs.github.com/en/pull-requests/reference/pull-request-reviews#review-decision-types)
When a reviewer submits a review, they choose one of the following decisions:  
| Comment  | Leaves general feedback without explicitly approving or requesting changes.  |  
| --- | --- |  
| Approve  | Signals that the changes are ready to merge.  |  
| Request changes  | Flags feedback that the author should address before merging.  |  
Reviewers can also comment on specific lines, suggest exact changes, and discuss implementation details. Review conversations appear in the pull request timeline so the team can track feedback and decisions.
## [Requesting and requiring reviews](https://docs.github.com/en/pull-requests/reference/pull-request-reviews#requesting-and-requiring-reviews)
Reviews can be requested from specific people or teams when they need feedback from the right experts.
To request a review, you need write access to the repository. You can request a review from a person or team with read access to the repository, and they receive a notification.
Warning
Requesting a review from a large team can notify every team member. You can reduce notifications by enabling auto assignment, or by enabling **Only notify requested team members** and also requesting a specific team member. See [Managing code review settings for your team](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team).
  * Pull request authors can request reviews only if they are repository owners or collaborators with write access.
  * Organization members with write access or triage permissions can also assign a reviewer for a pull request.
  * If you request a review from a team and code review assignment is enabled, specific members will be requested and the team will be removed as a reviewer.


If you define code owners in a CODEOWNERS file, GitHub can automatically request review from owners when a pull request changes their code. See [Requesting a pull request review](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/requesting-a-pull-request-review).
Repository administrators can require approvals before pull requests are merged. Required reviews help protect important branches and reduce accidental merges. See [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-pull-request-reviews-before-merging).
## [Further reading](https://docs.github.com/en/pull-requests/reference/pull-request-reviews#further-reading)
  * [Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)
  * [Requesting a pull request review](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/requesting-a-pull-request-review)
  * Learn more in the [Review pull requests](https://github.com/skills/review-pull-requests?ref_product=github&ref_type=engagement&ref_style=text) GitHub Skills course


