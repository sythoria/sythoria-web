# Design Brief: Sythoria Web Redesign

## Problem
Users looking for a privacy-first AI chat tool are met with generic SaaS landing pages that feel corporate, uninspired, and untrustworthy. They want a tool that feels deeply personal, highly technical, and completely private (BYOK). The current "basic SaaS" aesthetic fails to communicate the unique "hacker/privacy" ethos of Sythoria, blending into a sea of generic AI tools.

## Solution
An immersive, spatial landing experience that breaks away from standard scrolling and bento boxes. Instead of scrolling down a flat page, users move "through" a spatial canvas where features and propositions float into view. The design utilizes a strictly monochrome, chrome-like aesthetic with fluid, refractive glass layers, making the interface feel like a premium, secret, high-precision instrument rather than a B2B product.

## Experience Principles

1. **Spatial Depth over Flat Hierarchy** -- Standard sections (hero, features, footer) are replaced by a spatial Z-axis journey. Elements overlap, blur, and refract as the user navigates.
2. **Technical Precision over Playful Softness** -- The UI should feel like a high-end physical tool or a precise digital instrument. No soft pastels; strictly monochrome with silver/chrome accents.
3. **Fluidity over Snappiness** -- Interactions and transitions use heavy, liquid-like spring physics. The interface shouldn't just "snap"; it should flow, refract, and settle smoothly.

## Aesthetic Direction

- **Philosophy**: Ethereal & Spatial mixed with Monochrome Chrome.
- **Tone**: Premium, secretive, highly technical, calm but authoritative.
- **Reference points**: iOS Liquid Glass, high-end industrial design (Teenage Engineering), dark mode spatial computing interfaces, polished dark glass.
- **Anti-references**: Typical B2B SaaS, bento boxes, bright neon/cyberpunk, soft pastel gradients, flat generic illustrations.

## Existing Patterns

- **Typography**: Currently using "DM Sans" and "JetBrains Mono" / "Fira Code" (defined in `globals.css`). We will keep "JetBrains Mono" for technical data, but we may need a starker, sharper sans-serif or use DM Sans in a more brutalist, contrasting way.
- **Colors**: Currently standard light/dark mode variables. We will overwrite the landing page specific variables (`--theme-landing-bg`, `--theme-landing-card`) to enforce the Monochrome Chrome aesthetic.
- **Spacing**: Tailwind CSS v4 defaults.
- **Dependencies**: React 19, Tailwind CSS v4, Lucide React, Framer Motion (need to add for spatial canvas and fluid physics).

## Component Inventory

| Component | Status | Notes |
| --------- | ------ | ----- |
| Spatial Canvas Container | New | The main wrapper that handles 3D/Z-axis scrolling or fluid parallax. |
| Glass Panel (Card) | Modify/New | Replaces standard cards. Needs strong backdrop-blur, subtle silver borders, and noise texture. |
| Immersive Hero | Modify | Moves away from a standard two-column or centered text block into a floating typography treatment. |
| Fluid Navigation | Modify | A minimalist, floating glass pill rather than a standard top-bar. |
| Refractive Background | New | A dynamic background (possibly SVG filters, CSS gradients, or WebGL) that simulates liquid chrome/glass. |

## Key Interactions

- **Scroll-driven Parallax**: As the user scrolls, elements move on the Z-axis (scaling up/down, fading, blurring) rather than just moving up the Y-axis.
- **Hover States**: Hovering over glass panels slightly shifts the background refraction and subtly brightens the silver borders using fluid spring animations.
- **Initial Load**: The spatial canvas "materializes" from a dark void, with elements floating into their resting Z-positions.

## Responsive Behavior

- On mobile, the extreme Z-axis spatial effects are dialed back to prevent performance issues and disorientation, relying more on overlap, backdrop filters, and fluid Y-axis scroll reveals.

## Accessibility Requirements

- **Contrast**: Despite the monochrome palette, text must maintain WCAG AA contrast. The "chrome" accents should not compromise text legibility.
- **Motion**: Must respect `prefers-reduced-motion`. If enabled, the spatial canvas falls back to a standard, elegant cross-fade scroll experience.

## Out of Scope

- Redesigning the actual Chat interface or Settings pages. This brief is strictly for the marketing/landing page (`src/app/page.tsx` and `src/components/marketing/*`).
