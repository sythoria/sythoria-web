# 🌌 Sythoria Web & Docs

Official landing page and documentation hub for **[Sythoria](https://github.com/sythoria/sythoria-desktop)** — a privacy-first, lightweight AI desktop assistant.

[![Website](https://img.shields.io/badge/website-sythoria.app-blueviolet?style=flat-square)](https://sythoria.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

---

> [!NOTE]
> This repository contains the source code for the **official landing page and documentation website**.
> For the desktop chat application itself, please visit the **[sythoria-desktop](https://github.com/sythoria/sythoria-desktop)** repository.
> All download links, CTAs, and releases on this site point directly to the latest desktop application build.

---

## ✨ Features

- **🛸 Premium Design System**: Crafted with custom glassmorphism, radial glow tracking, particle canvases, and hardware-accelerated scroll-driven animations.
- **📖 Dynamic Documentation Engine**: Powered by a custom lightweight regex-based frontmatter parser (to prevent SSR/Turbopack overheads) and `next-mdx-remote`.
- **🔍 Intelligent Search**: Fuzzy-matching documentation search with preset categories.
- **⚡ Performance-First**: Zero-telemetry, static generation where possible, and optimized asset delivery using Next.js Image optimization.
- **🌓 Dark Mode**: Seamless dark-mode experience synced via local storage.

---

## 🛠️ Tech Stack

- **Core Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Tailwind CSS v4 + Custom design tokens (`src/app/globals.css`)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Documentation**: Custom lightweight MDX frontmatter parser (`src/lib/docs.ts`) & `next-mdx-remote`
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation & Run

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/sythoria/sythoria-web.git
   cd sythoria-web
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Start the local development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Directory Structure

```
sythoria-web/
├── public/                 # Static assets (images, logos, demo video)
├── src/
│   ├── app/                # Next.js App Router entry pages and routes
│   │   ├── docs/           # Dynamic documentation hub route
│   │   └── globals.css     # Design tokens, gradients, noise & core CSS
│   ├── components/         # Reusable application components
│   │   ├── docs/           # Documentation specific components (Search, Sidebar, etc.)
│   │   ├── marketing/      # Interactive landing page sections (Hero, Comparison, Bento features)
│   │   └── ui/             # Design primitives (Buttons, Badges, Cards)
│   ├── content/            # Source markdown/MDX docs
│   ├── hooks/              # Custom utility React hooks
│   ├── lib/                # Custom MDX parser, nav builder, and types
│   └── utils/              # Helper modules (logger, storage caching, etc.)
```

---

## 🧪 Development Scripts

The project includes several utilities to make formatting, linting, testing, and building efficient:

| Command                 | Action                                                                     |
| ----------------------- | -------------------------------------------------------------------------- |
| `npm run dev`           | Run Next.js development server on `http://localhost:3000`                  |
| `npm run build`         | Perform full production build (lint check + format check + static compile) |
| `npm run start`         | Start the compiled production build locally                                |
| `npm run check`         | Run pre-commit script checking linting, formatting, testing, and building  |
| `npm run lint`          | Run ESLint check                                                           |
| `npm run lint:fix`      | Auto-fix all ESLint errors where possible                                  |
| `npm run format`        | Run Prettier formatter                                                     |
| `npm run format:check`  | Verify formatting across all source files                                  |
| `npm run test`          | Run Vitest suite                                                           |
| `npm run test:watch`    | Run Vitest in watch mode                                                   |
| `npm run test:coverage` | Generate Vitest coverage reports                                           |

---

## 📐 Testing & Conventions

- All component and unit tests are powered by **Vitest** and **React Testing Library**.
- Place test files next to the file they are testing (e.g. `Navbar.test.tsx` next to `Navbar.tsx`).
- Before pushing your changes, run the complete check tool to ensure everything is compliant:
  ```bash
  npm run check
  ```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
