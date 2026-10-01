import { IconWhatsApp } from "@/components/icons";
import { SITE } from "@/lib/constants";

const CONTACTS = [
  { label: "Pakistan", number: SITE.companyPhone, digits: "923251888841" },
  { label: "New York, USA", number: SITE.companyPhoneUs, digits: "19296197699" },
];

/** Compact contacts reused in the elevated company section and site-wide footer. */
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

/** The company behind Properties Pak, deliberately placed BEFORE the closing property CTA. */
export function WordbitxSection() {
  return (
    <section id="wordbitx" className="wordbitx-section wordbitx-credit-section" aria-label="Platform technology credit" data-testid="wordbitx-company">
      <div className="ui-container wordbitx-credit-bar">
        <span>Designed &amp; developed by</span>
        <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="wordbitx-credit-link">Wordbit<span>X</span> <span className="wordbitx-company-suffix">| SMC- Pvt. Ltd.</span></a>
      </div>
    </section>
  );
}
