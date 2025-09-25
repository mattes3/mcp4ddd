# Tasks

## Commit Message Schema
**Last documented:** 2025-09-25
**Description:** Standardized format for commit messages in the mcp4ddd project, following Conventional Commits for compatibility with Changesets, but with past tense instead of imperative mood.

**Schema:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Components:**
- **Type** (required): feat, fix, docs, style, refactor, test, chore, perf, ci
- **Scope** (recommended): Package name (scaffolder, runtime, testbed) or omit for project-wide
- **Description** (required): Past tense, 50 chars max. Use verbs like "added", "fixed", "updated", "removed".
- **Body** (optional): Detailed explanation
- **Footer** (optional): BREAKING CHANGE, issue references, co-authors

**Examples:**
- `feat(scaffolder): added domain event generator tool`
- `fix(runtime): corrected AsyncResult error propagation`
- `docs: updated README with PostgreSQL repository generation`
- `chore: updated TypeScript to version 5.3`
- `style(scaffolder): formatted templates with consistent indentation`
- `refactor(runtime): extracted error handling into separate module`
- `test(scaffolder): added integration tests for value object generation`
- `perf(runtime): optimized WorkflowStart for large result chains`
- `ci: configured automated testing for pull requests`

**Important notes:**
- Aligns with Changesets for automated changelog generation
- Use past tense for descriptions (custom project convention, "Fixed the bug" instead of "Fix bug")
- Include scope for monorepo clarity
- Add ! for breaking changes: `feat(scaffolder)!: remove deprecated API`
