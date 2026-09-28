import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminWorkspace, type AdminSection } from "@/components/admin-workspace";
import { BrandLockup } from "@/components/brand-lockup";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin — Properties & Client Enquiries",
  description: "Pak Property admin workspace for property approvals, listings and client enquiries.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { tab } = await searchParams;
  const initialSection: AdminSection = tab === "inquiries" || tab === "properties" ? tab : "approvals";
  return (
    <div className="min-h-screen bg-mist pb-16 pt-[68px] lg:pt-[76px]">
      <div className="border-b border-soft bg-navy-950">
        <div className="ui-container flex min-w-0 flex-wrap items-center justify-between gap-4 py-5">
          <BrandLockup light />
          <div className="flex items-center gap-3"><span className="rounded-md bg-white/10 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/70">Admin workspace</span><Link href="/" className="rounded-lg border border-white/20 px-3 py-2 text-[0.75rem] font-semibold text-white hover:bg-white/10">View website</Link></div>
        </div>
      </div>
      <div className="ui-container pt-8"><AdminWorkspace initialSection={initialSection} /></div>
    </div>
  );
}
