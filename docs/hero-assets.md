# Properties Pak hero photography

The homepage hero uses the residence photo shown on the live site: Ahmet Çötür’s Pexels photo
31817157, “Luxurious modern villa with infinity pool at sunset”:

https://www.pexels.com/photo/luxurious-modern-villa-with-infinity-pool-at-sunset-31817157/

`heroImage` in `src/lib/images.ts` serves the full-resolution original through Pexels’ image CDN.
Desktop candidates range from 1280px to 3840px; phones below 768px use dedicated 3:4 crops at
640 × 854, 960 × 1280 and 1280 × 1707. The `<picture>` in `src/components/hero.tsx` selects the
appropriate responsive set, and React hoists a preconnect to `images.pexels.com`.

The hero `<img>` is eager, uses `fetchpriority="high"` and has the source dimensions. A local
WebP residence image remains as a resilient fallback if the CDN is unavailable. The hero is
representative architectural photography, not a specific advertised listing. `residence-social.jpg`
remains the social-card fallback in `src/lib/seo.ts`.

## Section artwork (bundled)

Premium section images are stored in `src/assets/images/` and imported through
`src/lib/site-images.ts`. Next.js then serves them from `/_next/static/media/<hash>`
with immutable caching, the same pipeline as the app's JS and CSS. `SitePicture`
renders AVIF first and falls back to WebP.

| Key | Used in | Files |
| --- | --- | --- |
| `commercialTower` | Home → Spaces Built for Business (main image) | `commercial-tower-{800,1200}` |
| `commercialLobby` | Home → Spaces Built for Business (inset card) | `commercial-lobby-{480,960}` |
| `smarterLiving` | Home → Real Estate, Made Smarter | `smarter-living-768` |
| `aboutVilla` | About → Our approach | `about-villa-768` |

All four are AI-generated architectural artwork. They are representative, not photographs of a
specific listing, and are never upscaled past their source resolution.

## Brand green

The site uses one green: `--color-brand` `#10A456` in `src/app/globals.css`. The old
`forest-400/500/600/700` steps are aliases that all resolve to it, so every button, label,
icon, underline, badge and the logo share the same colour. The only other green values are
`--color-forest-800` `#0C8A47` (hover/pressed state of filled buttons) and
`--color-forest-50` `#E8F6EE` (a pale tint of the same hue for soft backgrounds).
