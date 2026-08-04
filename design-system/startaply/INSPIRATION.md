# Design Inspiration Research

## Evidence Matrix

| Source | Observed pattern | Why it works | Adapt as | Do not copy |
|---|---|---|---|---|
| **Mobbin (Product Flow)**<br>https://mobbin.com/ | **Filter-led discovery:** Clear, sticky horizontal filter chips on mobile. High-contrast typography with deep hierarchy. | Allows users to quickly narrow down vast amounts of content without loading new pages. Reduces cognitive load. | **Mobile sticky filters:** Implement horizontal scrollable filter chips just below the navbar for immediate role/category switching. | Exact visual styling of their navigation rails or brand colors. |
| **Wellfound (Career Product)**<br>https://wellfound.com/ | **Credible Company Cards:** Cards prioritize company logo, size, and hiring signals over decorative images. | Builds trust immediately. Candidates care about who the company is and if the role is truly active. | **Trust-first Job Cards:** Emphasize verification checkmarks and clear logos. Use a static "Actively hiring" or "Verified" status unless live state truly exists. | Their specific typography (Graphik) or exact card layout grid. |
| **Godly (Premium Visual)**<br>https://godly.website/ | **Subtle Depth & Restraint:** Minimal use of borders. High reliance on spacing and soft, diffused shadows to create elevation. | Feels premium and modern without being visually overwhelming. | **Elevation through spacing:** Use a structured spacing system (4px grid) and very subtle, single-color borders for definition. Note: large/diffused shadows can still be computationally expensive on low-end devices. | Complex continuous WebGL animations, heavy decorative backgrounds, or heavy box-shadows. |

## Synthesis & Principles

1. **Information over Decoration:** Early-career users on low-bandwidth connections need answers, not animations. Every visual element must serve a functional purpose (e.g., indicating an active job or verified company).
2. **Accessible Depth:** Instead of heavy glassmorphism or expensive blurs, achieve a premium feel through impeccable typography hierarchy, generous white space, and subtle, high-contrast borders.
3. **Frictionless Mobile Discovery:** The mobile experience must feel like a native app. Bottom navigation for core routes, sticky filter bars, and touch-optimized cards (min 44x44px targets) are mandatory.

## Strict Anti-Copy Constraints
- Do not clone exact layouts from Wellfound or Mobbin.
- Do not extract or use any trademarked logos or brand assets from these platforms.
- Do not copy verbatim copy or text snippets.
- Ensure all implemented patterns are uniquely styled to fit Startaply's distinct brand identity.
