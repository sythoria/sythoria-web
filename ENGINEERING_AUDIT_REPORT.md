# Sythoria Website Production-Readiness Audit

**Audit date:** 2 August 2026  
**Repository:** `sythoria-web` (`master`, audited at `abc4130`)  
**Companion application:** `sythoria-desktop` (audited at `423cf87e5bfa33490ebeb308db78e5f2637f9957`; current release `v0.4.2`)  
**Scope:** Engineering, performance, documentation, accessibility, user experience, SEO, architecture, code quality, dependencies, security, and testing  
**Change constraint:** Preserve the existing visual design. The recommendations below improve correctness, trust, speed, accessibility, and maintainability without proposing a visual redesign.

## Executive summary

Sythoria's website is visually cohesive, builds successfully, has a coherent component structure, and already covers an unusually broad portion of the desktop application's feature set. Its 74 unit tests pass, TypeScript passes, the production build emits all 28 routes successfully, and a crawl found no genuine broken links. Lighthouse's automated SEO and best-practice checks also score well.

It is nevertheless **not production-release-ready in its current state**. The most serious problems are not cosmetic:

1. The dependency tree contains five high-severity advisories, including multiple vulnerabilities in the pinned Next.js version.
2. The changelog silently falls back to invented future releases, dates, assets, download counts, and feature claims if GitHub cannot be reached. This is a release-blocking trust failure.
3. Documentation materially disagrees with the current desktop application about supported platforms, minimum macOS version, storage encryption, the runtime architecture, keyboard shortcuts, logging, GPU support, model identifiers, and provider defaults.
4. Several instructions encourage users to bypass macOS/Windows security warnings, use a wildcard Ollama origin, use a VPN to circumvent provider availability, or run destructive/background shell commands without adequate safeguards.
5. The site claims MIT licensing but contains no license file. The audited desktop repository's GitHub metadata also reports no detected license.
6. The landing page transfers about 6.3 MiB in the mobile Lighthouse run, reaches a 6.2-second LCP, and continues substantial animation work while idle—even when reduced motion is requested.
7. Core keyboard and assistive-technology flows are incomplete: modals and drawers do not trap focus, restore focus, expose dialog state, or close consistently; documentation tables overflow at mobile and desktop widths; reduced motion does not stop the canvas or video; and automated contrast testing finds extensive failures.
8. The documented `npm run check` gate fails on formatting, the documented coverage command cannot run, and no CI workflow protects production branches.

The appropriate maturity label is **functional beta / release candidate requiring remediation**, not production-ready. The good news is that the problems are tractable. Most of the release blockers involve source-of-truth discipline, safer documentation, dependency updates, and configuration—not a design rewrite.

### Production-readiness scorecard

| Area                                  | Assessment                                                                        | Release effect      |
| ------------------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| Build and type safety                 | Production build and `tsc` pass                                                   | Positive baseline   |
| Unit tests                            | 74/74 pass; coverage command broken                                               | Partial confidence  |
| Dependency security                   | 5 high advisories                                                                 | **Release blocker** |
| Content integrity                     | Fabricated changelog fallback and extensive desktop/site drift                    | **Release blocker** |
| Installation and operational guidance | Security-bypass and unsafe network/shell advice                                   | **Release blocker** |
| Licensing                             | MIT claimed; no license file present                                              | **Release blocker** |
| Performance                           | Mobile Lighthouse 68–78; home LCP 6.2 s and ~6.3 MiB transfer                     | Major remediation   |
| Accessibility                         | Lighthouse 96–98 but important WCAG failures missed by it                         | Major remediation   |
| SEO/discovery                         | Basic crawlability good; metadata/discovery incomplete                            | Needs work          |
| Architecture                          | Sensible Next.js structure; client boundaries and content sources need tightening | Moderate            |
| Maintainability                       | Dead dependencies/files, duplicated code, 1,954-line global stylesheet            | Needs work          |
| Production operations                 | No CI, performance budget, content-parity gate, or security headers               | Major remediation   |

## Scope, method, and evidence

This was an audit, not an implementation pass. Existing source files—including the user's uncommitted changes—were left untouched. The only repository addition is this report.

The assessment included:

- A complete repository inventory, targeted source review, dependency graph inspection, static duplication analysis, and dead-code/dependency analysis.
- `npm test`, `npx tsc --noEmit`, `npx next build`, `npm run check`, `npm run test:coverage`, and `npm audit`.
- Production-mode runtime inspection with `next start`, response-header inspection, route-size extraction, and internal/external link crawling.
- Mobile Lighthouse runs against the landing page, Getting Started, and Changelog.
- Automated accessibility scans plus manual browser checks for focus, keyboard escape, dialog/drawer semantics, viewport reflow, reduced motion, headings, labels, tab semantics, and mobile navigation.
- Comparison against the current `sythoria-desktop` source and GitHub release assets rather than treating website prose as authoritative.
- Provider-model verification against primary vendor documentation where model identifiers or availability are volatile.
- A prose-quality pass specifically looking for generic AI-style promotional language, unsupported absolutes, and repetitive boilerplate.

### Important measurement caveats

- Lighthouse ran against a local production build with its standard mobile CPU/network simulation. A single run is diagnostic, not a statistical benchmark; CI should record at least three runs and use the median.
- Browser CPU samples are hardware- and browser-dependent. They are useful for identifying continuous work, not for predicting every user's battery drain.
- Automated accessibility scores cover only a subset of WCAG. Manual failures in this report take precedence over a high aggregate score.
- Provider catalogs and GitHub release assets are volatile. The report records the state verified on the audit date and recommends automated source-of-truth checks.

## Measured baseline

### Quality commands

| Command                 | Result                                               | Interpretation                                                                        |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm test`              | 10 files, 74 tests passed                            | Existing unit suite is healthy within its narrow scope                                |
| `npx tsc --noEmit`      | Passed                                               | No TypeScript errors found                                                            |
| `npx next build`        | Passed; 28 static routes                             | Production compilation succeeds                                                       |
| `npm run check`         | Failed after lint because Prettier reported 13 files | The documented pre-commit/release gate is currently red and never reached tests/build |
| `npm run test:coverage` | Failed; `@vitest/coverage-v8` missing                | README documents a capability the repository cannot execute                           |
| `npm audit`             | 5 high, 0 critical                                   | Production release should be blocked until resolved or formally risk-accepted         |

### Runtime and Lighthouse baseline

| Route                   | Performance | Accessibility | Best practices | SEO |   FCP |   LCP |    TBT | CLS | Transfer |
| ----------------------- | ----------: | ------------: | -------------: | --: | ----: | ----: | -----: | --: | -------: |
| `/`                     |          69 |            98 |            100 | 100 | 1.4 s | 6.2 s | 310 ms |   0 | 6.33 MiB |
| `/docs/getting-started` |          78 |            96 |            100 | 100 | 1.2 s | 5.3 s | 170 ms |   0 | 0.76 MiB |
| `/changelog`            |          68 |            96 |            100 | 100 | 1.5 s | 6.4 s | 300 ms |   0 | 0.87 MiB |

Additional observations:

- The homepage's two demo files are 9.84 MiB and 12.29 MiB on disk. The Lighthouse run downloaded 5.47 MiB of video ranges before interaction.
- Light-theme startup begins dark-video requests before switching to the light video, producing avoidable requests and transfer.
- Parsed initial JavaScript was about 254 KiB gzip on `/`, 241 KiB on Getting Started, and 289 KiB on Changelog. Lighthouse estimated roughly 191 KiB of unused JavaScript on the homepage and 146 KiB on Changelog.
- Changelog HTML is about 206 KiB raw/33 KiB gzip and builds a 3,463-node DOM because all release bodies are rendered and hydrated together.
- The 2,000×2,000 favicon/icon payload is 354 KiB and is transferred on first visits to content pages. Static media is served with `Cache-Control: public,max-age=0`.
- The docs sidebar eagerly prefetches many visible routes as RSC payloads. The homepage also prefetches Changelog content that the visitor may never open.
- In a five-second settled local sample, the landing page consumed roughly 1.1–1.4 CPU-seconds and Changelog roughly 0.68–0.88 CPU-seconds. Reduced-motion emulation did not reduce landing-page work.

### Accessibility baseline

- Automated axe-based scans reported 25 homepage issues, 47 Getting Started issues, and 851 Changelog instances. Almost all were color-contrast failures; the homepage also raised the autoplay video's caption requirement for verification.
- Muted text tokens measured as low as 2.99:1 in light mode and 3.77–4.18:1 in dark surfaces. White text on the light-blue accent measured about 2.35:1.
- At 320 and 375 CSS pixels, documentation content reached about 715 pixels wide because tables and tab rows do not reflow. A provider table still exceeded its container at a 1,024-pixel viewport.
- Search focus escaped into the background after keyboard tabbing; Escape closed it but returned focus to the document body. Mobile navigation drawers did not expose dialog state or consistently close with Escape.
- At reduced motion, the canvas, autoplay video, and multiple infinite animations continued. Fourteen animations were observed on the homepage.

## Release priorities

### P0 — block a production release

| ID       | Required outcome                                                                              | Why it blocks release                                                                                     |
| -------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| SEC-01   | Upgrade vulnerable runtime dependencies and remove vulnerable overrides                       | Known high-severity vulnerabilities affect the production framework and image/runtime transitive packages |
| DATA-01  | Eliminate fabricated changelog releases                                                       | Users can be shown nonexistent versions, claims, assets, and counts when the API fails                    |
| DOC-01   | Reconcile the site with `v0.4.2` source and actual release assets                             | Installation, privacy, provider, shortcut, logging, and capability claims are materially wrong            |
| DOC-02   | Remove unsafe security-bypass, wildcard-origin, circumvention, and destructive-shell guidance | Current instructions can weaken a user's machine/network security or cause data loss                      |
| LEGAL-01 | Add and verify the claimed license                                                            | “MIT licensed” is not substantiated by a repository license file                                          |
| OPS-01   | Make the release gate green and add CI                                                        | The published quality command fails and no automated branch protection exists                             |

### P1 — complete before broad public promotion

- Stop continuous/offscreen/reduced-motion animation and optimize theme-specific video delivery.
- Repair keyboard focus management, dialogs/drawers, mobile reflow, landmarks, headings, labels, and contrast.
- Server-render and paginate/collapse Changelog content; reduce indiscriminate route prefetch.
- Add production security headers, correct metadata, sitemap, robots rules, canonical/social cards, and structured data based only on verified facts.
- Replace manual docs duplication with a validated content manifest and source-parity checks.

### P2 — hardening and maintainability

- Remove dead files/dependencies/exports, factor repeated diagram and glow mechanics, and split route-specific CSS.
- Add browser, accessibility, link, metadata, content-parity, and performance-budget tests.
- Harden utility edge cases, theme lifecycle handling, fetch validation, and path containment.
- Add versioned screenshots and task-oriented troubleshooting while retiring generic or unsupported prose.

## Detailed findings and recommendations

Every finding below includes the fields requested for implementation planning. **Difficulty** uses S/M/L, where S is less than one engineer-day, M is approximately one to three days, and L is a multi-day or cross-repository effort. Performance estimates are directional until verified on representative hardware.

### Performance and runtime efficiency

#### PERF-01 — Demo video dominates first-load transfer and double-loads by theme

- **Severity:** High
- **Affected files/components:** `src/components/marketing/Hero.tsx`; `public/darkDemo.mp4`; `public/lightDemo.mp4`
- **Problem:** The 9.84/12.29 MiB videos autoplay without a poster or an explicit conservative preload strategy. Theme initialization selects dark before mount, then reloads for light users. Network inspection observed dark requests before light requests, and Lighthouse downloaded 5.47 MiB of video ranges on the homepage.
- **User impact:** Slow LCP on constrained devices, wasted mobile data, delayed content, heat, and battery drain. Users requesting reduced motion still receive and play the motion.
- **Engineering impact:** Video delivery hides improvements elsewhere and makes theme code brittle. Two encodes multiply release weight.
- **Implementation approach:** Preserve the exact frame and placement. Produce efficient modern encodes with a representative poster; render the poster immediately; choose the correct source before initiating download; use `preload="none"` or `metadata`; begin loading on proximity/idle/user intent; pause when offscreen or hidden; and keep the poster under reduced motion/data. Verify whether the files contain audio; if meaningful audio exists, add captions and controls, otherwise make the decorative video non-announced.
- **Difficulty:** M
- **Expected performance gain:** Largest single network win; plausible first-view reduction of 4–6 MiB and materially earlier LCP.
- **Memory / CPU / bundle effect:** Lower decoder memory, media-thread work, battery use, and network cache pressure; negligible JavaScript change.

#### PERF-02 — Particle sphere performs expensive perpetual canvas work

- **Severity:** High
- **Affected files/components:** `src/components/marketing/InteractiveGlowSphere.tsx`
- **Problem:** A perpetual `requestAnimationFrame` loop updates 280 particles, creates objects, runs trigonometry, sorts by depth, and paints gradients, arcs, and shadows every frame. DPR is not bounded, the loop does not stop offscreen/on hidden tabs/under reduced motion, and pointer-only interaction has no keyboard equivalent. Local idle sampling found the homepage used roughly 22–28% of one CPU core over five seconds.
- **User impact:** Battery drain, fan activity, poorer responsiveness, and an accessibility mismatch for motion-sensitive visitors.
- **Engineering impact:** Per-frame complexity and mutable drawing logic are difficult to profile and regression-test.
- **Implementation approach:** Keep the same visual. Cap effective DPR, precompute invariant values, reuse particle objects/gradients, avoid per-frame sorting where possible, reduce work adaptively, use `IntersectionObserver` and `visibilitychange` to pause, and render a static final frame for `prefers-reduced-motion` or low-data/low-power conditions. Make any actual interaction keyboard-operable or mark the canvas decorative.
- **Difficulty:** M
- **Expected performance gain:** The primary CPU/battery improvement; target less than 2% of one core while the page is idle or hidden.
- **Memory / CPU / bundle effect:** Major continuous CPU reduction and fewer allocations/GC pauses; small memory reduction; bundle roughly neutral.

#### PERF-03 — Global background and no-op scroll transforms hydrate every route

- **Severity:** Medium-High
- **Affected files/components:** `src/components/marketing/SpatialCanvas.tsx`; `src/components/marketing/RefractiveBackground.tsx`; `src/components/marketing/Navbar.tsx`; `src/components/docs/TopBar.tsx`; `src/app/layout.tsx`
- **Problem:** `SpatialCanvas` subscribes to scroll and creates springs/transforms whose scale and opacity output never changes. The global refractive background uses state on every scroll, very large 70vw/70vh blur layers, and overlapping Framer/CSS animation. Navbar and TopBar also duplicate scroll listeners.
- **User impact:** Avoidable main-thread, style, compositing, and paint work on every route, including reading-focused documentation.
- **Engineering impact:** Multiple observers model the same state and make route behavior harder to reason about.
- **Implementation approach:** Remove no-op transforms. Represent shared scroll state with one passive/rAF-throttled observer or CSS where sufficient. Move static decorative layers to CSS, restrict paint bounds, and stop them under reduced motion/hidden state. Load marketing-only effects only on the landing route while preserving the rendered appearance.
- **Difficulty:** M
- **Expected performance gain:** Moderate TBT and continuous paint reduction across all routes.
- **Memory / CPU / bundle effect:** Fewer client subscriptions and state updates; lower compositor memory; modest JavaScript reduction if Framer usage can be isolated.

#### PERF-04 — Changelog serializes, parses, hydrates, and displays every release at once

- **Severity:** High
- **Affected files/components:** `src/app/changelog/page.tsx`; `src/components/changelog/ChangelogClient.tsx`; `src/lib/changelog.ts`
- **Problem:** All release Markdown and metadata are embedded in the response and re-parsed client-side through ReactMarkdown. The audited page produced 206 KiB raw HTML, about 290 KiB gzip initial JS, and 3,463 DOM nodes; release Markdown introduces multiple page-level H1 headings.
- **User impact:** 6.4-second mobile LCP, slow hydration/search, excess memory, and a long unwieldy page.
- **Engineering impact:** Presentation, fetching, Markdown compilation, search, and filtering are coupled in one large client surface.
- **Implementation approach:** Parse and sanitize/compile release Markdown on the server. Render the latest release and concise summaries first; paginate or progressively disclose older releases; keep only search/filter state in a small client island; cache verified GitHub data; normalize embedded heading levels; and link to GitHub for full historical bodies if necessary.
- **Difficulty:** L
- **Expected performance gain:** Substantial HTML, JS, hydration, DOM, and LCP improvement; target Changelog initial transfer below 500 KiB and fewer than 1,500 initial DOM nodes.
- **Memory / CPU / bundle effect:** Removes client Markdown-parser cost and materially reduces DOM memory and hydration CPU.

#### PERF-05 — Automatic link prefetch downloads routes users may never visit

- **Severity:** Medium
- **Affected files/components:** `src/components/docs/Sidebar.tsx`; `src/components/docs/MobileDrawer.tsx`; `src/components/marketing/Navbar.tsx`; Changelog links
- **Problem:** Default Next Link prefetch downloads RSC payloads for many visible sidebar links. The docs trace issued 57 fetch/other requests; the homepage prefetched Changelog content, pulling a large payload into an otherwise unrelated visit.
- **User impact:** Wasted bandwidth and contention with current-page assets, particularly on mobile or metered networks.
- **Engineering impact:** Route growth silently increases the cost of every page containing navigation.
- **Implementation approach:** Disable prefetch for dense/low-probability navigation and large routes, or prefetch on hover/focus/intent. Prioritize only the next likely onboarding page. Add a request-count/transfer assertion to browser tests.
- **Difficulty:** S
- **Expected performance gain:** Roughly 100 KiB or more on docs in the observed run, plus avoidance of Changelog payload on home.
- **Memory / CPU / bundle effect:** Lower router cache memory and parsing work; no material bundle change.

#### PERF-06 — Oversized and unused public assets undermine cache efficiency

- **Severity:** Medium-High
- **Affected files/components:** `public/icon.png`; `public/favicon.ico`; `public/logonobg.png`; `public/sythoria-pfp.png`; `public/vercel.svg`; other unused starter SVGs; deployment headers
- **Problem:** The favicon, icon, and logo are identical 2,000×2,000 PNG payloads (~354 KiB each), and `favicon.ico` is a PNG with the wrong extension. `sythoria-pfp.png` is an unused 4,096×4,096 image; `vercel.svg` contains a large base64 PNG; several starter assets are unused. Static files are served with `max-age=0`.
- **User impact:** A 354 KiB icon is paid on first content-page visits, and repeat visits revalidate immutable media.
- **Engineering impact:** Asset intent is unclear and repository/deploy size grows without benefit.
- **Implementation approach:** Export properly sized favicon/Apple/icon variants, use a small optimized SVG/PNG logo that is visually identical, delete confirmed-unused assets, fingerprint long-lived media, and configure `public, max-age=31536000, immutable` for hashed static artifacts while keeping HTML appropriately revalidated.
- **Difficulty:** S-M
- **Expected performance gain:** About 350 KiB off first content-page transfer plus better repeat-view caching.
- **Memory / CPU / bundle effect:** Lower decode memory and repository/deploy weight; no JS cost.

#### PERF-07 — Pointer glow effects force layout and React renders on every move

- **Severity:** Medium
- **Affected files/components:** `src/components/marketing/BentoCard.tsx`; `src/components/marketing/Comparison.tsx`; `src/components/ui/GlassPanel.tsx`
- **Problem:** Pointer movement calls `getBoundingClientRect`, updates React state, and re-renders the component for cosmetic glow coordinates. Similar implementations are duplicated.
- **User impact:** Jank on low-end devices while hovering/moving and needless work for a purely presentational effect.
- **Engineering impact:** Repeated implementations drift and complicate profiling.
- **Implementation approach:** Keep the effect but write coordinates to CSS custom properties through refs, coalesce updates with one rAF, cache bounds until resize/scroll, and disable the reactive effect on coarse pointers/reduced motion.
- **Difficulty:** S
- **Expected performance gain:** Small overall, noticeable during interaction; eliminates React render churn on pointer move.
- **Memory / CPU / bundle effect:** Lower event CPU and allocations; marginal bundle reduction when the helper is shared.

### Accessibility and interaction quality

#### A11Y-01 — Color tokens fail WCAG contrast in both themes

- **Severity:** High
- **Affected files/components:** `src/app/globals.css`; buttons/badges; docs prose/code; Changelog Markdown; muted metadata throughout
- **Problem:** Automated scans found 25, 47, and 851 issue instances on sampled routes. Representative ratios include 2.99:1 for light muted text, 3.77–4.18:1 for dark muted text, and 2.35:1 for white text on the light-blue accent.
- **User impact:** Low-vision users cannot reliably read metadata, code tokens, buttons, and release content. This fails WCAG 2.2 AA 1.4.3/1.4.11 depending on use.
- **Engineering impact:** A small number of unsafe tokens produce hundreds of downstream failures.
- **Implementation approach:** Adjust semantic foreground/accent tokens—not the visual system—to AA-safe values in both themes. Give syntax tokens explicit tested pairs and avoid white on the pale accent. Add automated contrast tests against every theme token pairing and visually inspect disabled/hover/focus states.
- **Difficulty:** M
- **Expected performance gain:** None; improves legibility and compliance.
- **Memory / CPU / bundle effect:** Neutral.

#### A11Y-02 — Documentation search is visually modal but not an accessible dialog

- **Severity:** High
- **Affected files/components:** `src/components/docs/Search.tsx`
- **Problem:** The overlay has no `role="dialog"`, `aria-modal`, accessible dialog label, focus trap, background inertness, or scroll lock. Tabbing escaped to navigation; Escape left focus on `body`. Search behavior lacks complete combobox/listbox semantics, arrow-key navigation, and an announced result count.
- **User impact:** Keyboard and screen-reader users lose context, can interact with hidden background controls, and cannot navigate results predictably.
- **Engineering impact:** Hand-built modal state is incomplete and likely to regress.
- **Implementation approach:** Use the native `dialog` element or a small tested accessible-dialog primitive. Label it, trap focus, make the rest of the document inert, lock scroll, restore focus to the opener, and implement combobox/listbox semantics with active descendant, arrows, Enter, Escape, and a polite live result count. Keep the current appearance.
- **Difficulty:** M
- **Expected performance gain:** None; may reduce custom event code.
- **Memory / CPU / bundle effect:** Neutral to small bundle increase if a library is added; prefer platform primitives to keep it minimal.

#### A11Y-03 — Mobile menus remain focusable offscreen and lack disclosure/dialog behavior

- **Severity:** High
- **Affected files/components:** `src/components/marketing/Navbar.tsx`; `src/components/docs/MobileDrawer.tsx`; `src/components/docs/Sidebar.tsx`
- **Problem:** Menu buttons do not reliably expose `aria-expanded`/`aria-controls`; drawers have no dialog semantics, Escape handling, focus containment/return, or background inertness. The closed docs drawer is translated offscreen but remains in the focus order, and nested navigation landmarks are created. Sidebar group toggles omit expansion relationships and active links omit `aria-current`.
- **User impact:** Keyboard users tab into invisible controls and cannot discover or dismiss navigation consistently; screen-reader landmarks/states are misleading.
- **Engineering impact:** Marketing and docs implement similar navigation behavior separately.
- **Implementation approach:** Share a tested disclosure/drawer behavior, conditionally hide/unmount closed content or use `inert`, wire button state and controlled IDs, close on Escape/route change, restore focus, label navigation landmarks distinctly, use `aria-current="page"`, and expose group expansion state.
- **Difficulty:** M
- **Expected performance gain:** Minor if closed content is not rendered; primary gain is operability.
- **Memory / CPU / bundle effect:** Slight DOM reduction; bundle neutral when behavior is shared.

#### A11Y-04 — Documentation does not reflow at narrow or moderate widths

- **Severity:** High
- **Affected files/components:** MDX tables; provider guides; `src/components/docs/InstallGuide.tsx`; prose/code styles in `src/app/globals.css`
- **Problem:** At 320/375 CSS pixels, docs measured ~715 pixels wide; one provider table still exceeded its container at 1,024 pixels. Changelog's outer `overflow-x-hidden` masks long inline code rather than making it reachable, so text is clipped. This violates WCAG reflow expectations.
- **User impact:** Mobile and zoomed users must pan in two dimensions or cannot access clipped content.
- **Engineering impact:** New tables/code examples can silently reintroduce overflow.
- **Implementation approach:** Put wide tables/code in labeled, focusable scroll regions with visible affordances; provide stacked definition-card alternatives where row comparison is not essential; allow long tokens/URLs to wrap; avoid page-level overflow masking; and test all docs at 320 CSS pixels and 400% zoom.
- **Difficulty:** M
- **Expected performance gain:** None; smaller initial tables may reduce DOM.
- **Memory / CPU / bundle effect:** Neutral.

#### A11Y-05 — Reduced-motion preference does not stop persistent motion

- **Severity:** High
- **Affected files/components:** `InteractiveGlowSphere.tsx`; `Hero.tsx`; diagram components; Tailwind pulse and data-flow animations; global animation rules
- **Problem:** Reduced-motion emulation left the video playing, canvas rendering, and multiple infinite animations active. The existing CSS rule compresses some animation durations but does not prevent JS/canvas/media work or provide a pause control for motion lasting more than five seconds.
- **User impact:** Motion-sensitive users can experience discomfort; all users on low-power devices pay the work. The behavior risks WCAG 2.2.2 and 2.3.3 failures.
- **Engineering impact:** CSS and JavaScript motion policies disagree.
- **Implementation approach:** Establish one motion hook/token used by CSS, Framer, canvas, and media. Under reduced motion render stable end states, do not start rAF/video, remove auto-moving diagram particles, and provide an obvious pause control if essential motion remains. Pause on document hidden/offscreen regardless of preference.
- **Difficulty:** M
- **Expected performance gain:** Major continuous CPU improvement for reduced-motion/hidden sessions.
- **Memory / CPU / bundle effect:** Lower CPU/GPU and decoder use; bundle neutral.

#### A11Y-06 — Landmarks, headings, controls, and tabs have incomplete semantics

- **Severity:** Medium-High
- **Affected files/components:** `src/app/page.tsx`; docs landing; Changelog release rendering/filter/search; `InstallGuide.tsx`; comparison table; logo links
- **Problem:** The landing page has no `<main>` or skip link. Changelog contains six H1s because release Markdown headings are used verbatim; the docs landing jumps from H1 to H3. OS selectors are styled as tabs but lack tab roles, selection, and controlled panels. Changelog search is placeholder-labeled; filters do not expose pressed/selected state. Comparison lacks a caption/strong row-header semantics. Some logo alt text repeats adjacent text.
- **User impact:** Screen-reader navigation and form understanding are degraded; keyboard focus order lacks a fast path to content.
- **Engineering impact:** Semantic defects repeat because the design system does not encode accessible defaults.
- **Implementation approach:** Add skip link and `<main id="main-content">`; normalize release headings below the page H1; maintain sequential hierarchy; implement actual tabs or ordinary buttons with selected state; add persistent labels and live feedback; use table caption/row headers; and make decorative logo images empty-alt where text already names the link.
- **Difficulty:** S-M
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Neutral.

#### A11Y-07 — Target size, forced colors, focus, and copy feedback need hardening

- **Severity:** Medium
- **Affected files/components:** UI Button; small icon buttons; sidebar toggles; diagram nodes; copy buttons; global focus styles
- **Problem:** Several controls are smaller than the WCAG 2.2 24×24 minimum/44×44 usability target, diagram text reaches 9 px, some content uses `select-none`, forced-colors has no explicit treatment, and clipboard confirmation is visual/title-only rather than a live announcement.
- **User impact:** Users with motor, vision, or high-contrast needs have difficulty targeting, reading, selecting, or confirming actions.
- **Engineering impact:** Ad hoc sizing produces inconsistency across new controls.
- **Implementation approach:** Set minimum interactive target tokens, enlarge invisible hit areas without changing visible dimensions, remove selection blocking from informational text, make focus rings survive both themes/forced colors, test Windows High Contrast, and announce copy success/failure through a polite live region.
- **Difficulty:** S-M
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Neutral.

### Documentation accuracy, safety, and usefulness

#### DOC-01 — Documentation is not governed by a desktop source of truth

- **Severity:** Critical
- **Affected files/components:** All `src/content/docs/**/*.mdx`; `src/lib/docs-nav.ts`; landing metadata and marketing; companion `sythoria-desktop` repository
- **Problem:** The site describes a fast-moving application but copies versioned facts manually. Verified conflicts include Electron guidance for a Tauri app, unsupported CPU architectures, wrong minimum macOS version, wrong shortcuts, wrong provider defaults, nonexistent SQLite storage, incorrect disk logging, unconfigured GPU backends, and wrong model IDs. Pages also hardcode stale `v0.4.1` while the current release is `v0.4.2`.
- **User impact:** Users download incompatible builds, configure invalid models, misunderstand what leaves their device, and rely on security/privacy assurances that the implementation does not support.
- **Engineering impact:** Every desktop release creates invisible website debt and reputational/legal exposure.
- **Implementation approach:** Define an owner and review requirement for every page; add frontmatter fields such as `lastVerifiedVersion`, `lastVerifiedDate`, `sourceFiles`, and `reviewer`; derive release/platform/default-model/shortcut facts from a versioned manifest exported by the desktop build; fail CI when a current page is unverified or source parity changes; and label conceptual/volatile content explicitly.
- **Difficulty:** L, cross-repository
- **Expected performance gain:** Small if generated facts reduce duplicated markup; primary gain is integrity.
- **Memory / CPU / bundle effect:** Neutral.

#### DOC-02 — Installation and operational instructions weaken safety controls

- **Severity:** Critical
- **Affected files/components:** `getting-started.mdx`; `providers/ollama.mdx`; `providers/anthropic.mdx`; `features/agentic.mdx`; `features/logging.mdx`
- **Problem:** Guidance tells users to “Run anyway,” remove macOS quarantine with `xattr -d`, set `OLLAMA_ORIGINS="*"`, use a proxy/VPN in unsupported Anthropic regions, discard a worktree with `git checkout -- .`, and launch background processes with `&`/`nohup`. These actions can bypass platform trust, expose a local model server to hostile origins, violate provider terms, destroy uncommitted work, or leave unmanaged processes.
- **User impact:** Elevated malware, data-loss, network-exposure, account, and compliance risk.
- **Engineering impact:** Support burden and liability increase; safe-platform warnings are normalized instead of addressed through release engineering.
- **Implementation approach:** Code-sign Windows builds and sign/notarize macOS builds; publish checksums and verification steps. Until then, disclose unsigned status and risk without normalizing bypasses. State that native loopback Ollama requires no wildcard CORS; for remote access require a trusted network, firewall, TLS/auth gateway, and exact origins. Remove regional-circumvention advice. Replace destructive Git instructions with targeted `git restore -- path` plus explicit data-loss warnings and prefer app-native apply/discard workflows. Avoid unmanaged daemons in examples.
- **Difficulty:** M-L, partly desktop/release engineering
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Neutral.

#### DOC-03 — Privacy and storage claims are internally contradictory and implementation-inaccurate

- **Severity:** Critical
- **Affected files/components:** `privacy.mdx`; `features/multi-provider.mdx`; landing Features/Comparison; README
- **Problem:** The privacy guide discusses Electron `safeStorage`/context isolation although the app is Tauri; claims local preferences/history are plain JSON in one place and encrypted SQLite elsewhere, while the desktop source uses AES-256-GCM encrypted files/content-addressed snapshots plus OS keychain material and no SQLite; overstates zeroization of API-request strings; and uses “data never leaves your device” despite hosted providers, search/MCP/cloud transcription, update checks, and network artifacts. CSP wording also confuses WebView network policy with Rust-backend networking.
- **User impact:** Users cannot make an informed data-processing decision and may disclose sensitive data under a false local-only assumption.
- **Engineering impact:** Absolute claims are difficult to prove and increase privacy/legal exposure.
- **Implementation approach:** Replace slogans with a data-flow matrix covering trigger, data sent, destination, credential use, local storage, retention owner, and disable control. State that Sythoria has no hosted relay/analytics only if verified; prompts still go directly to the chosen service. Describe Tauri IPC/back-end networking and AES-256-GCM/keychain behavior exactly. Narrow zeroization claims to buffers demonstrably protected in source/tests, and document backups, deletion, logs, crash data, update traffic, MCP, artifacts, and local-only Ollama conditions.
- **Difficulty:** L, requires privacy/security review
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Neutral.

#### DOC-04 — Feature pages mix real capabilities with unsupported implementation and performance claims

- **Severity:** High
- **Affected files/components:** `features/streaming.mdx`; `comparison-grid.mdx`; `artifact-preview.mdx`; `mcp.mdx`; `custom-skills.mdx`; `spotlight.mdx`; `appshots.mdx`; `voice.mdx`; `motion-design.mdx`; `logging.mdx`
- **Problem:** Broad capabilities are often real, but exact claims are not consistently supported. Examples include 50–300 ms/100 token-per-second figures, guaranteed 60/120 FPS, zero latency, hardwareConcurrency/FPS<45 adaptive safe mode, CUDA/CoreML acceleration and CUDA 12.1 status, rotating disk logs, and fixed internal limits. Current desktop logging targets stdout at warning level, no matching adaptive-motion implementation was found, and Whisper GPU features were not configured. Spotlight/Appshots shortcuts also disagree with source.
- **User impact:** Expectations and troubleshooting paths are wrong; users may install unnecessary GPU/system dependencies or assume observability exists when it does not.
- **Engineering impact:** Internal details become accidental public contracts and must be maintained indefinitely.
- **Implementation approach:** Separate “what the user can do” from “how the current version implements it.” Remove unbenchmarked speed/latency guarantees. Publish reproducible benchmark context when numbers matter. Generate shortcuts/defaults/limits from source constants. Mark experimental capabilities. Test every command on clean supported OS images before publication. Add a per-page verification checklist tied to release tags.
- **Difficulty:** M-L
- **Expected performance gain:** Documentation pages may become shorter; otherwise none.
- **Memory / CPU / bundle effect:** Small HTML reduction possible.

#### DOC-05 — Provider pages use volatile catalogs, mismatched defaults, and invalid identifiers

- **Severity:** High
- **Affected files/components:** All `src/content/docs/providers/*.mdx`; desktop `providerPresets.ts`
- **Problem:** Website defaults do not match desktop defaults. The Anthropic page uses `claude-5-sonnet-latest` rather than the verified `claude-sonnet-5`; the NVIDIA guide omits the required suffix in `nvidia/nemotron-3-ultra-550b-a55b`; Ollama examples mix incorrect tag syntax; catalogs, context windows, pricing, free tiers, availability, and “coming soon” labels can age within days. Anthropic Mythos availability/mandatory retention requires a privacy caveat.
- **User impact:** Requests fail, costs or retention surprise users, and provider setup appears broken.
- **Engineering impact:** Six hand-maintained mini-catalogs create continuous correction work.
- **Implementation approach:** Make the desktop preset manifest canonical; keep only the tested default and one fallback per provider; fetch optional catalogs from provider APIs in the desktop UI; add “last verified” dates and primary links; never hardcode volatile price/free-tier data without automated checks. Validate example IDs in a scheduled CI job. Treat third-party routing/privacy and model retention as first-class disclosures.
- **Difficulty:** M
- **Expected performance gain:** Shorter provider pages and less markup; modest only.
- **Memory / CPU / bundle effect:** Small HTML reduction.

Primary references to use in the corrected pages:

- [OpenAI model documentation](https://developers.openai.com/api/docs/models)
- [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Google Gemini model documentation](https://ai.google.dev/gemini-api/docs/models)
- [NVIDIA Nemotron 3 Ultra reference](https://docs.api.nvidia.com/nim/re/reference/nvidia-nemotron-3-ultra-550b-a55b)
- [Current Sythoria Desktop release](https://github.com/sythoria/sythoria-desktop/releases/tag/v0.4.2)

#### DOC-06 — Prose contains AI-style boilerplate, unsupported absolutes, and promotional repetition

- **Severity:** Medium-High
- **Affected files/components:** Marketing components; README; all MDX, especially privacy, streaming, multi-provider, motion, voice, and feature introductions
- **Problem:** The review found 89 matches for recurring generic language such as “powerful,” “seamless,” “robust,” “comprehensive,” “leverage,” “strictly,” and “ensure,” along with absolutes such as “never,” “zero,” and “no lag.” Many introductions restate a claim instead of telling the reader a task, precondition, or limitation. Comparison copy generalizes all “Traditional SaaS clients” as tracking, cloud-database, $20/month products without a defined comparison set.
- **User impact:** Technical readers have to extract operational facts from marketing language; unsupported assurances reduce trust when one is disproved.
- **Engineering impact:** Vague copy cannot be tested and invites future inconsistency.
- **Implementation approach:** Use short task-first sentences, active voice, named subjects, measured qualifiers, and explicit scope/version. Delete adjectives that do not add a testable distinction. Reframe comparisons around Sythoria's verified architecture rather than claims about unnamed competitors. Run prose lint/review for banned absolutes and require an evidence link for quantitative claims.
- **Difficulty:** M
- **Expected performance gain:** Modest HTML/content reduction and faster comprehension.
- **Memory / CPU / bundle effect:** Slight route payload reduction; otherwise neutral.

Representative rewrites that preserve the site's voice without sounding machine-generated:

| Current pattern                                  | Preferred factual wording                                                                                                                                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Your data never leaves your device.”            | “Sythoria has no hosted prompt relay. Prompts sent to a hosted provider leave your device and are handled under that provider's terms; use a local Ollama endpoint for an offline model path.” |
| “Experience seamless, lightning-fast streaming.” | “Sythoria displays chunks as the provider sends them. Time to first token depends on the model, provider load, and network.”                                                                   |
| “Powerful multi-provider flexibility.”           | “Configure multiple providers and choose a model for each message.”                                                                                                                            |
| “Zero-latency local skills.”                     | “Skills are loaded from local files. Model execution and tool calls still have their normal latency.”                                                                                          |
| “GPU-accelerated voice on supported hardware.”   | “Use local Whisper transcription or a configured cloud endpoint. Availability and speed depend on the packaged backend, model file, OS, and hardware.”                                         |
| “Sythoria securely ensures…”                     | Name the mechanism and boundary: “Conversation snapshots are encrypted with AES-256-GCM before they are written to the configured local store.”                                                |

#### DOC-07 — Documentation lacks stable visual guidance, deep links, and validated examples

- **Severity:** Medium
- **Affected files/components:** All MDX; `src/app/docs/[...slug]/page.tsx`; MDX components/styles; Spotlight ASCII mockup
- **Problem:** Pages have no versioned screenshots, heading IDs, anchor links, table of contents, or visible last-verified metadata. The Spotlight page uses an ASCII placeholder instead of an actual UI reference. Code blocks lack copy/wrap controls and one Agentic fence lacks a language. Math packages are installed but MDX does not process math, so dollar-delimited expressions render as ordinary text.
- **User impact:** Users cannot match instructions to the UI, share a section link, or reliably copy commands. Visual learners and screen-reader users receive little structured guidance.
- **Engineering impact:** Screenshots can drift silently; examples and internal links have no build validation.
- **Implementation approach:** Add stable, cropped, version-labeled screenshots only where they reduce ambiguity: OS trust prompt, Settings > Models, keychain permission, MCP executable/PATH, Appshots selection, and tool approval. Include informative alt text/captions and source version. Add deterministic heading slugs, self-links/TOC, copy and wrap controls, syntax languages, and compile-time link/code-fence/frontmatter validation. Remove unused math dependencies or deliberately enable and test math rendering.
- **Difficulty:** M
- **Expected performance gain:** Screenshots add transfer unless lazy-loaded and optimized; keep each small, dimensioned, and below the fold.
- **Memory / CPU / bundle effect:** Small JS increase only if controls are client-side; prefer server-rendered markup and tiny progressive enhancement.

### Page-by-page documentation correction matrix

This matrix is the minimum editorial backlog. It should be completed against a tagged desktop release and reviewed again whenever the manifest/source files named by the page change.

| Page              | Verified issue(s)                                                                                                                                                                                                                 | Required correction and useful addition                                                                                                                                                                           | Priority                                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Getting Started   | Claims Windows ARM64, Linux ARM64, and Intel macOS assets that `v0.4.2` does not ship; says macOS 11 although Tauri configuration requires 12; shortcuts differ; normalizes security-warning bypasses; “under a minute” guarantee | Generate the platform matrix from release assets; state minimum OS/architecture per artifact; publish signing/checksum status; correct shortcuts; add first-run/keychain/provider verification and rollback steps | P0                                                                                                                                                          |
| Configuration     | Largely useful but copies internal defaults/limits; little authoritative linking; no source version                                                                                                                               | Generate default provider/model, shortcuts, and limits from a manifest; explain precedence, backup/reset, and safe secret handling; link each provider page                                                       | P1                                                                                                                                                          |
| Privacy           | Electron architecture, SQLite/plain-JSON contradictions, broad zeroization/CSP claims, and “never leaves device” absolutes conflict with source                                                                                   | Rewrite around Tauri/Rust data flows, AES-256-GCM files, OS keychain, hosted-provider traffic, MCP/search/transcription/update paths, retention owners, deletion, logs, and threat boundaries                     | P0                                                                                                                                                          |
| Streaming         | Exact latency/throughput/FPS claims lack benchmark evidence; prose confuses provider latency with renderer behavior                                                                                                               | Explain chunk flow and cancellation/error behavior; publish methodology if benchmarks are retained; add troubleshooting for buffering proxies/provider non-streaming                                              | P1                                                                                                                                                          |
| Multi-provider    | Says encrypted SQLite; defaults/context/pricing drift; 90% cost claim unsupported                                                                                                                                                 | Describe actual encrypted store and current preset manifest; remove savings guarantee; show how selection changes request destination and billing                                                                 | P0                                                                                                                                                          |
| Comparison grid   | Four-pane capability is broadly present; some synchronized/copy behaviors need source tests; copy is adjective-heavy                                                                                                              | Document exact maximum/current controls and limitations with a real screenshot; link to model-specific context/cost caveats                                                                                       | P2                                                                                                                                                          |
| Agentic workflows | Internal concepts broadly present; unsafe `git checkout -- .` and unmanaged daemon examples; typo “Retreived”; one untyped fence                                                                                                  | Use targeted recoverable Git workflows, explicit approval/data-loss notes, foreground process examples, typed fences, and an end-to-end safe example in a disposable repo                                         | P0                                                                                                                                                          |
| Artifact preview  | Security model broadly matches desktop, but “React component” support and exact network behavior need tagged-source verification                                                                                                  | State the exact supported artifact types; explain sandbox/network opt-in and trust prompts; include malicious-artifact limitations and a versioned screenshot                                                     | P1                                                                                                                                                          |
| MCP               | stdio, SSE, and Streamable HTTP are supported; setup assumes PATH/executable knowledge and omits trust boundaries                                                                                                                 | Add per-OS executable/PATH examples, transport-specific TLS/auth, tool approval, secret scope, logs, timeout/retry, and untrusted-server warnings                                                                 | P1                                                                                                                                                          |
| Custom skills     | Hardcodes `v0.4.1`; “zero latency” false; internal store/path details treated as public contract                                                                                                                                  | Remove version coupling and latency claim; define supported file schema, validation errors, reload behavior, precedence, portability, and backup                                                                  | P1                                                                                                                                                          |
| Spotlight         | Documents Option/Alt+Space while source registers Control+Space; ASCII placeholder                                                                                                                                                | Correct/generated shortcut; use an actual versioned visual; document conflict recovery, enable/disable, and keyboard-only flow                                                                                    | P0                                                                                                                                                          |
| Appshots          | Shortcut/platform modifier conflicts; paths/limits may be stale                                                                                                                                                                   | Generate shortcut; verify storage path and limits per OS; document permission denial, multi-monitor/scaling behavior, cleanup, and privacy implications                                                           | P1                                                                                                                                                          |
| Voice             | Claims CUDA/CoreML/CUDA 12.1 status not configured in audited source; “real-time” and provider specifics overstate capability                                                                                                     | Remove unsupported GPU claims; distinguish local Whisper from cloud endpoint; document model download, permissions, storage, language/accuracy, deletion, and verified hardware behavior                          | P0                                                                                                                                                          |
| Motion design     | Describes hardwareConcurrency/FPS adaptive safe mode not found; implementation detail overwhelms user task                                                                                                                        | Keep user controls and accessibility contract; remove absent mechanisms; document what reduced motion actually disables after implementation                                                                      | P1                                                                                                                                                          |
| Logging           | Says errors/fatal go to rotating disk logs; audited setup targets stdout at Warn and UI buffer is bounded                                                                                                                         | Describe actual destinations, levels, retention, export/redaction, and support-safe collection; never ask users to publish secrets                                                                                | P0                                                                                                                                                          |
| OpenAI            | Website default differs from desktop; catalog/context/pricing volatile                                                                                                                                                            | Source default from manifest; link official model endpoint/docs; date-stamp verified examples; explain organization/project key scope and retention controls                                                      | P1                                                                                                                                                          |
| Anthropic         | Default differs; invalid Sonnet alias; VPN/proxy advice; Mythos limited access/retention omitted                                                                                                                                  | Use valid tested ID; remove circumvention advice; disclose eligibility and retention; link supported regions and official support                                                                                 | P0                                                                                                                                                          |
| Gemini            | Default differs; catalog/status/free-tier claims are volatile; “all models” language too broad                                                                                                                                    | Keep tested default plus API discovery instructions; link official models/pricing; qualify modality/region/free tier per model and date                                                                           | P1                                                                                                                                                          |
| Ollama            | Default differs; tag examples are inconsistent; wildcard origin is unsafe; `curl                                                                                                                                                  | sh` has supply-chain risk                                                                                                                                                                                         | Use exact tested tag; state no wildcard CORS is needed for native loopback; show a review/download install path; add remote-host firewall/TLS/auth guidance | P0  |
| OpenRouter        | Default differs; model catalog/routes/price claims change; third-party data path underexplained                                                                                                                                   | Source preset; link live catalog; explain provider routing, logging/retention policy differences, privacy filters, and billing ownership                                                                          | P1                                                                                                                                                          |
| NVIDIA NIM        | Default differs; Nemotron identifier omits `-a55b`; context/availability volatile; self-hosting advice lacks perimeter controls                                                                                                   | Correct and test ID; distinguish hosted API from self-hosted NIM; add TLS/auth/private-network/rate-limit guidance and official current references                                                                | P0                                                                                                                                                          |

### Recommended documentation information architecture

Keep the current visual shell, but organize content around tasks and trust decisions:

1. **Start:** Download, verify, install, first launch, connect one model, send a test message.
2. **Configure models:** One stable page per provider, generated defaults, discovery, billing/retention links, troubleshooting.
3. **Workflows:** Comparison, artifacts, agentic worktrees, Appshots, Spotlight, voice, and skills—each with prerequisites and failure recovery.
4. **Tools and integrations:** MCP transports, approval, executable paths, network and secret boundaries.
5. **Data and security:** A single data-flow/privacy page, storage/deletion/backups, network destinations, logging/support collection, update/signing verification.
6. **Reference:** Shortcuts, configuration schema, supported platforms, release notes, known limitations.

Each page should begin with: purpose, prerequisites, supported version, expected result, and time/risk caveat. Each procedure should end with: how to verify success, common failure, and how to undo the change.

### Data integrity, security, and legal readiness

#### DATA-01 — Changelog failure mode fabricates product history

- **Severity:** Critical
- **Affected files/components:** `src/lib/changelog.ts`; `src/app/changelog/page.tsx`; Changelog/latest-version CTAs
- **Problem:** GitHub fetch failure returns hardcoded `v1.2`/`v1.1` beta releases with invented dates, bodies, assets, download counts, and product claims. The actual verified release is `v0.4.2`. The first fallback entry can be presented as “latest,” while the site's download URL points to GitHub's latest stable release. A provider outage or rate limit therefore changes product truth.
- **User impact:** Visitors can be told to expect nonexistent releases/features or make trust decisions from false download/social-proof data.
- **Engineering impact:** Silent corruption hides operations failures and makes support/debugging much harder.
- **Implementation approach:** Delete invented releases. At build/revalidation time fetch and schema-validate GitHub data, then store a generated, reviewed, last-known-good JSON snapshot containing only real releases. If neither live nor verified cached data exists, render a version-neutral download CTA and an honest unavailable state. Include source URL and `fetchedAt`; alert on stale data. Make stable/pre-release selection explicit and consistent with `/releases/latest`.
- **Difficulty:** M
- **Expected performance gain:** Cached/generated data improves build/runtime latency and avoids repeated failed calls.
- **Memory / CPU / bundle effect:** Smaller fallback bundle and fewer server fetch/error paths.

#### SEC-01 — Production and development dependencies contain high-severity advisories

- **Severity:** Critical
- **Affected files/components:** `package.json`; `package-lock.json`; Next.js runtime; transitive `postcss`, `sharp`, `js-yaml`, `brace-expansion`
- **Problem:** `npm audit` reports five high-severity issues. The pinned Next.js 16.2.6 is affected by published middleware-bypass, Server Actions DoS/SSRF/unbounded-payload, cache-confusion/rewrite SSRF, SVG optimizer DoS, and server-function disclosure advisories addressed by the available 16.2.12 line. Transitive PostCSS and Sharp versions are affected; unused `gray-matter` retains vulnerable `js-yaml`; ESLint tooling retains vulnerable `brace-expansion`. Package overrides explicitly pin vulnerable PostCSS/JS-YAML ranges.
- **User impact:** Depending on deployment configuration, crafted requests may cause data exposure, SSRF, security-control bypass, or denial of service.
- **Engineering impact:** Known-vulnerable production software creates emergency-patch and compliance burden.
- **Implementation approach:** In a dedicated branch update `next` and `eslint-config-next` to at least the audited fixed compatible version, refresh the lockfile, remove `gray-matter` and other unused dependencies, remove/raise unsafe overrides, and update the lint dependency chain. Re-run the full suite plus Server Actions/rewrites/image route smoke tests. Enforce `npm audit --omit=dev` and a separately triaged development audit in CI; use Dependabot/Renovate with controlled batches.
- **Difficulty:** M
- **Expected performance gain:** New framework/image versions may improve runtime; do not assume—benchmark.
- **Memory / CPU / bundle effect:** Removing unused packages shrinks install/CI footprint; client bundle should be neutral.

#### SEC-02 — HTTP responses lack a defense-in-depth header policy

- **Severity:** High
- **Affected files/components:** Missing `next.config.*`; deployment/platform configuration; inline theme bootstrap in `src/app/layout.tsx`
- **Problem:** Production responses expose `X-Powered-By` and do not set CSP, frame-ancestor/X-Frame-Options, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, or an HTTPS HSTS policy. The inline theme script and extensive inline styles complicate a strict CSP.
- **User impact:** Browser defenses against framing, content-type confusion, excessive referrer data, unexpected capabilities, and injection are weaker than necessary.
- **Engineering impact:** Retrofitting CSP later becomes harder as inline style/script usage grows.
- **Implementation approach:** Disable `poweredByHeader`; inventory all external connections and inline sources; deploy CSP in report-only mode first, using a hash/nonce or an externalized deterministic theme bootstrap; then enforce `default-src 'self'`, restrictive script/object/base/frame/connect/media policies appropriate to GitHub/video/fonts. Add `frame-ancestors 'none'`, nosniff, strict referrer and permissions policies, and HSTS only at an HTTPS deployment layer where all subdomains are ready. Add response-header integration tests.
- **Difficulty:** M-L
- **Expected performance gain:** None directly; a smaller external/inline surface can improve cacheability.
- **Memory / CPU / bundle effect:** Neutral.

#### SEC-03 — External release input and docs paths need explicit validation boundaries

- **Severity:** Medium
- **Affected files/components:** `src/lib/changelog.ts`; `src/lib/docs.ts`; dynamic docs route
- **Problem:** GitHub JSON is trusted structurally without schema/URL validation. Documentation slugs are joined to filesystem paths without an explicit resolved-path containment check. Tested encoded traversal requests returned 404 through Next routing, so no active exploit was demonstrated, but the library boundary is still incomplete.
- **User impact:** A malformed/upstream-compromised payload can break rendering or link users unexpectedly; future route changes could expose path traversal.
- **Engineering impact:** Assumptions live in framework behavior instead of local contracts.
- **Implementation approach:** Validate GitHub payloads with a small explicit schema and allow only expected HTTPS GitHub asset URLs; bound body/list sizes. Resolve docs paths, verify they remain inside the content root, allow only normalized slug segments, and reject dot/encoded separators. Add negative tests for malformed JSON, oversized bodies, traversal, encoded traversal, and symlink escape.
- **Difficulty:** S-M
- **Expected performance gain:** Negligible; early rejection can avoid expensive Markdown/DOM work.
- **Memory / CPU / bundle effect:** Tiny server-only validation cost.

#### LEGAL-01 — Licensing and release provenance are not substantiated

- **Severity:** Critical
- **Affected files/components:** Footer; Features; README; repository root; desktop repository/release process
- **Problem:** The site repeatedly says Sythoria is MIT/open source, but this repository has no `LICENSE` file and the audited desktop GitHub metadata exposes no detected license. Users are also directed to unsigned/unrecognized binaries without prominent provenance/checksum/signature verification.
- **User impact:** Users and downstream contributors cannot reliably determine rights or verify binaries.
- **Engineering impact:** Distribution may violate contributor/dependency expectations and is difficult for organizations to approve.
- **Implementation approach:** Have the project owner confirm intended licensing, add the exact license and copyright holder/year to both repositories, create third-party notices/SBOM as appropriate, and link the actual license from the footer. Establish signed release provenance, checksums, code signing/notarization, and documented verification. Do not retain the MIT claim until the license is present and authoritative.
- **Difficulty:** M, requires owner/legal decision
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Neutral.

### SEO, metadata, and discovery

#### SEO-01 — Metadata is minimal, outdated, and not route-complete

- **Severity:** Medium-High
- **Affected files/components:** `src/app/layout.tsx`; docs layout; Changelog and dynamic docs metadata
- **Problem:** Root copy still describes a generic “Modern AI chat interface,” docs metadata is similarly vague, and the site has no `metadataBase`, canonical policy, Open Graph/Twitter images and fields, or consistently verified per-page descriptions. Lighthouse's 100 SEO score checks a basic subset, not discovery quality or claim accuracy.
- **User impact:** Search/social previews fail to explain that this is the official desktop download/documentation site, and duplicate/generated URLs may compete.
- **Engineering impact:** Page additions depend on authors remembering many metadata fields manually.
- **Implementation approach:** Define a central metadata helper with absolute canonical URLs and route-specific title/description based on frontmatter. Suggested root description: “Download Sythoria, a Tauri desktop client for local and hosted language models, and learn how to configure providers, tools, voice, and project workspaces.” Suggested docs description: “Set up Sythoria Desktop, connect model providers, configure local tools, and understand how data is stored and transmitted.” Add tested social cards and publish only verified platform/privacy claims.
- **Difficulty:** S-M
- **Expected performance gain:** None; social image size should be optimized.
- **Memory / CPU / bundle effect:** Server metadata only; neutral.

#### SEO-02 — No sitemap, robots policy, manifest, or structured discovery data

- **Severity:** Medium
- **Affected files/components:** Missing `src/app/sitemap.ts`, `robots.ts`, manifest, structured data
- **Problem:** Static docs routes are discoverable through links but there is no explicit sitemap/robots policy or application manifest. No SoftwareApplication/Organization/Breadcrumb structured data is present, and docs headings have no IDs for section-level indexing/sharing.
- **User impact:** Slower/less precise discovery, weak section deep linking, and incomplete install/app context in search surfaces.
- **Engineering impact:** Route additions can be omitted from discovery without detection.
- **Implementation approach:** Generate sitemap entries from the same validated docs manifest plus home/changelog, including trustworthy modification dates. Add robots rules and sitemap URL. Add a minimal manifest if installability/browser identity is intended. Add JSON-LD only for verified fields—never invent price, ratings, operating-system support, or release data. Generate heading slugs and breadcrumb metadata; test that all canonical/sitemap URLs return 200.
- **Difficulty:** S-M
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Small static metadata output.

#### SEO-03 — Heading and content structure dilute page topic signals

- **Severity:** Medium
- **Affected files/components:** Changelog Markdown renderer; docs landing; MDX headings; pages without section anchors
- **Problem:** Changelog emits multiple H1s from GitHub bodies, docs landing skips levels, and several pages front-load broad promotional text before the task. There is no per-page TOC or last-updated/version context.
- **User impact:** Search engines and assistive tools receive a weaker hierarchy; readers cannot scan or link directly to answers.
- **Engineering impact:** External Markdown controls the host page's document outline.
- **Implementation approach:** Keep one H1 per page, demote embedded release headings relative to their release article, enforce heading order at compile time, generate TOCs/anchors, and put a concise factual answer/prerequisite near the top. Include verified version/update metadata in visible text and structured metadata.
- **Difficulty:** S-M
- **Expected performance gain:** Shorter introductions can improve HTML and comprehension only marginally.
- **Memory / CPU / bundle effect:** Neutral.

### Architecture and client/server boundaries

#### ARCH-01 — Documentation filesystem, navigation, metadata, and search are duplicated manually

- **Severity:** High
- **Affected files/components:** `src/lib/docs.ts`; `src/lib/docs-nav.ts`; `src/components/docs/Search.tsx`; all MDX frontmatter
- **Problem:** A lightweight regex parser extracts only simple `title`/`description`, while navigation and search suggestions are maintained separately. There is no schema, duplicate-slug detection, nav-to-file completeness check, last-verified data, or content link validation. `getAllDocs` is unused.
- **User impact:** Pages can be missing from navigation/search, have stale labels, or fail unclearly on malformed frontmatter.
- **Engineering impact:** Every content update touches multiple sources and errors appear late.
- **Implementation approach:** Keep the lightweight parser if desired, but build one validated content manifest at build time from all MDX. Define permitted frontmatter fields/types, produce actionable filename/line diagnostics, derive nav/search/sitemap/metadata from it, and fail for orphans, duplicates, missing source/version, invalid links, or unknown groups. Add parser fixture tests including CRLF, colons, quotes, and malformed blocks.
- **Difficulty:** M
- **Expected performance gain:** Precomputed search/nav data can reduce client code and repeated filesystem work.
- **Memory / CPU / bundle effect:** Smaller duplicated data; build work increases slightly, runtime decreases.

#### ARCH-02 — Static documentation diagrams force a broad client boundary

- **Severity:** Medium-High
- **Affected files/components:** docs dynamic route and seven diagram components under `src/components/docs/diagrams`
- **Problem:** All diagram modules are eagerly imported and registered as client components even though most are static presentation and each page uses only a subset. Similar flow markup/styles are duplicated; analysis found about 5% duplication in TSX and several repeated diagram clones.
- **User impact:** Additional JavaScript/hydration for reading-only pages and weaker low-end performance.
- **Engineering impact:** Seven bespoke implementations make accessibility/motion fixes repetitive.
- **Implementation approach:** Render static diagrams as server components or semantic SVG/HTML; isolate only interactive controls as islands; dynamically resolve rare diagrams or precompile MDX with per-page imports. Create a small data-driven flow/timeline primitive with semantic text order and reduced-motion behavior while preserving exact styling.
- **Difficulty:** M-L
- **Expected performance gain:** Meaningful docs JS/hydration reduction; target largely server-rendered content routes.
- **Memory / CPU / bundle effect:** Lower client bundle, hydration CPU, and retained React state.

#### ARCH-03 — Changelog concerns and release configuration cross server/client boundaries

- **Severity:** Medium-High
- **Affected files/components:** `src/lib/changelog.ts`; Changelog page/client; `InstallGuide.tsx`; environment configuration
- **Problem:** Fetching, fallback policy, GitHub shape, version selection, Markdown rendering, and UI filtering are interwoven. Owner/repository constants from a server-oriented module leak into client usage, while some download URLs remain hardcoded elsewhere. `getLatestVersion` selects the first release, including prereleases, unlike GitHub `/releases/latest`.
- **User impact:** Download labels and destinations can disagree; prerelease users may be directed unintentionally.
- **Engineering impact:** Changing owner/repo/release policy requires scattered edits and can expose server configuration in client bundles.
- **Implementation approach:** Create a server-only release gateway returning a validated domain type, a separate public static download configuration, and a small client view model. Define stable/prerelease policy explicitly, centralize URLs, cache/revalidate predictably, and unit-test selection/failure/staleness.
- **Difficulty:** M
- **Expected performance gain:** Enables server Markdown and smaller client payload described in PERF-04.
- **Memory / CPU / bundle effect:** Material Changelog client reduction.

#### ARCH-04 — Global CSS and decoration primitives are oversized and duplicated

- **Severity:** Medium
- **Affected files/components:** `src/app/globals.css` (1,954 lines); embedded noise SVG/filter styles; marketing glass/glow components
- **Problem:** Marketing, docs, Changelog, animations, tokens, and component-specific styles live in one global stylesheet. Noise/filter definitions and glow logic are repeated. Link tooling falsely interpreted repeated data-URI fragment IDs as broken URLs, illustrating how opaque these embedded definitions are.
- **User impact:** All routes pay roughly 19 KiB gzip CSS and may evaluate irrelevant selectors/animations; global changes risk regressions.
- **Engineering impact:** Ownership and dead-style detection are difficult; component rules can collide.
- **Implementation approach:** Retain one small token/reset layer, then colocate or route-split marketing/docs/changelog styles. Centralize the noise texture and glow variables once, remove dead selectors/keyframes after coverage testing, and document the intentional visual primitives. Avoid changing computed visual output during the split.
- **Difficulty:** M-L
- **Expected performance gain:** Moderate CSS reduction and less style matching; validate route-by-route screenshots.
- **Memory / CPU / bundle effect:** Lower CSSOM and potential paint work; no JS increase.

### Code quality and maintainability

#### CODE-01 — Theme lifecycle has stale state, unhandled storage, and mass-transition work

- **Severity:** Medium
- **Affected files/components:** theme hook/provider; inline layout bootstrap; `.theme-transition *` in `globals.css`; `Hero.tsx`
- **Problem:** Theme initialization is duplicated between inline script and client hook; localStorage access is not guarded; the OS preference is not observed after load; cross-tab storage changes are ignored; transition timeouts are not cleared; and `.theme-transition *` applies `!important` transitions to every descendant for 500 ms. Hero's media source compounds the initial-theme mismatch.
- **User impact:** Flash/wrong media, sluggish theme changes, unexpected failures in restricted storage contexts, and failure to follow live OS preference.
- **Engineering impact:** Two sources of theme truth and blanket CSS make changes risky.
- **Implementation approach:** Define one tiny deterministic bootstrap and one client state machine. Guard storage, listen to `matchMedia` only when mode is system, listen to `storage`, clear timers on unmount/re-entry, set `color-scheme`, and transition only the handful of visual properties/elements that require it. Resolve the initial media source without loading the wrong variant.
- **Difficulty:** M
- **Expected performance gain:** Reduced style recalculation/paint during theme changes and no theme-related video double request.
- **Memory / CPU / bundle effect:** Fewer listeners/timers and mass transitions; bundle neutral.

#### CODE-02 — Render-time and event-time state patterns cause avoidable work

- **Severity:** Medium
- **Affected files/components:** `MobileDrawer.tsx`; pointer-glow components; Navbar/TopBar scroll handlers; animation components
- **Problem:** MobileDrawer updates state during render when pathname changes, cosmetic events update React at pointer frequency, and multiple scroll listeners set component state independently. These patterns are difficult under concurrent rendering and create unnecessary commits.
- **User impact:** Intermittent navigation/animation jank and possible state warnings in future React versions.
- **Engineering impact:** Timing behavior is implicit, hard to test, and repeated.
- **Implementation approach:** Move route-change closure to an effect or derive visibility from route state; use CSS vars/refs for cosmetic coordinates; consolidate passive/rAF-throttled observers; and measure before/after with React Profiler and Performance traces.
- **Difficulty:** S-M
- **Expected performance gain:** Lower commit/event overhead, especially during scroll and pointer movement.
- **Memory / CPU / bundle effect:** Lower CPU/allocations; neutral bundle.

#### CODE-03 — UI primitives and utilities have correctness edge cases

- **Severity:** Medium
- **Affected files/components:** Button primitive; changelog `formatDate`/`formatBytes`; generated IDs and related utilities
- **Problem:** A disabled Button rendered as a link can still navigate; button elements do not default to `type="button"`; `children &&` can drop valid `0`; date try/catch does not detect `Invalid Date`; byte formatting is not robust for negative/nonfinite/very large input. Some external new-tab links omit an explicit `rel` policy.
- **User impact:** Accidental form submission/navigation, misleading values, or blank UI at edge cases.
- **Engineering impact:** Every consumer must remember behavior that should be guaranteed centrally.
- **Implementation approach:** Split semantic Button and LinkButton or make behavior type-safe; prevent interaction and remove focus appropriately when link-disabled; default native buttons to `type="button"`; render `children != null`; validate dates with `Number.isNaN(date.getTime())`; bound/validate numeric formatting; and centralize safe external-link props. Add focused unit tests.
- **Difficulty:** S
- **Expected performance gain:** None.
- **Memory / CPU / bundle effect:** Neutral.

#### CODE-04 — Async effects and errors are not consistently cleaned up or observable

- **Severity:** Medium
- **Affected files/components:** theme timers; InstallGuide clipboard feedback; Changelog timers/fetch path; media play promises; docs parser
- **Problem:** Multiple timeouts are not cleared; media `play()` failures are mostly ignored; GitHub errors collapse into fabricated data; parser errors lack precise diagnostics; clipboard failure feedback is incomplete.
- **User impact:** Stale state after navigation, confusing unavailable behavior, and hidden failures.
- **Engineering impact:** Production incidents become content corruption rather than actionable telemetry.
- **Implementation approach:** Use abort signals and cleanup for fetch/media/timers, model loading/error/stale states explicitly, log server fetch failures without secrets, expose a user-safe retry/source link, and include filename/field diagnostics for content failures. Test unmount and rejection paths with fake timers.
- **Difficulty:** S-M
- **Expected performance gain:** Avoids orphaned work and repeated retries; small.
- **Memory / CPU / bundle effect:** Reduces retained timers/listeners; neutral bundle.

#### CODE-05 — Dead code and repeated implementations obscure the real product surface

- **Severity:** Low-Medium
- **Affected files/components:** unused `GlassPanel.tsx`; unused `ProviderOrbit.tsx`; unused exports `FALLBACK_RELEASES`, `getAllDocs`, `ReleaseAsset`; repeated diagram/glow/nav logic
- **Problem:** Static analysis found two unused components, three unused exports, 14 duplicated blocks/249 duplicated lines (3.38% overall; 4.83% TSX), with concentrated repetition in diagrams, nav scroll behavior, and glow cards.
- **User impact:** Little direct impact, but stale components can be mistaken for shipped capabilities.
- **Engineering impact:** Larger review surface, repeated bug fixes, and slower refactoring.
- **Implementation approach:** Confirm nothing is imported dynamically, delete dead files/exports, and factor only behavior with a shared contract: scroll state, pointer glow, diagram flow primitives. Avoid a universal abstraction that obscures individual content. Keep visual regression snapshots during consolidation.
- **Difficulty:** S-M
- **Expected performance gain:** Small build/repository win; client gain only if a dead export currently prevents tree-shaking.
- **Memory / CPU / bundle effect:** Small install/build/bundle reduction.

### Dependency hygiene

#### DEP-01 — Eleven runtime/development packages appear unused

- **Severity:** Medium
- **Affected files/components:** `package.json`; lockfile
- **Problem:** Static analysis reports unused runtime dependencies `canvas-confetti`, `gray-matter`, `katex`, `react-virtuoso`, `rehype-katex`, `remark-math`, `zod`, and `zustand`; unused development dependencies `@types/canvas-confetti`, `eslint-plugin-prettier`, and `vite-tsconfig-paths`. `gray-matter` is also the source of the vulnerable JS-YAML chain. README incorrectly says Zustand is used.
- **User impact:** Larger supply-chain/installation surface and more advisories, though most are not shipped to browsers.
- **Engineering impact:** Slower installs, confusing architecture claims, and unnecessary upgrade work.
- **Implementation approach:** Verify dynamic/config usage, remove confirmed-unused packages and related overrides/config, regenerate the lockfile, run `npm run check`, and correct README. If math or virtualization is an intended near-term feature, add it only in the change that actually uses and tests it.
- **Difficulty:** S
- **Expected performance gain:** Faster clean install/CI and smaller dependency cache; browser bundle likely unchanged because imports are absent.
- **Memory / CPU / bundle effect:** Lower disk/install memory and audit surface.

#### DEP-02 — Runtime/version documentation and update policy are inconsistent

- **Severity:** Medium-High
- **Affected files/components:** README; `package.json`; lockfile; missing automation
- **Problem:** README says Node 18+, while local Next 16.2.6 declares Node >=20.9.0. There is no explicit `engines` field, version file, lockfile policy, or automated dependency update process. Direct overrides pin security-sensitive transitive packages without rationale/expiry.
- **User impact:** Contributors can encounter unexplained install/build failures; security fixes arrive late.
- **Engineering impact:** Environment drift and ad hoc overrides make releases non-reproducible.
- **Implementation approach:** Set and document one Node version (for example via `engines` plus `.nvmrc`/Volta), use `npm ci` in CI, document why/when every override exists, remove overrides as upstream fixes land, and configure controlled dependency/security PRs with full checks and bundle/Lighthouse comparison.
- **Difficulty:** S-M
- **Expected performance gain:** Faster, more reproducible CI; no direct runtime guarantee.
- **Memory / CPU / bundle effect:** Neutral runtime.

### Testing and quality gates

#### OPS-01 — The documented release gate is red and no CI enforces it

- **Severity:** Critical
- **Affected files/components:** package scripts; 13 files reported by Prettier; missing `.github/workflows/*`
- **Problem:** `npm run check` stops at `format:check` after lint; it never reaches tests/build. The failures include the landing page, docs-nav/changelog code, and ten MDX pages. No CI workflow runs the command on pushes/PRs.
- **User impact:** Formatting itself is not a user defect, but a permanently failing gate teaches maintainers to ignore release checks and allows real defects to bypass review.
- **Engineering impact:** No protected, reproducible definition of “ready.”
- **Implementation approach:** Review—not blindly overwrite—the dirty files, format intended changes, then add CI on the supported Node version with `npm ci`, format, lint, typecheck, unit tests, production build, security audit, content validation, and browser smoke checks. Require the workflow on protected branches. Keep generated audit artifacts out of the application build.
- **Difficulty:** M
- **Expected performance gain:** Indirect through regression prevention.
- **Memory / CPU / bundle effect:** CI cost increases; runtime neutral.

#### TEST-01 — Coverage tooling is documented but cannot run

- **Severity:** High
- **Affected files/components:** test scripts/config; README; dev dependencies
- **Problem:** `npm run test:coverage` fails because `@vitest/coverage-v8` is not installed. There is no reliable coverage baseline or threshold.
- **User impact:** Critical failure modes—release fallback, security copy, navigation focus—can regress unnoticed.
- **Engineering impact:** Documentation overstates test capability and maintainers lack change-risk feedback.
- **Implementation approach:** Install/configure the compatible coverage provider or remove the false command until ready. Set sensible staged thresholds focused first on domain logic (docs parser/manifest, release gateway, utilities, theme state) rather than chasing line percentage in decorative components. Publish the report artifact in CI.
- **Difficulty:** S
- **Expected performance gain:** None; supports safe optimization.
- **Memory / CPU / bundle effect:** Development/CI only.

#### TEST-02 — Existing tests omit the highest-risk production behaviors

- **Severity:** High
- **Affected files/components:** current 10 test files; Changelog; docs engine; menus/search; media/theme; headers/metadata
- **Problem:** The 74 passing tests do not cover release fetch validation/stale/unavailable behavior, desktop-content parity, route discovery, production headers, real keyboard focus, mobile reflow, reduced motion, autoplay policy, prefetch/network budgets, or supported release assets. Component mocks cannot expose many of the failures found in a real browser.
- **User impact:** Trust, accessibility, and performance regressions reach production despite a green unit suite.
- **Engineering impact:** Developers receive false confidence and must rediscover integration failures manually.
- **Implementation approach:** Add Playwright (or equivalent) production-build tests for: keyboard-only home/docs/changelog; focus trap/return and Escape; mobile drawer invisibility/focus; 320px/400% reflow; reduced motion; theme persistence/OS switching; no wrong-theme video request; download links; one H1; response headers; and error/offline Changelog. Keep unit tests for data/domain branches.
- **Difficulty:** L
- **Expected performance gain:** Enables enforceable budgets; tests themselves do not change runtime.
- **Memory / CPU / bundle effect:** CI-only browser cost.

#### TEST-03 — No automated accessibility, link, content-parity, or performance budgets

- **Severity:** High
- **Affected files/components:** CI; docs manifest; deployment preview checks
- **Problem:** Nothing fails a change for contrast/focus violations, broken links, missing pages/metadata, stale desktop facts, high-severity audit results, excessive transfer, long LCP/TBT, or growing JS/DOM. The crawl passed genuine links in this audit, but CSS data-URI fragments produced false positives that need checker configuration.
- **User impact:** Site quality deteriorates gradually, particularly as docs and releases grow.
- **Engineering impact:** Performance and content integrity depend on memory and manual review.
- **Implementation approach:** Add axe checks plus manual keyboard assertions, an internal/external link checker configured to ignore embedded data-URI fragments, manifest/source-parity validation, `npm audit`, bundle-size tracking, and Lighthouse CI using three production-mode runs/median. Warn on small changes; block on release-budget/security/accessibility breaches. Schedule provider-ID/release-asset validation because those sources are volatile.
- **Difficulty:** L
- **Expected performance gain:** Prevents regressions; creates a feedback loop for the targets below.
- **Memory / CPU / bundle effect:** CI only.

#### TEST-04 — No cross-browser/device or production deployment validation is defined

- **Severity:** Medium
- **Affected files/components:** release checklist; video/canvas/glass effects; docs tables; deploy headers/cache
- **Problem:** Complex blur/filter/canvas/video behavior is sensitive to Safari/WebKit, Firefox, Windows forced colors, DPR, and mobile power policies, yet no support matrix or deployment smoke test exists. Local Next headers may also differ from the final host.
- **User impact:** Visual effects, autoplay, downloads, focus, or caching can fail only after deployment or on a specific browser.
- **Engineering impact:** Maintainers cannot distinguish supported behavior from incidental behavior.
- **Implementation approach:** Define a compact browser matrix (current/previous Chrome, Firefox, Safari/WebKit, Edge; iOS/Android responsive smoke), automate the critical paths, and run a post-deploy check against the real origin for headers, sitemap/canonical, caching, release links, 404s, and media byte ranges. Manually inspect forced colors and low-power/reduced-motion at each release.
- **Difficulty:** M-L
- **Expected performance gain:** Identifies browser-specific expensive fallbacks and cache misconfiguration.
- **Memory / CPU / bundle effect:** CI/testing only.

### User experience and visual optimization opportunities

These are intentionally conservative. They preserve the current glassmorphic, spatial, blue-accent identity and do not alter information architecture merely for novelty.

#### UX-01 — Download/version state can be inconsistent or ambiguous

- **Severity:** High
- **Affected files/components:** Navbar, Hero, CTA, Footer, InstallGuide, Changelog, release helpers
- **Problem:** Some calls to action use hardcoded GitHub URLs while others derive release data; “latest” can include a prerelease in local logic while GitHub's `/releases/latest` selects stable releases. Architecture/OS is not identified before download, and fabricated fallback state can alter the displayed version.
- **User impact:** Users may choose the wrong artifact or see a label that does not match the destination.
- **Engineering impact:** Download policy is duplicated across components.
- **Implementation approach:** Centralize a verified stable release model and artifact matrix. Keep the existing CTA styling; add a concise detected/selected OS and architecture label with a safe “all downloads” alternative, current verified version/date, and signature/checksum link. Never infer architecture with certainty—allow correction and avoid automatic executable download without user action.
- **Difficulty:** M
- **Expected performance gain:** Cached release manifest can remove runtime/API work; otherwise neutral.
- **Memory / CPU / bundle effect:** Small static-data addition, offset by removing duplicate logic.

#### UX-02 — Documentation search and navigation do not scale with the content set

- **Severity:** Medium
- **Affected files/components:** Search suggestions, Sidebar/MobileDrawer, heading output
- **Problem:** Search relies on preset suggestion data rather than a validated page/heading index, has no section-level results, and cannot deep-link to headings. Sidebar labels/groups are separately authored and `toSentenceCase` can damage intended capitalization. Mobile tables/tabs then compound navigation friction after arrival.
- **User impact:** Readers know the concept but cannot quickly reach the relevant subsection; provider/product capitalization is inconsistent.
- **Engineering impact:** Search quality declines as pages are added.
- **Implementation approach:** Generate a compact server-built index from title, description, aliases, headings, and short excerpt; lazy-load it when search opens; preserve explicit display names from frontmatter; rank exact title/heading matches before fuzzy body matches; show page/section breadcrumbs; and link to stable heading anchors. Keep the current visual overlay.
- **Difficulty:** M
- **Expected performance gain:** Lazy loading avoids shipping search data on every docs view; search response becomes faster/more relevant.
- **Memory / CPU / bundle effect:** Small on-demand index; no page-hydration growth if loaded only on intent.

#### UX-03 — Error, loading, stale, and offline states are visually under-specified

- **Severity:** Medium-High
- **Affected files/components:** Changelog/release CTAs; clipboard actions; demo media; docs search
- **Problem:** External failure is hidden behind fake content, stale timestamps are not surfaced, clipboard failure has weak feedback, and media/search fallbacks are not clearly represented. The polished happy path therefore makes degraded states more misleading.
- **User impact:** Users cannot distinguish a genuine empty result from a network/provider failure or know whether an action succeeded.
- **Engineering impact:** Failures are harder to reproduce because UI state discards cause and freshness.
- **Implementation approach:** Use the existing card/badge language for honest loading, unavailable, stale-cache, empty, success, and retry states. State the source and last refresh for release data; keep a version-neutral download link available during failure; use live regions for action feedback; show the video poster when playback/data is unavailable.
- **Difficulty:** S-M
- **Expected performance gain:** Poster/fallback path reduces unnecessary retries; otherwise neutral.
- **Memory / CPU / bundle effect:** Minimal state/markup increase.

#### VIS-01 — Reuse static visual layers instead of recomputing equivalent effects

- **Severity:** Medium
- **Affected files/components:** refractive background, noise filters, Bento/Comparison/GlassPanel glows, diagram particles
- **Problem:** Similar noise, blur, gradient, pointer, and particle effects are defined independently. The appearance is strong, but the implementation repeats paint-heavy work and multiple embedded SVG filters.
- **User impact:** More GPU/paint demand and inconsistent motion behavior on weaker devices.
- **Engineering impact:** Visual tuning must be repeated and can drift.
- **Implementation approach:** Preserve exact colors/geometry while consolidating noise into one cached small asset or shared SVG definition; share CSS variables for glow radii/opacity; use static pseudo-elements for noninteractive light; limit `will-change` to active elements; and capture before/after screenshots at both themes and standard breakpoints.
- **Difficulty:** M
- **Expected performance gain:** Moderate paint/style reduction, especially on docs and idle states.
- **Memory / CPU / bundle effect:** Lower GPU layer/texture and CSS duplication; small bundle reduction.

#### VIS-02 — Content visuals should be versioned evidence, not decorative placeholders

- **Severity:** Medium
- **Affected files/components:** Spotlight ASCII mockup; feature diagrams; missing task screenshots across MDX
- **Problem:** Conceptual diagrams are attractive but can be mistaken for exact implementation; the only pseudo-screenshot is an ASCII placeholder, and critical setup/security screens have no visual reference.
- **User impact:** Readers cannot confirm they are in the correct desktop screen or release, especially during OS trust/keychain/MCP setup.
- **Engineering impact:** Unversioned visuals become silent misinformation.
- **Implementation approach:** Keep diagrams and label them “conceptual” where appropriate. Replace the ASCII mock with one versioned, compressed screenshot or semantic SVG based on the real UI. Add only high-value visuals identified in DOC-07, with release tag, alt/caption, dimensions, lazy loading, and a screenshot-refresh checklist.
- **Difficulty:** M
- **Expected performance gain:** Negative if unmanaged; enforce a per-page image budget and lazy-load to keep initial transfer neutral.
- **Memory / CPU / bundle effect:** Small below-the-fold image/cache cost; no JS needed.

#### VIS-03 — Motion should communicate state, not remain active as ambient work

- **Severity:** Medium-High
- **Affected files/components:** Hero, sphere, background, feature diagrams, loading/pulse elements
- **Problem:** Multiple ambient animations compete with functional motion and continue indefinitely. Some motion is not tied to user progress, status, or interaction.
- **User impact:** The premium effect can become distraction, motion sensitivity, and battery cost, especially while reading.
- **Engineering impact:** Continuous work masks actual loading-state animation and complicates performance budgets.
- **Implementation approach:** Preserve the same initial composition and short entrance. Let ambient effects settle after a brief cycle, resume only on intentional interaction/visibility, and reserve looping motion for genuine live status. Under reduced motion display the exact settled state. This changes timing, not visual identity.
- **Difficulty:** S-M
- **Expected performance gain:** Large idle CPU/GPU reduction together with PERF-02/03.
- **Memory / CPU / bundle effect:** Major continuous CPU/GPU savings; neutral bundle.

## Recommended phased implementation plan

### Phase 0 — Restore trust and make release gating real (1–3 focused engineering days plus owner review)

1. Freeze broad production promotion until P0 items are resolved.
2. Delete fabricated changelog data; render a verified last-known-good or honest unavailable state.
3. Upgrade Next.js and vulnerable transitive dependencies; remove vulnerable unused packages/overrides; rerun build and runtime smoke tests.
4. Correct or temporarily unpublish the highest-risk pages: Getting Started security-bypass text, Privacy, Anthropic, Ollama, Agentic, Voice, Logging, Multi-provider, Spotlight, and NVIDIA NIM.
5. Confirm licensing with the owner and add the authoritative license before continuing MIT/open-source claims.
6. Resolve formatting intentionally, repair coverage tooling, and add the first protected CI workflow.

**Exit criteria:** no fabricated content; no known high-severity production advisory; unsafe instructions removed; license claim substantiated; `npm run check` and coverage command pass in CI.

### Phase 1 — Meet a safe public quality floor (approximately 1 week)

1. Optimize video delivery and stop canvas/background work under reduced motion, offscreen, and hidden states.
2. Repair search/mobile drawer focus and semantics; add main/skip link, correct headings/tabs/labels/current state.
3. Fix theme token contrast and docs reflow at 320 CSS pixels/400% zoom.
4. Server-render and progressively disclose Changelog; suppress low-value prefetch.
5. Resize icon/logo assets, remove unused public assets, and set correct cache headers.
6. Add response security headers in report-only/testing mode first, then enforce.

**Exit criteria:** manual keyboard flows pass; zero serious/critical axe findings and no known AA contrast/reflow failure; reduced motion stops persistent motion; mobile performance median >=90 on the three audited routes; no wrong-theme media request.

### Phase 2 — Establish content and architecture durability (1–2 weeks, may overlap desktop work)

1. Export a versioned desktop web manifest for release assets, OS support, shortcuts, presets, storage/privacy facts, and capability flags.
2. Build a single validated docs manifest and derive nav/search/sitemap/metadata from it.
3. Complete the page correction matrix with source/version/reviewer fields.
4. Move static diagrams and release Markdown to server rendering; split route styles and consolidate visual primitives.
5. Add screenshots, deep links, troubleshooting, undo/verification steps, and primary vendor sources.
6. Remove dead code/dependencies and harden UI/util/error boundaries.

**Exit criteria:** every page has an owner, source, verified release/date, and content validation; desktop manifest drift fails CI; reading routes have minimal client JS; no orphan/dead content paths.

### Phase 3 — Continuous production assurance

1. Run scheduled release-asset/provider-ID/content link checks.
2. Record three-run median Lighthouse/bundle budgets on preview deployments.
3. Run keyboard/a11y/cross-browser tests and production-origin header/cache/link smoke tests.
4. Monitor dependency advisories and stale documentation SLAs.
5. Review privacy/data-flow docs whenever a network integration or storage path changes.

## Quantitative acceptance criteria

The team should adjust values only with measured evidence and explicit review. Suggested initial release budgets:

| Concern                  | Release criterion                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Security                 | 0 critical/high production advisories; every remaining advisory documented with owner, exposure analysis, and expiry                                                                       |
| CI                       | Format, lint, typecheck, unit, coverage, build, content validation, links, browser smoke, and audit pass on supported Node                                                                 |
| Mobile performance       | Median of 3 production-mode Lighthouse runs: Performance >=90, LCP <=2.5 s, TBT <=200 ms, CLS <=0.1 on `/`, Getting Started, Changelog                                                     |
| Transfer                 | Home initial view <=2 MiB before user intent; docs and Changelog <=500 KiB; no theme-opposite video request                                                                                |
| JavaScript               | Establish route baselines after server-boundary work; fail >10 KiB gzip unapproved growth per route                                                                                        |
| DOM                      | Changelog initial DOM <1,500 nodes; older releases progressively disclosed                                                                                                                 |
| Idle work                | No rAF/media animation when hidden/offscreen/reduced-motion; settled page target <2% of one core on reference hardware                                                                     |
| Accessibility automation | 0 serious/critical axe issues on representative routes in both themes                                                                                                                      |
| Accessibility manual     | Complete keyboard navigation, visible focus, focus trap/return, Escape, 320px and 400% reflow, 200% text spacing, forced colors, reduced motion, and screen-reader landmark/heading checks |
| Contrast                 | WCAG 2.2 AA token matrix and actual-state scan pass in both themes                                                                                                                         |
| Content integrity        | No invented release/model/platform facts; every doc current to supported release or visibly marked stale; unsafe command review passes                                                     |
| Discovery                | Canonical, sitemap, robots, unique verified metadata, one H1, valid heading hierarchy, stable heading anchors, and all sitemap URLs 200                                                    |
| Assets                   | Correct file formats/dimensions; immutable caching for fingerprinted media; no confirmed-unused public assets                                                                              |

## Suggested test matrix

| Layer         | Tests to add first                                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/domain   | GitHub schema and stable-release selection; unavailable/stale state; date/byte format edge cases; frontmatter/manifest validation; normalized secure slug paths; theme state machine; Button/LinkButton semantics |
| Component     | Search combobox results/keyboard/live status; drawer state/route close; install tabs/copy feedback; Changelog filter label/pressed state; release heading normalization                                           |
| Browser       | Tab order/trap/return/Escape; hidden drawer not focusable; 320px/400% reflow; reduced motion and hidden-tab pause; system/light/dark theme media requests; skip/main/headings; all download CTAs                  |
| Accessibility | axe in both themes; contrast-token tests; forced-colors snapshot/manual pass; VoiceOver/NVDA smoke on search/navigation/docs table                                                                                |
| Content       | All frontmatter schema; nav/search/sitemap completeness; internal/external links; code-fence languages; prohibited unsafe patterns; version/source freshness; generated desktop-manifest parity                   |
| Performance   | Lighthouse CI 3-run median; initial transfer/request count; route gzip JS/CSS/HTML; no large eager video; idle rAF/CPU assertion; Changelog DOM size                                                              |
| Deployment    | Headers/CSP report; immutable media caching; canonical/sitemap/robots; 404; GitHub API stale fallback; release checksum/signature links                                                                           |

## Positive findings worth preserving

- The app-router layout and component naming make the main product areas easy to locate.
- The custom frontmatter parser avoids the prior SSR/build compatibility problem and can remain if it gains schema validation and diagnostics.
- The production build statically emits the documentation routes successfully.
- The existing Vitest suite is fast and fully passing; it is a useful base rather than something to replace.
- Link crawling found no genuine broken navigation link in the audited build.
- No browser console errors were observed on the sampled home, Getting Started, or Changelog routes.
- ReactMarkdown's default behavior does not enable raw HTML, and no immediate Markdown XSS was observed.
- The visual identity is consistent across marketing, documentation, and Changelog; the recommended changes can retain it.
- The desktop application genuinely implements many advanced capabilities described at a high level: Tauri/Rust provider access, encrypted local persistence, worktree/artifact flows, MCP transports, local/cloud transcription paths, Appshots, Spotlight, and comparison workflows. The documentation needs narrower, versioned claims—not wholesale deletion.

## Evidence appendix

### Repository observations

- 98 tracked files and approximately 83 text/source-content files.
- 42 production TypeScript/TSX files, 28 components, 10 test files, and 21 documentation pages.
- No `next.config.*`, repository license, CI workflow, robots route, sitemap route, manifest, or environment example was present.
- `globals.css` is 1,954 lines; emitted route CSS totaled roughly 111 KiB raw/19 KiB gzip.
- Largest public assets: `lightDemo.mp4` 12,889,258 bytes; `darkDemo.mp4` 10,322,654 bytes; 2,000×2,000 logo/icon files 362,875 bytes each; unused 4,096×4,096 profile image 264,381 bytes.

### Commands and checks used

```text
npm test
npx tsc --noEmit
npx next build
npm run check
npm run test:coverage
npm audit --json
npm ls
npx knip
npx jscpd src
npx next start -p 3100
curl/Invoke-WebRequest production routes and headers
Lighthouse CLI against /, /docs/getting-started, /changelog
pa11y/axe scans against the same representative routes
Puppeteer keyboard, focus, reflow, reduced-motion, network, heading, and CPU probes
Linkinator crawl of the production build
Source/release comparison against sythoria-desktop v0.4.2
```

### Machine-readable artifacts

The audit generated local diagnostic artifacts outside the application source tree, including:

- `lighthouse-home-mobile.json`
- `lighthouse-doc-mobile.json`
- `lighthouse-changelog-mobile.json`
- `pa11y-home.json`
- `pa11y-docs.json`
- `pa11y-changelog.json`
- `npm-audit.json`
- `linkinator.json`

They are stored under the current Codex visualization workspace, not intended for application deployment. Re-run them after Phase 1 rather than treating the single-run values as permanent baselines.

## Final production-readiness decision

**Decision: do not label or treat the current website as production-ready yet.**

The site can reach production quality without a redesign. First restore factual and supply-chain trust: remove fabricated release data, patch high-severity dependencies, correct unsafe/inaccurate documentation, establish the license, and enforce a green release gate. Then address the landing media/animation cost and the manual accessibility failures. Finally, connect website content to a versioned desktop manifest so the same class of drift cannot quietly return.

Once the Phase 0 and Phase 1 exit criteria pass on the deployed origin—and the highest-risk documentation pages have an explicit source/version review—the site would be reasonable to reassess as a production candidate.
