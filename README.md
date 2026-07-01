# Sythoria Web & Docs

Official landing page and documentation website for [Sythoria](https://github.com/sythoria/sythoria-desktop) — a lightweight, privacy-first AI desktop client.

Live website: [sythoria.app](https://sythoria.app)

---

## About Sythoria

Sythoria is a privacy-first, lightweight AI desktop chat client that allows you to connect to any OpenAI-compatible API (such as OpenAI, Anthropic, Google Gemini, Ollama, OpenRouter, NVIDIA NIM, and custom endpoints) using your own API keys. 

All API keys are stored securely in local storage and never leave your machine.

> [!NOTE]
> This repository contains the source code for the **official landing page and documentation website**.
> If you are looking for the desktop application itself, visit the [sythoria-desktop](https://github.com/sythoria/sythoria-desktop) repository.

---

## Tech Stack

This website is built using:
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Vanilla CSS (`src/app/globals.css`)
- **Icons**: Lucide React (`lucide-react`)
- **Testing**: Vitest (`vitest`) + React Testing Library
- **Documentation Engine**: Custom lightweight MDX frontmatter parser (`src/lib/docs.ts`) and `next-mdx-remote`

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Run Locally for Development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

---

## Scripts

The following commands are available:

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Lints, format-checks, and builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint check |
| `npm run lint:check` | Runs ESLint on the `src/` directory |
| `npm run lint:fix` | Automatically fixes fixable ESLint errors in `src/` |
| `npm run format` | Formats code with Prettier |
| `npm run format:check` | Verifies code formatting with Prettier |
| `npm run test` | Runs unit and component tests once with Vitest |
| `npm run test:watch` | Runs Vitest in watch mode |
| `npm run check` | Pre-commit check: runs linting, formatting, testing, and builds the production bundle |

---

## Testing

All tests use Vitest and React Testing Library. To run tests, execute:

```bash
npm run test
```

Test files are placed alongside the components they cover, using the `.test.tsx` or `.test.ts` naming convention.

---

## License

Open source under the MIT License.
