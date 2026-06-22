# Agent Instructions & Project Documentation

Instructions, conventions, and architectural details for AI agents working on the Sythoria web project.

---

## 1. Project Overview & Purpose

**Sythoria** is a privacy-first, lightweight AI interface that allows users to connect to any OpenAI-compatible API (OpenAI, Anthropic, Gemini, Ollama, OpenRouter, NVIDIA NIM) using their own API keys.

Historically, Sythoria was a web-based chat client. However, it has been transitioned to a **desktop-only application**.

- The desktop app codebase resides in a separate repository: [sythoria-desktop](https://github.com/sythoria/sythoria-desktop).
- This repository (`sythoria-web`) serves as the **official landing page and documentation website** for Sythoria.
- All actions on this website (navigation buttons, CTA actions, footers) guide the user to download the desktop app from the latest GitHub Release: `https://github.com/sythoria/sythoria-desktop/releases/latest`.

---

## 2. Technology Stack

- **Core Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Vanilla CSS (`src/app/globals.css`). The landing page relies on custom glassmorphic styling, animations, and radial glow effects.
- **Icons**: Lucide React (`lucide-react`)
- **Testing**: Vitest (`vitest`) + React Testing Library
- **Documentation Engine**: Custom lightweight MDX frontmatter parser (`src/lib/docs.ts`) and next-mdx-remote

---

## 3. Directory Layout & Architecture

```
sythoria-web/
├── public/                # Static assets (images, demo.mp4, logo)
│   ├── demo.mp4           # Video demonstration of the desktop application
│   └── logonobg.png       # Main Sythoria logo
├── src/
│   ├── app/               # Next.js App Router entry points
│   │   ├── docs/          # MDX documentation viewer page route
│   │   │   ├── [...slug]/ # Dynamic documentation viewer page (compiles MDX to html via next-mdx-remote)
│   │   │   └── page.tsx   # Index/Root docs redirect page
│   │   ├── globals.css    # Global CSS variables, design system tokens, animations, and layout stylings
│   │   ├── layout.tsx     # Next.js base HTML structure (html, body, metadata wrapper)
│   │   └── page.tsx       # Landing page (combines marketing components into a single spatial canvas)
│   ├── components/        # UI and Layout components
│   │   ├── docs/          # Documentation layout components
│   │   │   ├── Search.tsx # Docs search box with fuzzy matching preset suggestions
│   │   │   ├── Sidebar.tsx# Collapsible sidebar for docs navigation
│   │   │   └── TopBar.tsx # Top navigation bar for the docs section
│   │   ├── marketing/     # Landing page sections
│   │   │   ├── BentoCard.tsx            # Premium cards with glassmorphic glow effect
│   │   │   ├── Comparison.tsx           # Feature comparison table (Sythoria vs Others)
│   │   │   ├── CTA.tsx                  # Bottom Call To Action block (focuses on GitHub download)
│   │   │   ├── Features.tsx             # Bento-grid of desktop benefits (privacy, offline state)
│   │   │   ├── Footer.tsx               # Website footer containing MIT license and download links
│   │   │   ├── Hero.tsx                 # Landing intro (cinematic typography + simulated desktop launch CLI teaser)
│   │   │   ├── InteractiveGlowSphere.tsx# Custom canvas-based particle sphere decoration
│   │   │   ├── Navbar.tsx               # Floating website navigation bar with theme toggle
│   │   │   ├── SpatialCanvas.tsx        # Scroll-driven parallax container
│   │   │   └── TerminalShowcase.tsx     # Frame embedding demo.mp4 showcasing the app
│   │   └── ui/            # Reusable UI primitives (Button, Card, Badge)
│   ├── content/           # Documentation MDX source files
│   │   └── docs/          # MDX files loaded dynamically by getDocBySlug()
│   │       ├── configuration.mdx    # Application configuration instructions
│   │       ├── getting-started.mdx  # Desktop app download and setup guide
│   │       ├── privacy.mdx          # Privacy & security policies (API keys, statelessness)
│   │       ├── features/            # MDX detailed features (streaming.mdx, multi-provider.mdx)
│   │       └── providers/           # MDX provider configuration guides (openai, anthropic, ollama, etc.)
│   ├── hooks/             # Shared React hooks
│   │   ├── useDebounce.ts           # Debounce utility (used in search bar inputs)
│   │   ├── useScrollInView.ts       # Trigger fade-in animations on scroll entry
│   │   └── useScrollPosition.ts     # Track scroll state for showing back-to-top buttons
│   ├── lib/               # Business Logic
│   │   ├── config.ts                # General configuration parameters (debounce timing, provider presets)
│   │   ├── docs-nav.ts              # Builds structured navigation menus for the documentation sidebar
│   │   ├── docs.ts                  # Parses YAML frontmatter and retrieves markdown contents from files
│   │   └── types.ts                 # Common TypeScript interfaces (DocContent, NavGroup)
│   └── utils/             # Helpers
│       ├── generateId.ts            # Unique ID generator
│       ├── logger.ts                # App log wrappers
│       ├── storage.ts               # LocalStorage wrapper (primarily theme and settings caches)
│       └── validation.ts            # Validation schema parameters
```

---

## 4. Documentation Engine Mechanics (`src/lib/docs.ts`)

To avoid build issues with Turbopack and dependency-specific packages like `gray-matter` / `js-yaml` calling outdated methods during SSR, the website parses documentation metadata using a **custom lightweight YAML parser** inside `src/lib/docs.ts`:

- MDX files are parsed with the regex `^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$` which splits the frontmatter from the content.
- Simple key-value parsers extract `title` and `description` from the YAML block.
- Standard Markdown contents are then loaded by Next.js and compiled into pages.

---

## 5. Development & Build Commands

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

## 6. File-Scoped Commands

When working on individual files, use these helper commands:

| Task       | Command                                |
| ---------- | -------------------------------------- |
| **Lint**   | `npx eslint path/to/file.ts`           |
| **Format** | `npx prettier --write path/to/file.ts` |
| **Test**   | `npx vitest run path/to/file.test.ts`  |

---

## 7. Testing & Quality Conventions

- All unit and component tests use **Vitest** and **React Testing Library**.
- Place test files next to the file they are testing using the `.test.tsx` or `.test.ts` convention (e.g., `Navbar.test.tsx` next to `Navbar.tsx`).
- Mock browser APIs such as `matchMedia` or `localStorage` inside the `beforeEach` hooks when testing layout/navbar components.
- Run `npm run check` to verify that everything builds cleanly without errors before wrapping up.
