

# Premium AI/Systems Engineer Portfolio

A single-page portfolio that feels like a Swiss design studio crossed with a race-engine telemetry system. Engineered, not decorated.

## Design System

- **Colors**: 85% monochrome base (pure white, off-white, deep black, neutral greys). Racing red accents for CTAs, underlines, metrics, hover states. Brushed metallic silver for grid lines, dividers, borders.
- **Typography**: Google Fonts — bold geometric display font (e.g., Space Grotesk) + clean body sans-serif (e.g., Inter). Strong size contrast, editorial feel.
- **Grid**: Strict Swiss-style modular grid with generous whitespace, asymmetric compositions, and clear hierarchy.
- **Animations**: CSS-only, GPU-friendly transforms. 150–300ms cubic-bezier transitions. Scroll-triggered reveals via Intersection Observer. No bounce, no fluff.

## 3D Hero Element

- React Three Fiber + Drei with lazy loading and Suspense fallback
- Abstract Swiss-inspired geometric composition — clean metallic polyhedra arranged in a grid-like structure
- Brushed silver material with subtle red accent lighting
- Slow rotation, frameloop="demand", pauses when tab inactive
- Responsive canvas sizing, no layout shift

## Page Sections

### 1. Hero — "Intelligence Engine"
- Large Swiss-aligned headline: "Engineering Intelligent Systems at Scale."
- Subheadline with role descriptors
- Three CTAs: View Systems / Download Resume / Contact
- Animated red underline, text reveal animations, scroll indicator
- 3D geometric element as subtle background accent

### 2. Systems & AI Projects — "Architected Solutions"
- Grid of project cards with realistic placeholder AI/LLM projects (RAG pipelines, multi-agent systems, inference optimization, etc.)
- Each card: system name, impact statement, architecture summary, tech stack, measurable result
- Hover effects: subtle 3D tilt via CSS perspective transforms, red underline reveal, elevation shift, silver border shimmer

### 3. Capabilities — "Systems Thinking"
- Three-column layout: AI/LLM Engineering, Systems Engineering, Frontend Engineering
- Each skill with impact description and outcome-focused phrasing
- Silver dividers, red hover underlines, scroll-based reveal animations
- Minimal animated metric/progress bars

### 4. Impact Metrics — "Performance Dashboard"
- Horizontal strip with key metrics (AI Systems Deployed, Latency Reduced, etc.)
- Animated count-up effect triggered on scroll into view
- Thin red highlights, silver dividers
- Telemetry dashboard aesthetic — minimal but data-rich

### 5. Contact / CTA — Conversion
- Clean contact section with email link and social links
- Resume download placeholder link
- Strong CTA with red accent styling
- Frictionless, scannable in seconds

## Performance Strategy
- All 3D dynamically imported with React.lazy
- Intersection Observer for scroll animations (no animation library)
- Memoized heavy components
- Tab visibility API to pause animations when inactive
- Optimized for 60fps

## Responsive Design
- Mobile-first with Swiss grid maintained across all breakpoints
- Typography scales elegantly
- 3D canvas resizes or simplifies on mobile
- All sections stack cleanly on small screens

