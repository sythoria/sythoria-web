# Build Tasks: Sythoria Web Redesign

Generated from: .design/sythoria-web/DESIGN_BRIEF.md
Date: 2026-06-15

## Foundation
- [ ] **Install framer-motion**: Add `framer-motion` to `package.json` for spatial canvas and fluid physics.
- [ ] **Refractive Background**: Build a dynamic background component (using CSS/SVG or framer-motion) that provides a liquid chrome/glass look, dropping the current purple gradients. _New component._
- [ ] **Spatial Canvas Container**: Create a wrapper component for the landing page that manages Z-axis depth and fluid scroll-based parallax. _New component._

## Core UI
- [ ] **Fluid Navigation**: Modify `src/components/marketing/Navbar.tsx` to become a minimalist, floating glass pill rather than a standard top-bar, applying the Ethereal & Spatial aesthetic. _Modifies: Navbar.tsx_
- [ ] **Immersive Hero**: Update `src/components/marketing/Hero.tsx` to move away from a standard text block into a floating typography treatment with Z-axis depth. _Modifies: Hero.tsx_
- [ ] **Glass Panel (Card)**: Update `src/components/marketing/Features.tsx` and `src/components/marketing/Comparison.tsx` or create a shared `GlassPanel` component. Add strong backdrop-blur, subtle silver borders, and noise texture. _Modifies: Features.tsx, Comparison.tsx_

## Interactions & States
- [ ] **Scroll-driven Parallax**: Implement the scroll progress linked to the Z-axis in the Spatial Canvas and Hero/Features. As the user scrolls, elements should scale and fade on the Z-axis.
- [ ] **Fluid Hover States**: Add heavy spring physics to the Glass Panels on hover, slightly shifting background refraction and brightening silver borders.

## Responsive & Polish
- [ ] **Mobile Adjustment**: Ensure the extreme Z-axis spatial effects are dialed back on mobile, falling back to overlap and fluid Y-axis scroll reveals to prevent performance issues.
- [ ] **Accessibility Pass**: Verify WCAG AA contrast for text over the monochrome chrome elements and respect `prefers-reduced-motion` for the framer-motion animations.
- [ ] **Integration in page.tsx**: Wire up the Refractive Background, Spatial Canvas, and modified marketing components in `src/app/page.tsx`.

## Review
- [ ] **Design review**: Run /design-review against the brief.