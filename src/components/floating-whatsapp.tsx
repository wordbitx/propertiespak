"use client";

import { usePathname } from "next/navigation";
import { IconWhatsApp } from "@/components/icons";
import { SITE } from "@/lib/constants";

const WHATSAPP_NUMBER = SITE.companyPhone.replace(/\D/g, "");
const MESSAGE = encodeURIComponent("Hi Properties Pak, I need help with property search.");

/** A phone-only company contact action; detail pages already have a listing-specific contact bar. */
export function FloatingWhatsApp() {
  const pathname = usePathname();

  if (pathname.startsWith("/property/") || /^\/admin(?:\/|$)/.test(pathname)) return null;

  return (
    <a
      className="floating-whatsapp"
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Properties Pak on WhatsApp"
      data-testid="floating-whatsapp"
    >
      <IconWhatsApp />
      <span>WhatsApp</span>
    </a>
  );
}
