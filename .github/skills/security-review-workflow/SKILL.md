---
name: security-review-workflow
description: 'Run a security review workflow from dev: create security-review timestamp branch, invoke App Security Reviewer, compare findings with README pending tasks, append missing findings as new README tasks, and open a PR to dev. Trigger words: security review, review workflow, app-security-reviewer, README tasks, create security-review branch, open PR.'
argument-hint: 'Optional: scope (full|diff), severity floor, max new tasks, timestamp override (YYYYMMDDHHMMSS)'
user-invocable: true
disable-model-invocation: false
---

# Security Review Workflow

Use this skill to run a repeatable security-review pass and convert net-new findings into tracked README tasks.

## Inputs

- `scope` (optional): `full` (default) or `diff`
- `severity_floor` (optional): `medium` (default), `high`, or `critical`
- `max_new_tasks` (optional): default `5`
- `timestamp` (optional): override branch timestamp in `YYYYMMDDHHMMSS`

## Outcome

- A branch named `security-review/YYYYMMDDHHMMSS` created from `dev`
- Security findings from `App Security Reviewer`
- Findings compared against existing README tasks
- New README tasks appended for unmatched findings, using [task template](../../assets/task-template.md)
- A PR from `security-review/YYYYMMDDHHMMSS` to `dev`

## Procedure

1. Prepare git state on `dev`.
- Verify current branch. If not `dev`, checkout `dev`.
- Sync base branch (`git pull --ff-only origin dev`) when remote is available.
- If working tree is dirty, stop and report blockers instead of auto-stashing.

2. Create timestamped review branch.
- Build timestamp as UTC `YYYYMMDDHHMMSS` unless `timestamp` input is provided.
- Create and switch branch: `security-review/<timestamp>`.

3. Collect current task context from README.
- Read `README.md` and parse the `## Task` section.
- Extract both checked and unchecked task IDs and summaries.
- Build a dedup key list from normalized summary text plus risk sentence.

4. Run security review agent.
- Invoke subagent `App Security Reviewer`.
- Provide scope context:
  - `full`: review current repository state.
  - `diff`: review changes between `dev` and current branch.
- Request findings in severity order with: title, severity, affected area, evidence, risk, recommended fix.

5. Normalize and triage findings.
- Keep only findings at or above `severity_floor`.
- Merge duplicates by title + affected area + root cause.
- Cap to `max_new_tasks` if too many results.

6. Compare findings against README tasks.
- For each triaged finding, mark as `already tracked` when a matching task summary/risk exists.
- Mark remaining findings as `net new`.

7. Append new tasks to README.
- If there are `net new` findings, append tasks under `## Task` using [single task item template](../../assets/task-template.md).
- Generate next sequential ID using the existing prefix convention in README (for example `SEC-004` after `SEC-003`).
- Task line format:
  - `- [ ] \`SEC-XXX\` <imperative summary>.`
  - `  Current risk: <one concise sentence>.`
- Do not edit existing completed tasks.

8. Persist review output.
- Create or update a report at `docs/security-reviews/security-review-<timestamp>.md` containing:
  - Review scope and branch
  - Raw findings from `App Security Reviewer`
  - Mapping table: finding -> existing task (or new task ID)
  - Net-new tasks created
  - Residual risks and validation gaps

9. Validate and commit.
- Validate markdown formatting if tooling is available; otherwise do a manual pass for list integrity.
- Commit only security-review artifacts and README updates.
- Follow commit message rules in `/.github/instructions/commit-messages.instructions.md`.

10. Create PR to `dev`.
- Open PR from `security-review/<timestamp>` into `dev`.
- PR title: `[security-review] add security findings and README task tracking (<timestamp>)`
- PR body must include:
  - Objective
  - Scope (`full` or `diff`)
  - Findings summary by severity
  - Existing vs net-new task mapping
  - Files changed
  - Validation performed
  - Follow-up actions
- Request reviewers according to repository policy.

## Decision Rules

- If no findings meet `severity_floor`, do not add README tasks. Still create report and PR noting no actionable findings.
- If branch `security-review/<timestamp>` already exists, generate a new timestamp and continue.
- If `README.md` has no `## Task` section, stop and report a blocker with a suggested patch.
- If permissions block PR creation, provide exact next commands and generated PR body text.

## Completion Checklist

- Confirm active branch is `security-review/<timestamp>` based on `dev`
- Confirm `App Security Reviewer` was invoked
- Confirm README comparison was performed
- Confirm only net-new findings were added as tasks
- Confirm report file was written
- Confirm PR target is `dev`

## Example Prompts

- `/security-review-workflow run full review and add missing tasks`
- `/security-review-workflow scope=diff severity_floor=high`
- `/security-review-workflow scope=full max_new_tasks=3`
