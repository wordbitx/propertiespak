import { IconWhatsApp } from "@/components/icons";
import { SITE } from "@/lib/constants";

const CONTACTS = [
  { label: "Pakistan", number: SITE.companyPhone, digits: "923251888841" },
  { label: "New York, USA", number: SITE.companyPhoneUs, digits: "19296197699" },
];

/** Company WhatsApp contacts shown in the site-wide footer. */
export function WordbitxContacts({ light = false }: { light?: boolean }) {
  const message = encodeURIComponent("Hi WordbitX, I would like to know more about the Properties Pak platform.");
  return (
    <div className="company-contact-grid">
      {CONTACTS.map((contact) => (
        <div key={contact.label} className="min-w-0">
          <p className={`mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] ${light ? "text-white/60" : "text-ink-muted"}`}>{contact.label}</p>
          <a href={`https://wa.me/${contact.digits}?text=${message}`} target="_blank" rel="noopener noreferrer" aria-label={`Contact WordbitX ${contact.label} on WhatsApp: ${contact.number}`} className={`company-contact-link ${light ? "company-contact-link--light" : ""}`}>
            <IconWhatsApp className={`h-5 w-5 shrink-0 ${light ? "text-forest-400" : "text-forest-700"}`} /><span className="whitespace-nowrap tabular-nums">{contact.number}</span>
          </a>
        </div>
      ))}
    </div>
  );
}
