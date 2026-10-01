"use client";

import { usePathname } from "next/navigation";
import { IconWhatsApp } from "@/components/icons";
import { useLanguage } from "@/components/language-provider";
import { SITE } from "@/lib/constants";

const WHATSAPP_NUMBER = SITE.companyPhone.replace(/\D/g, "");
const MESSAGE = encodeURIComponent("Hello Properties Pak, I would like help with buying, selling or renting property in Pakistan.");

/** Direct, human support through the existing company WhatsApp channel. */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  const { t } = useLanguage();
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth") || pathname === "/login") return null;

  return (
    <a
      className="floating-whatsapp"
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
