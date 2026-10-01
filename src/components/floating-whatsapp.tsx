"use client";

import { usePathname } from "next/navigation";
import { IconWhatsApp } from "@/components/icons";
import { useLanguage } from "@/components/language-provider";
import { SITE } from "@/lib/constants";

const WHATSAPP_NUMBER = SITE.companyPhone.replace(/\D/g, "");
const MESSAGE = encodeURIComponent("Hello Properties Pak, I would like help with buying, selling or renting property in Pakistan.");

/** Paths that already carry their own sticky Call/WhatsApp bar on phones. */
const STICKY_BAR_PATHS = [/^\/property\/[^/]+/];

/**
 * Direct, human support through the existing company WhatsApp channel.
 *
 * Rendered as the recognisable green WhatsApp button so it reads as the contact
 * shortcut it is. On property detail pages the phone viewport already has a
 * sticky Call / WhatsApp bar pinned to the bottom edge, so the floating button
 * steps aside there (`data-sticky-bar`) instead of covering it.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  const { t } = useLanguage();
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth") || pathname === "/login") return null;
  const hasStickyBar = STICKY_BAR_PATHS.some((pattern) => pattern.test(pathname));

  return (
    <a
      className="floating-whatsapp"
      data-sticky-bar={hasStickyBar ? "true" : undefined}
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Chat with Properties Pak on WhatsApp")}
      title={t("Chat with Properties Pak on WhatsApp")}
    >
      <span className="floating-whatsapp-icon" aria-hidden="true"><IconWhatsApp /></span>
      <span className="floating-whatsapp-label" aria-hidden="true">{t("Chat on WhatsApp")}</span>
    </a>
  );
}
