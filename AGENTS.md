# Agent Instructions

## Package Manager

Use **npm**: `npm install`, `npm run dev`

## Staging and Committing

At the end of a session/task, always stage and commit changed files individually. Use the dedicated python skill to automate this:

```bash
python3 .agents/skills/commit_individual.py --auto
```

Do not include any `Co-Authored-By` attribution in the commit messages.

## File-Scoped Commands

| Task   | Command                                |
| ------ | -------------------------------------- |
| Lint   | `npx eslint path/to/file.ts`           |
| Format | `npx prettier --write path/to/file.ts` |
| Test   | `npx vitest run path/to/file.test.ts`  |

## Stack & Conventions

- **Next.js 16** (App Router assumed) - Read `node_modules/next/dist/docs/` for breaking changes.
- **Styling**: Tailwind CSS v4 or Vanilla CSS.
- **State**: Zustand
