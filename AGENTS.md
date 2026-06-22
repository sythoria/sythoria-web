# Agent Instructions

Instructions and guidelines for AI agents working on the Sythoria web project.

## Project Stack & Technologies

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Vanilla CSS (`src/app/globals.css`)
- **Icons**: Lucide React (`lucide-react`)
- **Testing**: Vitest (`vitest`) + React Testing Library
- **Documentation Engine**: Custom lightweight MDX frontmatter parser (`src/lib/docs.ts`) and next-mdx-remote

---

## Project Structure

```
sythoria-web/
├── public/                # Static assets (images, demo.mp4, logo)
├── src/
│   ├── app/               # App Router pages and layouts
│   │   ├── api/           # Serverless API routes
│   │   ├── docs/          # MDX documentation viewer page route
│   │   ├── globals.css    # Core global design system variables and custom styles
│   │   ├── layout.tsx     # Base layout structure
│   │   └── page.tsx       # Landing page entrypoint
│   ├── components/        # Component modularization
│   │   ├── docs/          # Documentation layout components (Sidebar, TopBar, Search)
│   │   ├── marketing/     # Landing page sections (Hero, Features, CTA, TerminalShowcase, BentoCard, etc.)
│   │   └── ui/            # Reusable UI primitives (Button, Card, Badge)
│   ├── content/           # Documentation MDX source files
│   │   └── docs/          # Quickstart, Configuration, Privacy pages + features/ & providers/
│   ├── hooks/             # Shared React hooks (scroll position, intersection observers, locks)
│   ├── lib/               # Core utility libraries (docs parsing, configurations, types)
│   └── utils/             # Helper utilities (storage wrappers, logging, validation)
```

---

## Development & Build Commands

Always execute commands in the root of the workspace.

| Command                | Action                                                       |
| ---------------------- | ------------------------------------------------------------ |
| `npm install`          | Install dependencies                                         |
| `npm run dev`          | Start development server on `localhost:3000`                 |
| `npm run build`        | Perform full production build (lints, formats, builds pages) |
| `npm run start`        | Start the production server                                  |
| `npm run lint`         | Run ESLint check                                             |
| `npm run lint:fix`     | Automatically fix fixable ESLint errors                      |
| `npm run format`       | Run Prettier formatter                                       |
| `npm run format:check` | Verify formatting across all code files                      |
| `npm run test`         | Run all unit tests once                                      |
| `npm run test:watch`   | Run unit tests in watch mode                                 |
| `npm run check`        | Run full pre-commit checklist (lint + format + test + build) |

---

## File-Scoped Commands

When working on individual files, use these helper commands:

| Task       | Command                                |
| ---------- | -------------------------------------- |
| **Lint**   | `npx eslint path/to/file.ts`           |
| **Format** | `npx prettier --write path/to/file.ts` |
| **Test**   | `npx vitest run path/to/file.test.ts`  |

---

## Testing Conventions

- All unit and component tests use **Vitest** and **React Testing Library**.
- Place test files next to the file they are testing using the `.test.tsx` or `.test.ts` convention (e.g., `Navbar.test.tsx` next to `Navbar.tsx`).
- Mock browser APIs such as `matchMedia` or `localStorage` inside the `beforeEach` hooks when testing layout/navbar components.
