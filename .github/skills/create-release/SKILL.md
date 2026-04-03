---
name: create-release
description: "Use when creating a new release, publishing to production, shipping changes, or cutting a version. Workflow: build a PR from dev to main with commit-based description, run security validation via app-security-reviewer, and on pass append a new entry to the RELEASES section of README. On security fail, cancel release and open a task PR with security findings."
argument-hint: "Optional: short release title or version label, e.g. 'v1.2.0' or 'auth improvements'"
user-invocable: true
---

# Create Release

## When to Use
- Publishing changes from `dev` to `main`
- Cutting a new release and recording it in the README
- Any time you hear: "create release", "ship to production", "open release PR", "publish"

## Inputs
- Optional: release title or version label (used in PR title and RELEASES entry)

## Procedure

### Step 1 — Collect commit history
Read the git log between `dev` and `main` to identify all commits that are part of this release:
```
git log main..dev --oneline
```
Group commits by type: features, fixes, security, chores.

### Step 2 — Build the release PR
Create a PR from `dev` → `main` with:
- **Title**: `release: <label or short summary>`
- **Assignee**: `carlCarlson6`
- **Reviewers**: `carlCarlson6` and Copilot (if available in repository settings)
- **Body** using [pr-body.md template](./assets/pr-body.md):
  - Summary paragraph (1–3 sentences)
  - Grouped change list (Features / Fixes / Security / Chores)
  - Diff stats (files changed, additions, deletions)

### Step 3 — Security validation gate
Invoke the **App Security Reviewer** agent on the diff between `dev` and `main`.

The agent returns a report with:
- `status`: `pass` or `fail`
- `findings`: list of issues with severity and description

#### Branch: FAIL
1. Do **not** merge or mark the release PR as ready.
2. Close or draft the release PR with a comment: _"Release blocked pending security findings — see task PR #<n>"_.
3. Open a **separate PR** (`task/sec-findings-<date>`) targeting `main` (or `dev`), with:
   - Title: `[security] add findings from failed release security scan`
   - Body listing each finding with severity
   - Assigns `carlCarlson6`, requests review from `carlCarlson6` and Copilot
4. Append each finding as a new unchecked task item under the `## Task` section in `README.md`, using format:
   ```
   - [ ] `SEC-XXX` <short title>
     Current risk: <description>
   ```
   Increment the SEC number from the highest existing one.
5. Stop. Report the findings list and the task PR link to the user.

#### Branch: PASS
Continue to Step 4.

### Step 4 — Append RELEASES entry
In `README.md`, under the `## RELEASES` section, prepend a new entry (most recent first):

```markdown
### <label> — <YYYY-MM-DD>
PR: <pr-url>
<one-sentence description of what this release delivers>
```

Use today's date. The description should summarize the grouped changes from Step 1 in one sentence.

### Step 5 — Final report
Return a concise summary:
- PR link (or reason it was blocked)
- Security status (pass / fail + finding count)
- RELEASES entry added (or skipped)
- Any new task items added to README

## Constraints
- Do not merge the PR — only open it and set reviewers.
- Do not skip the security gate even if there are no code changes.
- Do not add a RELEASES entry if the security check failed.
- Keep the RELEASES entry to one sentence.
