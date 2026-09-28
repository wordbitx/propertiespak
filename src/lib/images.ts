/**
 * Curated, licence-free architectural photography (Pexels CDN) plus the
 * product's own generated hero artwork. Helpers build correctly sized URLs so
 * cards, grids and the hero never download more pixels than they render.
 */
export function photo(id: number, width = 1200, height?: number): string {
  const h = height ?? Math.round((width * 2) / 3);
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${h}`;
}

export const photos = {
  villas: [36676879, 28054849, 27626185, 36394726, 19075389, 19075387, 31817157, 24805054, 28915352, 19075392],
  interiors: [8082227, 6444249, 6580381, 7546213, 8141959, 6899354, 7174113, 7045919, 7546230, 7546321],
  bedrooms: [6585757, 7031879, 8135496, 35021550, 34818802, 6538888, 8146212, 6587896],
  commercial: [1313534, 38247895, 267501, 2040476, 13437132, 8310949, 4534504, 18468708, 13762569, 13219418],
  dev: [36422828, 38524594, 11680715, 25310909, 15370209, 30505108, 31249549, 7937746],
  retail: [30929605, 31573705, 31853833, 15054264, 19193275, 12547325],
  cities: {
    lahore: 34619221,
    islamabad: 27698081,
    karachi: 31552071,
    rawalpindi: 12938380,
    faisalabad: 30505108,
    multan: 13659051,
    gujranwala: 14934001,
    peshawar: 35428531,
    lahoreAlt: 13659051,
    karachiAlt: 19896048,
    islamabadAlt: 39372652,
  },
} as const;

/**
 * Architectural photography by Max Vakhtbovych (Pexels photo 8134750).
 * Local assets generated from a 3600×2400 source, never upscaled.
 * Portrait crops are art-directed separately; AVIF has a WebP fallback.
 */
export const heroImage = {
  desktop: "/images/residence-3200.webp",
  tablet: "/images/residence-1600.webp",
  mobile: "/images/residence-mobile-768.webp",
  desktopSrcSet: "/images/residence-1600.webp 1600w, /images/residence-2400.webp 2400w, /images/residence-3200.webp 3200w",
  avifSrcSet: "/images/residence-1600.avif 1600w, /images/residence-2400.avif 2400w, /images/residence-3200.avif 3200w",
  mobileSrcSet: "/images/residence-mobile-768.webp 768w, /images/residence-mobile-1280.webp 1280w",
  mobileAvifSrcSet: "/images/residence-mobile-768.avif 768w, /images/residence-mobile-1280.avif 1280w",
  og: "/images/residence-social.jpg",
  alt: "Contemporary residence with floor-to-ceiling windows, a landscaped lawn and a swimming pool",
};

export const investmentImage = {
  src: "/images/investment-1440.webp",
  alt: "Residential development courtyard with reflecting pool lit at blue hour",
};

export const ogImage = heroImage.og;
