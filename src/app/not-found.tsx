import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { SearchPanel } from "@/components/search-panel";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 pb-24 pt-32 lg:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(700px 400px at 12% 0%, rgba(22,179,100,0.22), transparent 62%), radial-gradient(600px 380px at 88% 20%, rgba(19,80,127,0.5), transparent 60%)",
        }}
      />
      <div className="ui-container relative z-10">
        <p className="eyebrow text-forest-400">
          <span className="h-[1px] w-6 bg-current opacity-70" />
          Error 404
        </p>
        <h1 className="display-2 mt-4 max-w-2xl text-white">
          This page has moved, or the listing is no longer available.
        </h1>
        <p className="lede mt-4 max-w-xl text-white/70">
          Properties move quickly in Pakistan&rsquo;s market. Search the sample inventory again, or browse by city to see what is
          available right now.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/properties" className="btn btn-green">
            Browse all properties <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn btn-ghost-light">
            Talk to an advisor
          </Link>
        </div>
        <div className="mt-14">
          <SearchPanel />
        </div>
      </div>
    </section>
  );
}
