---
description: "Quick-run prompt for the Task Executor agent. Use this to pick and complete a pending README task end-to-end with a single command."
agent: Task Executor
tools: [read, search, edit, execute, todo]
---
Use the **Task Executor** agent.

Pick the highest-severity pending task from the `## Task` section in README.md.

If multiple tasks have a direct development dependency between them, resolve them together in dependency order; otherwise pick exactly one.

For each selected task:
1. Analyse the current codebase state.
2. Build an implementation plan before making any edits.
3. Execute the plan on a dedicated branch (`task/<code>-<slug>`).
4. Open a PR assigned to carlCarlson6, request review from carlCarlson6 and Copilot.
5. Mark the task as done in README.md.

Additional constraints from the caller (if any): $constraints
