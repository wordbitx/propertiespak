# Pak Property hero photography

The homepage hero is a twilight stone villa with an infinity pool by Ahmet Çötür on Pexels
(free Pexels licence):

https://www.pexels.com/photo/a-luxury-villa-with-a-swimming-pool-at-dusk-28054849/

The original is 8192 × 5464. It is served straight from the Pexels image CDN
(`images.pexels.com`), which resizes from that original, so every candidate is a true
downscale: desktop `srcset` widths 1280, 1600, 2000, 2400, 3200 and 3840 (4K / retina), and
3:4 portrait crops at 640, 960 and 1280 for phones below 768px. The URLs are built by
`heroImage` in `src/lib/images.ts`.

The previous hero (`public/images/residence-*`) was a soft, upscaled render; only
`residence-social.jpg` is still referenced (social card fallback in `src/lib/seo.ts`).

On desktop the photo is mirrored with CSS (`transform: scaleX(-1)`) so the villa sits on the
right and the headline reads over open sky. The photo contains no text or signage, so the
mirror is invisible.

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
