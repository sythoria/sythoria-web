# Agent Instructions

## Package Manager

Use **npm**: `npm install`, `npm run dev`

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
