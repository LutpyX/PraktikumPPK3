# Git Workflow Rule

Setiap kali selesai mengerjakan fitur/perubahan yang sudah siap digunakan, ikuti langkah berikut:

## Steps
1. `git status` — review what changed
2. `git add .` — stage changes
3. Create a **Conventional Commit**: `<type>(<scope>): <description>`
4. `git push`

## Commit Types
| Type | Usage |
|------|-------|
| `feat` | new feature |
| `fix` | bug fix |
| `docs` | documentation |
| `style` | formatting/style (no logic change) |
| `refactor` | code restructuring |
| `perf` | performance improvement |
| `test` | adding/updating tests |
| `chore` | dependency/config/tooling |
| `ci` | CI/CD pipeline |
| `revert` | revert a previous commit |

## Commit Message Format
- Language: English
- Mood: imperative (e.g. "add", not "added" or "adds")
- Case: lowercase
- Length: ideally 50–72 characters
- No period at the end

### Examples
```
feat(auth): add user login
fix(api): handle invalid request
feat(dashboard): add user statistics
chore(deps): update dependencies
```

## Safety Checks — Do NOT push if:
- Work is not yet complete
- Commit failed
- There are unresolved errors
- Changes could overwrite a teammate's work

Before committing, verify that staged changes are only from the current task.

## Post-Push Report
After a successful push, always report:
```
Commit: <commit message>
Branch: <branch>
Status: pushed successfully
```
