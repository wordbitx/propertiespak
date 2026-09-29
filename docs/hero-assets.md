# Pak Property hero photography

The homepage uses architectural photography by Max Vakhtbovych from Pexels:

https://www.pexels.com/photo/a-modern-house-with-swimming-pool-under-the-blue-sky-8134750/

A 3600 × 2400 source was used to produce native-resolution, locally served AVIF and WebP variants. No variant is upscaled. Desktop outputs are 1600, 2400 and 3200 pixels wide; portrait mobile crops are 768 and 1280 pixels wide. The JPEG social card is a real JPEG (1200 × 630).

The hero uses representative architectural photography rather than a photograph of a specific advertised listing. No listing price or property-specific claim is embedded in the hero. Uploaded listing photography is independent and remains unchanged.

Responsive `picture` sources select mobile crops below 768px and serve AVIF where supported with WebP fallback. The hero is eager-loaded with high fetch priority and explicit dimensions. The previous hero assets remain available for existing references.

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
