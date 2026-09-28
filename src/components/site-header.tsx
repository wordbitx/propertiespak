"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/brand-lockup";
import { NavigationDialog } from "@/components/navigation-dialog";
import { IconArrowRight, IconChevronDown, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from "@/components/icons";
import { useFavorites } from "@/components/favorites-provider";
import { NAV_LINKS, POPULAR_SEARCHES, SITE } from "@/lib/constants";

const CITY_LINKS = ["Lahore", "Islamabad", "Karachi", "Rawalpindi", "Faisalabad", "Multan"];
const PROPERTY_LINKS = [
  { label: "All properties", href: "/properties" },
  { label: "Houses for sale", href: "/properties/for-sale?category=house" },
  { label: "Apartments for rent", href: "/properties/for-rent?type=Apartment" },
  { label: "Plots & files", href: "/properties?category=plot" },
  { label: "Offices & retail", href: "/properties/commercial" },
  { label: "Farmhouses", href: "/properties?category=farmhouse" },
];
const DESKTOP_LINKS = NAV_LINKS.filter((link) => !["Home", "Insights"].includes(link.label));
const MOBILE_LINKS = [NAV_LINKS[0], { label: "All properties", href: "/properties" }, ...NAV_LINKS.slice(1)];

type Panel = "menu" | "search" | null;

export function SiteHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const megaRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    setPanel(null);
    setMegaOpen(false);
  }, [pathname]);

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

  function openPanel(next: Exclude<Panel, null>) {
    setMegaOpen(false);
    setPanel(next);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    dismiss();
    router.push(value ? `/properties?q=${encodeURIComponent(value)}` : "/properties");
  }

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy-900">Skip to content</a>
      <header
        data-testid="site-header"
        data-surface={solid ? "solid" : "overlay"}
        className={`site-header ${solid ? "site-header--solid" : "site-header--overlay"}`}
      >
        <div className="ui-container header-inner">
          <Link href="/" className="header-brand" aria-label={`${SITE.name} — ${SITE.tagline}`}><BrandLockup light={!solid} compact /></Link>

          <nav className="header-desktop-nav" aria-label="Primary">
            <Link href="/" data-active={pathname === "/"} className="nav-link">Home</Link>
            <div ref={megaRef} className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
              <button type="button" aria-expanded={megaOpen} aria-controls="property-shortcuts" onClick={() => setMegaOpen(true)} className="nav-link inline-flex min-h-11 items-center gap-1">
                Properties <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>
              {megaOpen && (
                <div id="property-shortcuts" className="absolute left-1/2 top-full w-[700px] -translate-x-1/2 pt-3">
                  <div className="grid grid-cols-3 gap-6 rounded-xl border border-soft bg-white p-6 text-navy-900 shadow-panel">
                    <div><p className="eyebrow text-forest-700">Discover</p><ul className="mt-3 space-y-1">{PROPERTY_LINKS.map((link) => <li key={link.href}><Link href={link.href} onClick={() => setMegaOpen(false)} className="block rounded py-2 text-[0.8125rem] font-medium hover:text-forest-700">{link.label}</Link></li>)}</ul></div>
                    <div className="border-l border-soft pl-5"><p className="eyebrow text-forest-700">By city</p><ul className="mt-3 space-y-1">{CITY_LINKS.map((city) => <li key={city}><Link href={`/city/${city.toLowerCase()}`} onClick={() => setMegaOpen(false)} className="block py-2 text-[0.8125rem] font-medium hover:text-forest-700">{city}</Link></li>)}</ul></div>
                    <div className="border-l border-soft pl-5"><p className="eyebrow text-forest-700">Plan your move</p><ul className="mt-3 space-y-2">
                      {[{ label: "Compare properties", href: "/compare" }, { label: "Investment tools", href: "/tools" }, { label: "Property guides", href: "/blog" }, { label: "Pakistan investment guide", href: "/property-investment-in-pakistan" }, { label: "Property search topics", href: "/keywords-for-pakistan" }].map((link) => <li key={link.href}><Link href={link.href} onClick={() => setMegaOpen(false)} className="block py-2 text-[0.8125rem] font-medium hover:text-forest-700">{link.label}</Link></li>)}
                    </ul></div>
                  </div>
                </div>
              )}
            </div>
            {DESKTOP_LINKS.map((link) => <Link key={link.href} href={link.href} data-active={pathname === link.href || pathname.startsWith(`${link.href}/`)} className="nav-link">{link.label}</Link>)}
          </nav>

          <div className="header-actions">
            <button type="button" onClick={() => openPanel("search")} aria-label="Search properties" aria-haspopup="dialog" className="header-action header-search-action"><IconSearch className="h-5 w-5" /></button>
            <Link href="/favorites" data-testid="header-saved" aria-label={`Saved properties${count ? `, ${count} saved` : ""}`} className="header-action header-saved-action">
              <IconHeart className="h-5 w-5" />
              <span className="header-action-caption">Saved</span>
              {count > 0 && <span className="header-saved-count">{count > 99 ? "99+" : count}</span>}
            </Link>
            <Link href={accountHref} className="header-account"><IconUser className="h-[18px] w-[18px]" />{isAuthenticated ? "Account" : "Login"}</Link>
            <Link href="/list-property" className="header-list-property">List Your Property</Link>
            <button type="button" data-testid="header-menu" onClick={() => openPanel("menu")} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={panel === "menu"} className="header-action header-menu-action"><IconMenu className="h-5 w-5" /><span className="header-action-caption">Menu</span></button>
          </div>
        </div>
      </header>

      {panel === "menu" && (
        <NavigationDialog key="menu" label="Main menu" onDismiss={dismiss}>
          <div className="navigation-drawer">
            <div className="navigation-panel-heading">
              <Link href="/" onClick={dismiss} aria-label="Pak Property home"><BrandLockup compact /></Link>
              <button type="button" data-dialog-initial onClick={dismiss} aria-label="Close menu" className="dialog-close"><IconClose className="h-5 w-5" /></button>
            </div>
            <div className="navigation-drawer-scroll">
              <button type="button" onClick={() => openPanel("search")} className="menu-search-shortcut"><IconSearch className="h-[18px] w-[18px] text-forest-700" /><span>Search city, society or property</span><IconArrowRight className="ml-auto h-4 w-4" /></button>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/favorites" onClick={dismiss} className="menu-shortcut"><IconHeart className="h-4 w-4" />Saved{count > 0 && <span className="ml-auto rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-700">{count}</span>}</Link>
                <Link href="/compare" onClick={dismiss} className="menu-shortcut">Compare properties <IconArrowRight className="ml-auto h-4 w-4" /></Link>
              </div>
              <nav aria-label="Mobile navigation" className="mt-5">
                {MOBILE_LINKS.map((link) => <Link key={`${link.label}-${link.href}`} href={link.href} onClick={dismiss} aria-current={pathname === link.href ? "page" : undefined} className="mobile-nav-link"><span>{link.label}</span><IconArrowRight className="h-4 w-4 text-forest-700" /></Link>)}
              </nav>
              <div className="mt-6">
                <p className="eyebrow text-ink-muted">Explore cities</p>
                <div className="mt-3 grid grid-cols-2 gap-2">{CITY_LINKS.map((city) => <Link key={city} href={`/city/${city.toLowerCase()}`} onClick={dismiss} className="menu-city-link">{city}</Link>)}</div>
              </div>
              <Link href="/tools" onClick={dismiss} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-700">Open investment tools <IconArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="navigation-drawer-footer">
              <Link href="/list-property" onClick={dismiss} className="btn btn-primary min-h-12 w-full">List Your Property <IconArrowRight className="h-4 w-4" /></Link>
              <Link href={accountHref} onClick={dismiss} className="mt-2 flex min-h-11 items-center justify-center gap-2 text-[0.875rem] font-semibold text-navy-900"><IconUser className="h-4 w-4" />{isAuthenticated ? "My account" : "Login / Register"}</Link>
            </div>
          </div>
        </NavigationDialog>
      )}

      {panel === "search" && (
        <NavigationDialog key="search" label="Search properties" onDismiss={dismiss}>
          <div className="navigation-search-panel">
            <div className="navigation-panel-heading">
              <div><p className="eyebrow text-forest-700">Pak Property</p><h2 className="mt-1.5 font-sans text-xl font-bold text-navy-900">Find your next property</h2></div>
              <button type="button" onClick={dismiss} aria-label="Close search" className="dialog-close"><IconClose className="h-5 w-5" /></button>
            </div>
            <div className="navigation-search-scroll">
              <form onSubmit={submit} className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" aria-label="Quick property search">
                <div className="min-w-0"><label htmlFor="header-search" className="sr-only">Search location, society or property type</label><input id="header-search" data-dialog-initial type="search" enterKeyHint="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lahore, DHA, apartment…" className="field min-h-12" autoComplete="off" /></div>
                <button type="submit" className="btn btn-primary min-h-12"><IconSearch className="h-4 w-4" />Search properties</button>
              </form>
              <p className="eyebrow mt-6 text-ink-muted">Popular searches</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{POPULAR_SEARCHES.map((search) => <Link key={search.href} href={search.href} onClick={dismiss} className="search-suggestion-link"><span>{search.label}</span><IconArrowRight className="h-4 w-4 shrink-0 text-forest-700" /></Link>)}</div>
              <Link href="/properties" onClick={dismiss} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-700">Browse all properties <IconArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </NavigationDialog>
      )}
    </>
  );
}
