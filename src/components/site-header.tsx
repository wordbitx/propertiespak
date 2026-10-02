"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/brand-lockup";
import { beginRecentSearch } from "@/lib/recent-properties";
import { NavigationDialog } from "@/components/navigation-dialog";
import { PropertySearchFilters } from "@/components/property-search-filters";
import { HeaderPropertyMap } from "@/components/header-property-map";
import { defaultPropertySearch, propertySearchFromParams, propertySearchHref, type PropertySearchState } from "@/lib/property-search";
import { IconArrowRight, IconChevronDown, IconClose, IconHeart, IconMenu, IconSearch, IconUser, IconMap } from "@/components/icons";
import { useFavorites } from "@/components/favorites-provider";
import { useLanguage } from "@/components/language-provider";
import { NAV_LINKS, SITE } from "@/lib/constants";

const CITY_LINKS = ["Lahore", "Islamabad", "Karachi", "Rawalpindi", "Faisalabad", "Multan"];
const PROPERTY_LINKS = [
  { label: "All properties", href: "/properties" },
  { label: "Houses for sale", href: "/properties/for-sale?category=house" },
  { label: "Apartments for rent", href: "/properties/for-rent?type=Apartment" },
  { label: "Plots & files", href: "/properties?category=plot" },
  { label: "Offices & retail", href: "/properties/commercial" },
  { label: "Farmhouses", href: "/properties?category=farmhouse" },
];
/**
 * Dealers deliberately stay out of the header: the verified-dealer belt on the
 * homepage and the footer are the only entry points, so the nav never repeats
 * a section that already sits one scroll below the hero.
 */
const HEADER_HIDDEN_LABELS = ["Home", "Insights", "Dealers", "Contact"];
const DESKTOP_LINKS = NAV_LINKS.filter((link) => !HEADER_HIDDEN_LABELS.includes(link.label));
const MOBILE_LINKS = [
  NAV_LINKS[0],
  { label: "All properties", href: "/properties" },
  ...NAV_LINKS.slice(1).filter((link) => !HEADER_HIDDEN_LABELS.includes(link.label)),
  { label: "Help & Support", href: "/contact" },
  { label: "Advertise on Properties Pak", href: "/advertise" },
];

type Panel = "menu" | "search" | "map" | null;

function LanguageSwitch({ mobile = false }: { mobile?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  if (mobile) {
    const targetLocale = locale === "en" ? "ur" : "en";
    return (
      <button
        type="button"
        data-testid="header-language-mobile"
        className="header-action header-language-mobile"
        aria-label={t(locale === "en" ? "Switch to Urdu" : "Switch to English")}
        title={t(locale === "en" ? "Switch to Urdu" : "Switch to English")}
        onClick={() => setLocale(targetLocale)}
      >
        <span className="header-language-value" lang={targetLocale}>{targetLocale === "ur" ? "اردو" : "EN"}</span>
      </button>
    );
  }
  return (
    <div className="header-language-switch" role="group" aria-label={t("Choose language")}>
      <button type="button" lang="en" aria-label="English" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
      <button type="button" lang="ur" aria-label="اردو" aria-pressed={locale === "ur"} onClick={() => setLocale("ur")}>اردو</button>
    </div>
  );
}

export function SiteHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [panelPath, setPanelPath] = useState(pathname);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchDefaults, setSearchDefaults] = useState<PropertySearchState>(() => defaultPropertySearch());
  const [mapQuery, setMapQuery] = useState("");
  const megaRef = useRef<HTMLDivElement | null>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  const { count } = useFavorites();
  const solid = scrolled || pathname.startsWith("/admin");
  const accountHref = isAuthenticated ? "/account" : "/login";
  const dismiss = useCallback(() => setPanel(null), []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 36);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Reset route-bound navigation before committing the next page, rather
  // than mounting an old dialog and then removing it in a cascading effect.
  if (panelPath !== pathname) {
    setPanelPath(pathname);
    setPanel(null);
    setMegaOpen(false);
  }

  useEffect(() => {
    if (!megaOpen) return;
    const outside = (event: PointerEvent) => {
      if (!megaRef.current?.contains(event.target as Node)) setMegaOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [megaOpen]);

  function openPanel(next: Exclude<Panel, null>, trigger?: HTMLElement) {
    if (trigger) dialogTriggerRef.current = trigger;
    setMegaOpen(false);
    const params = new URLSearchParams(window.location.search);
    if (pathname.includes("/for-rent")) params.set("purpose", "rent");
    else if (pathname.includes("/for-sale")) params.set("purpose", "buy");
    if (pathname.includes("/properties/commercial")) params.set("category", "commercial");
    if (pathname.includes("/properties/new-projects")) params.set("newProjects", "1");
    if (next === "search") {
      setSearchDefaults(propertySearchFromParams(params, pathname.includes("/for-rent") ? "rent" : "buy"));
    } else if (next === "map") {
      setMapQuery(params.toString());
    }
    setPanel(next);
  }

  function search(state: PropertySearchState) {
    dismiss();
    const href = propertySearchHref(state);
    beginRecentSearch(href);
    router.push(href);
  }

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy-900">Skip to content</a>
      <header
        data-testid="site-header"
        data-surface={solid ? "solid" : "overlay"}
        className={`site-header ${solid ? "site-header--solid" : "site-header--overlay"}`}
      >
        <div className="header-utility-bar">
          <div className="ui-container">
            <Link href="/contact">{t("Help & Support")}</Link>
            <span className="header-utility-separator" aria-hidden="true">|</span>
            <Link href="/advertise">{t("Advertise on Properties Pak")}</Link>
            <span className="header-utility-separator" aria-hidden="true">|</span>
            <LanguageSwitch />
          </div>
        </div>
        <div className="ui-container header-inner">
          <Link href="/" className="header-brand" aria-label={`${SITE.name} — ${SITE.tagline}`}><BrandLockup adaptive compact /></Link>

          <nav className="header-desktop-nav" aria-label="Primary">
            <Link href="/" data-active={pathname === "/"} className="nav-link">{t("Home")}</Link>
            <div ref={megaRef} className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
              <button type="button" aria-expanded={megaOpen} aria-controls="property-shortcuts" onClick={() => setMegaOpen(true)} className="nav-link inline-flex min-h-11 items-center gap-1">
                {t("Properties")} <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>
              {megaOpen && (
                <div id="property-shortcuts" className="absolute left-1/2 top-full w-[700px] -translate-x-1/2 pt-3">
                  <div className="grid grid-cols-3 gap-6 rounded-xl border border-soft bg-white p-6 text-navy-900 shadow-panel">
                    <div><p className="eyebrow text-forest-700">{t("Discover")}</p><ul className="mt-3 space-y-1">{PROPERTY_LINKS.map((link) => <li key={link.href}><Link href={link.href} onClick={() => setMegaOpen(false)} className="block rounded py-2 text-[0.8125rem] font-medium hover:text-forest-700">{t(link.label)}</Link></li>)}</ul></div>
                    <div className="border-l border-soft pl-5"><p className="eyebrow text-forest-700">{t("By city")}</p><ul className="mt-3 space-y-1">{CITY_LINKS.map((city) => <li key={city}><Link href={`/city/${city.toLowerCase()}`} onClick={() => setMegaOpen(false)} className="block py-2 text-[0.8125rem] font-medium hover:text-forest-700">{city}</Link></li>)}</ul></div>
                    <div className="border-l border-soft pl-5"><p className="eyebrow text-forest-700">{t("Plan your move")}</p><ul className="mt-3 space-y-2">
                      {[{ label: "Compare properties", href: "/compare" }, { label: "Investment tools", href: "/tools" }, { label: "Property guides", href: "/blog" }, { label: "Pakistan investment guide", href: "/property-investment-in-pakistan" }, { label: "Property search topics", href: "/keywords-for-pakistan" }].map((link) => <li key={link.href}><Link href={link.href} onClick={() => setMegaOpen(false)} className="block py-2 text-[0.8125rem] font-medium hover:text-forest-700">{t(link.label)}</Link></li>)}
                    </ul></div>
                  </div>
                </div>
              )}
            </div>
            {DESKTOP_LINKS.map((link) => <Link key={link.href} href={link.href} data-active={pathname === link.href || pathname.startsWith(`${link.href}/`)} className="nav-link">{t(link.label)}</Link>)}
          </nav>

          <div className="header-actions">
            <button type="button" data-testid="header-map" onClick={(event) => openPanel("map", event.currentTarget)} aria-label={t("Open property map")} aria-haspopup="dialog" className="header-action header-map-action"><IconMap className="h-5 w-5" /></button>
            <button type="button" onClick={(event) => openPanel("search", event.currentTarget)} aria-label={t("Search properties")} aria-haspopup="dialog" className="header-action header-search-action"><IconSearch className="h-5 w-5" /></button>
            <Link href="/favorites" data-testid="header-saved" aria-label={`${t("Saved properties")}${count ? `, ${count} ${t("saved")}` : ""}`} className="header-action header-saved-action">
              <IconHeart className="h-5 w-5" />
              <span className="header-action-caption">{t("Saved")}</span>
              {count > 0 && <span className="header-saved-count">{count > 99 ? "99+" : count}</span>}
            </Link>
            <LanguageSwitch mobile />
            <Link href={accountHref} className="header-account"><IconUser className="h-[18px] w-[18px]" />{t(isAuthenticated ? "Account" : "Login")}</Link>
            <Link href="/list-property" data-testid="header-sell-property" aria-label={t("Sell a property")} title={t("Sell a property")} className="header-list-property">
              <span className="header-list-property-flag" aria-hidden="true">SELL</span>
              {t("List Property")}
            </Link>
            <button type="button" data-testid="header-menu" onClick={(event) => openPanel("menu", event.currentTarget)} aria-label={t("Open menu")} aria-haspopup="dialog" aria-expanded={panel === "menu"} className="header-action header-menu-action"><IconMenu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {panel === "menu" && (
        <NavigationDialog key="menu" label={t("Main menu")} onDismiss={dismiss} triggerRef={dialogTriggerRef}>
          <div className="navigation-drawer">
            <div className="navigation-panel-heading">
              <Link href="/" onClick={dismiss} aria-label="Properties Pak home"><BrandLockup compact /></Link>
              <button type="button" data-dialog-initial onClick={dismiss} aria-label={t("Close menu")} className="dialog-close"><IconClose className="h-5 w-5" /></button>
            </div>
            <div className="navigation-drawer-scroll">
              <button type="button" onClick={() => openPanel("search")} className="menu-search-shortcut"><IconSearch className="h-[18px] w-[18px] text-forest-700" /><span>{t("Search city, society or property")}</span><IconArrowRight className="ml-auto h-4 w-4" /></button>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/favorites" onClick={dismiss} className="menu-shortcut"><IconHeart className="h-4 w-4" />{t("Saved")}{count > 0 && <span className="ml-auto rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-700">{count}</span>}</Link>
                <Link href="/compare" onClick={dismiss} className="menu-shortcut">{t("Compare properties")} <IconArrowRight className="ml-auto h-4 w-4" /></Link>
              </div>
              <nav aria-label="Mobile navigation" className="mt-5">
                {MOBILE_LINKS.map((link) => <Link key={`${link.label}-${link.href}`} href={link.href} onClick={dismiss} aria-current={pathname === link.href ? "page" : undefined} className="mobile-nav-link"><span>{t(link.label)}</span><IconArrowRight className="h-4 w-4 text-forest-700" /></Link>)}
              </nav>
              <div className="mt-6">
                <p className="eyebrow text-ink-muted">{t("Explore cities")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">{CITY_LINKS.map((city) => <Link key={city} href={`/city/${city.toLowerCase()}`} onClick={dismiss} className="menu-city-link">{city}</Link>)}</div>
              </div>
              <Link href="/tools" onClick={dismiss} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-700">{t("Open investment tools")} <IconArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="navigation-drawer-footer">
              <Link href="/list-property" onClick={dismiss} className="btn btn-primary min-h-12 w-full">{t("List Your Property")} <IconArrowRight className="h-4 w-4" /></Link>
              <Link href={accountHref} onClick={dismiss} className="mt-2 flex min-h-11 items-center justify-center gap-2 text-[0.875rem] font-semibold text-navy-900"><IconUser className="h-4 w-4" />{t(isAuthenticated ? "My account" : "Login / Register")}</Link>
            </div>
          </div>
        </NavigationDialog>
      )}

      {panel === "search" && (
        <NavigationDialog key="search" label={t("Search properties")} className="property-filter-dialog" onDismiss={dismiss} triggerRef={dialogTriggerRef}>
          <PropertySearchFilters initialState={searchDefaults} onClose={dismiss} onSearch={search} />
        </NavigationDialog>
      )}
      {panel === "map" && (
        <NavigationDialog key="map" label={t("Property map")} className="property-map-dialog" onDismiss={dismiss} triggerRef={dialogTriggerRef}>
          <HeaderPropertyMap initialQuery={mapQuery} onClose={dismiss} onFilters={(query) => {
            setSearchDefaults(propertySearchFromParams(new URLSearchParams(query)));
            setPanel("search");
          }} />
        </NavigationDialog>
      )}
    </>
  );
}
