# Sythoria website

Official landing page and documentation site for [Sythoria Desktop](https://github.com/sythoria/sythoria-desktop), a Tauri desktop client for local and hosted language models.

The chat application is maintained in the desktop repository. This repository contains only the public website, documentation, and GitHub release feed. Download links resolve to the current stable GitHub release.

## Stack

- Next.js 16 App Router and React 19
- Tailwind CSS 4 plus route/component styles in `src/app/globals.css`
- MDX content rendered with `next-mdx-remote`
- Vitest and React Testing Library

## Requirements

- Node.js 20.9 or later
- npm with the committed lockfile

## Local development

```bash
git clone https://github.com/sythoria/sythoria-web.git
cd sythoria-web
npm ci
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local` only when an override is required. `GH_TOKEN` is optional and is used server-side to reduce GitHub API rate-limit failures; it must never use the `NEXT_PUBLIC_` prefix.

## Quality commands

| Command                 | Purpose                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `npm run format:check`  | Verify Prettier formatting                                                          |
| `npm run lint:check`    | Run ESLint                                                                          |
| `npm run typecheck`     | Run TypeScript without emitting files                                               |
| `npm run content:check` | Validate frontmatter, navigation, links, unsafe guidance, and desktop preset parity |
| `npm test`              | Run unit/component tests once                                                       |
| `npm run test:coverage` | Run tests with V8 coverage                                                          |
| `npm run test:e2e`      | Run production browser, axe, keyboard, header, and reflow checks                    |
| `npm run build`         | Run static checks and create a production build                                     |
| `npm run check`         | Run the complete local release gate                                                 |
| `npm run audit:prod`    | Fail on high-severity production dependency advisories                              |

## Documentation source of truth

`src/content/desktop-facts.json` is the versioned contract between the desktop application and this site. It records the verified desktop source revision, release, supported artifacts, shortcuts, search services, limits, and provider presets. Documentation pages include `lastVerifiedVersion`, `lastVerifiedDate`, and `source` frontmatter.

`npm run content:check` also compares that manifest with a sibling `sythoria-desktop` checkout. Set `SYTHORIA_DESKTOP_PATH` when the desktop repository is elsewhere. The check is skipped when no desktop checkout is available, which keeps standalone website builds working.

When the desktop release changes:

1. update the manifest from the tagged desktop source and actual release assets;
2. review every page whose named source changed;
3. update its verification metadata;
4. run `npm run content:check`; and
5. verify download, privacy, platform, shortcut, and provider statements in the production preview.

Never invent release data when GitHub is unavailable. `src/lib/changelog.ts` validates live GitHub responses and falls back only to a checked-in snapshot of a real stable release with a visible stale-data notice.

## Deployment configuration

- Set `NEXT_PUBLIC_SITE_URL` when the canonical origin differs from `https://sythoria.com`.
- Optionally set server-only `GH_TOKEN` for GitHub API requests.
- Verify CSP and other headers against the deployed origin.
- Keep large videos and other media on an intentional cache/encoding budget.

## Licensing status

No license file is currently present in this repository. Source visibility does not by itself grant reuse or redistribution rights. The project owner must add an authoritative license before the website claims a specific open-source license.
