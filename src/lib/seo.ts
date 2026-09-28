import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import { heroImage, ogImage } from "@/lib/images";
import type { Post, Project, Property } from "@/db/schema";
import { formatArea, formatPrice } from "@/lib/format";

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  robots?: Metadata["robots"];
};

/**
 * Filter and parameter URLs are kept crawlable but excluded from the index so
 * Google does not treat thousands of combinations as duplicate thin pages.
 */
export function listingRobots(hasFilters: boolean): Metadata["robots"] {
  return hasFilters
    ? { index: false, follow: true, googleBot: { index: false, follow: true } }
    : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } };
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  keywords,
  type = "website",
  publishedTime,
  robots,
}: MetaInput): Metadata {
  const url = `${SITE.url}${path === "/" ? "" : path}`;
  const og = image ?? ogImage;
  return {
    // `absolute` keeps authored titles exactly as written (no double brand suffix).
    title: { absolute: title },
    description,
    keywords,
    robots: robots ?? { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      publishedTime,
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: "Pak Property Pakistan",
    description: SITE.description,
    url: SITE.url,
    email: SITE.companyEmail,
    telephone: SITE.companyPhone,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: SITE.companyPhone,
        email: SITE.companyEmail,
        areaServed: "PK",
        availableLanguage: ["en", "ur"],
      },
      {
        "@type": "ContactPoint",
        contactType: "international enquiries",
        telephone: SITE.companyPhoneUs,
        email: SITE.companyEmail,
        areaServed: ["US", "GB", "AE"],
        availableLanguage: ["en"],
      },
    ],
    image: `${SITE.url}${heroImage.og}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Property discovery and investment tools",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Property search across Pakistan" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Property comparison and demo property scores" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mortgage, yield and investment calculators" } },
      ],
    },
    areaServed: [
      { "@type": "City", name: "Lahore" },
      { "@type": "City", name: "Islamabad" },
      { "@type": "City", name: "Karachi" },
      { "@type": "City", name: "Rawalpindi" },
      { "@type": "City", name: "Faisalabad" },
      { "@type": "City", name: "Multan" },
      { "@type": "City", name: "Gujranwala" },
      { "@type": "City", name: "Peshawar" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.companyAddress.street,
      addressCountry: "PK",
      addressRegion: "Punjab",
      addressLocality: SITE.companyAddress.city,
    },
    parentOrganization: {
      "@type": "Organization",
      "@id": `${SITE.companyUrl}#organization`,
      name: SITE.company,
      description:
        "WordbitX Software Company is a full-service technology company engineering web platforms, PropTech solutions, custom software & mobile apps in Pakistan and globally.",
      url: SITE.companyUrl,
      email: SITE.companyEmail,
      telephone: SITE.companyPhone,
      sameAs: [
        "https://www.linkedin.com/",
        "https://www.facebook.com/",
        "https://www.instagram.com/",
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.companyAddress.street,
        addressCountry: "PK",
        addressRegion: "Punjab",
        addressLocality: SITE.companyAddress.city,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: SITE.companyPhone,
          areaServed: "PK",
        },
        {
          "@type": "ContactPoint",
          contactType: "international enquiries",
          telephone: SITE.companyPhoneUs,
          areaServed: ["US", "GB", "AE", "SA"],
        },
      ],
    },
    slogan: SITE.tagline,
    isAccessibleForFree: true,
    disambiguatingDescription:
      "Pak Property is the official real estate platform demonstration product developed and powered by WordbitX Software Company (https://wordbitxtech.com/).",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/properties?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  about?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.url}${input.path}#webpage`,
    name: input.name,
    description: input.description,
    url: `${SITE.url}${input.path}`,
    isPartOf: { "@id": `${SITE.url}/#website` },
    publisher: { "@id": `${SITE.url}/#organization` },
    about: (input.about ?? []).map((name) => ({ "@type": "Thing", name })),
    inLanguage: "en-PK",
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.href === "/" ? "" : item.href}`,
    })),
  };
}

export function propertyJsonLd(property: Property) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    url: `${SITE.url}/property/${property.slug}`,
    description: property.description,
    image: property.images.slice(0, 4),
    datePosted: property.createdAt instanceof Date ? property.createdAt.toISOString() : undefined,
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.areaSqft,
      unitCode: "FTK",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || property.locationArea,
      addressLocality: property.cityName,
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/property/${property.slug}`,
      description: `${formatPrice(property.price, property.priceUnit)} · ${formatArea(
        property.areaValue,
        property.areaUnit,
        property.areaSqft,
      )}`,
    },
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.name,
    url: `${SITE.url}/projects/${project.slug}`,
    description: project.description,
    image: [project.coverImage, ...project.images].slice(0, 3),
    address: {
      "@type": "PostalAddress",
      streetAddress: project.location,
      addressLocality: project.cityName,
      addressCountry: "PK",
    },
    geo: { "@type": "GeoCoordinates", latitude: project.lat, longitude: project.lng },
    numberOfAccommodationUnits: project.units || undefined,
  };
}

export function articleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    author: { "@type": "Organization", name: post.author },
    publisher: { "@id": `${SITE.url}/#organization` },
    datePublished: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : undefined,
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
