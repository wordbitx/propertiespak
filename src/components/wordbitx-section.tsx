import { IconArrowRight, IconMail, IconPin, IconWhatsApp } from "@/components/icons";
import { SITE } from "@/lib/constants";

const CONTACTS = [
  { label: "Pakistan", number: SITE.companyPhone, digits: "923251888841" },
  { label: "USA & Intl", number: SITE.companyPhoneUs, digits: "19296197699" },
];

/** Compact contacts reused in the elevated company section and site-wide footer. */
export function WordbitxContacts({ light = false }: { light?: boolean }) {
  const message = encodeURIComponent("Hi WordbitX, I would like to know more about the Pak Property platform.");
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

/** The company behind Pak Property, deliberately placed BEFORE the closing property CTA. */
export function WordbitxSection() {
  return (
    <section id="wordbitx" className="wordbitx-section" aria-labelledby="wordbitx-heading" data-testid="wordbitx-company">
      <div className="ui-container">
        <div className="wordbitx-feature">
          <div className="min-w-0">
            <p className="eyebrow text-forest-700">Designed & engineered by</p>
            <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" aria-label="WordbitX Software Company" className="wordbitx-wordmark">Wordbit<span className="text-forest-700">X</span></a>
            <h2 id="wordbitx-heading" className="mt-5 max-w-lg font-sans text-[clamp(1.35rem,2.6vw,2rem)] font-bold leading-tight text-navy-900">The technology behind Pak Property.</h2>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-7 text-ink-muted">Pak Property is a real-estate demonstration by WordbitX Software Company. For a property marketplace, custom business software or digital solutions, talk to the team that built it.</p>
            <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-navy-800 hover:text-forest-700">Explore WordbitX <IconArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="wordbitx-contact-panel">
            <h3 className="font-sans text-lg font-semibold text-white">Let’s talk about your next project.</h3>
            <p className="mt-2 text-[0.8125rem] leading-6 text-white/65">Pakistan and international company enquiries.</p>
            <div className="mt-6"><WordbitxContacts light /></div>
            <a href={`mailto:${SITE.companyEmail}`} className="mt-5 flex min-h-11 items-center gap-2.5 text-[0.8125rem] text-white/85 hover:text-forest-400"><IconMail className="h-4 w-4 shrink-0 text-forest-400" /><span className="break-all">{SITE.companyEmail}</span></a>
            <p className="mt-2 flex items-start gap-2.5 text-[0.75rem] leading-6 text-white/55"><IconPin className="mt-1 h-4 w-4 shrink-0 text-forest-400" /><span>{SITE.companyAddress.street}, {SITE.companyAddress.city}, {SITE.companyAddress.country}</span></p>
            <p className="mt-5 border-t border-white/10 pt-4 text-[0.6875rem] leading-5 text-white/50">For a property enquiry, please use that listing’s owner or agent contact. These numbers connect you to WordbitX.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
