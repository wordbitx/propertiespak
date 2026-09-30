# Pak Property hero photography

The homepage hero is a contemporary luxury villa with an infinity pool at sunset, by Ahmet
Çötür on Pexels (free Pexels licence):

https://www.pexels.com/photo/luxurious-modern-villa-with-infinity-pool-at-sunset-31817157/

The original is 7688 × 5128. It is served straight from the Pexels image CDN
(`images.pexels.com`), which resizes from that original, so every candidate is a true
downscale: desktop `srcset` widths 1280, 1600, 2000, 2400, 3200 and 3840 (4K / retina), and
3:4 portrait crops at 640, 960 and 1280 for phones below 768px. The URLs are built by
`heroImage` in `src/lib/images.ts`.

The villa sits on the right of the frame, so the headline reads over the sunset sky and the
pool without any mirroring. Earlier heroes (`public/images/residence-*`, then Pexels
28054849) were replaced; only `residence-social.jpg` is still referenced (social card
fallback in `src/lib/seo.ts`).

Performance: the hero `<img>` is eager with `fetchpriority="high"` and explicit dimensions,
and the hero renders a `<link rel="preconnect" href="https://images.pexels.com">` that React
hoists into `<head>`. The same CDN already serves listing photography, so no new third party
is introduced.

The hero is representative architectural photography, not a photograph of a specific
advertised listing. No price or property-specific claim is embedded in it.

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
