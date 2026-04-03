---
applyTo: "**"
---
# Commit message convention

Every commit in this repository must follow this format:

```
[<task-code>] <short imperative summary>
```

Rules:
- `<task-code>` is the identifier derived from the README task (e.g. `security-high`, `security-medium`, `task-01`).
- The summary is imperative, lowercase, no trailing period, max 72 characters.
- If a commit resolves a task entirely, append a blank line followed by `Resolves: <task-code>` in the body.
- Never omit the task code prefix, even for minor or fix commits related to a task branch.

Examples:
```
[security-high] pin nitro dependency to fixed version

Resolves: security-high
```
```
[security-medium] rotate clerk env keys and remove plaintext secrets
```
