# canxietyclothing.github.io

CANxiety Clothing launch page — an independent UK streetwear brand preparing its first limited drop.

## Site structure

- `index.html` — one-page semantic landing page, metadata, and structured data
- `styles.css` — responsive editorial design and reduced-motion support
- `script.js` — reveal effects, reservation fallbacks, and founder-list email handling
- `logo.png` — original CANxiety logo
- `assets/lookbook/` — lightweight campaign placeholders that can be replaced with final photography
- `assets/social-card.png` — launch artwork for Open Graph and social sharing
- `robots.txt` / `sitemap.xml` — search-engine discovery files

The site is static and deploys directly through GitHub Pages with no build step or backend.

## Connecting launch services

Replace the placeholder values in `SITE_CONFIG.checkoutLinks` inside `script.js` with secure HTTPS payment links from Stripe, Shopify, or PayPal. Until then, reservation buttons safely route visitors to the founder-list form instead of opening a broken checkout.

Founder requests currently open a pre-filled email to `hello@canxiety.co.uk`. No card details are collected by this site.
