"use client";

import { useState } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminPropertyManager } from "@/components/admin-property-manager";
import { AdminInquiryInbox } from "@/components/admin-inquiry-inbox";

export type AdminSection = "approvals" | "properties" | "inquiries";
const SECTIONS = [
  { key: "approvals" as const, label: "Owner approvals", copy: "Review submitted listings" },
  { key: "properties" as const, label: "Manage properties", copy: "Add, edit and delete listings" },
  { key: "inquiries" as const, label: "Client enquiries", copy: "Enquiries, visits and follow-ups" },
];

export function AdminWorkspace({ initialSection = "approvals" }: { initialSection?: AdminSection }) {
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [newCount, setNewCount] = useState<number | null>(null);

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-3 md:grid-cols-3" role="tablist" aria-label="Admin sections">
        {SECTIONS.map((item) => (
          <button key={item.key} type="button" role="tab" aria-selected={section === item.key} onClick={() => {
            setSection(item.key);
            window.history.replaceState(null, "", `/admin?tab=${item.key}`);
          }} className={`min-w-0 rounded-panel border px-5 py-4 text-left transition-colors ${section === item.key ? "border-navy-800 bg-navy-800 text-white" : "border-soft bg-white text-navy-900 hover:border-navy-800"}`}>
            <span className="flex flex-wrap items-center gap-2 font-sans text-[0.9375rem] font-semibold">
              {item.label}{item.key === "inquiries" && newCount !== null && newCount > 0 && <span className="rounded-full bg-forest-600 px-2 py-0.5 text-xs text-white">{newCount} new</span>}
            </span>
            <span className={`mt-1 block text-[0.75rem] ${section === item.key ? "text-white/70" : "text-ink-muted"}`}>{item.copy}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 min-w-0">
        <h1 className="font-sans text-[1.5rem] font-bold text-navy-900">{section === "approvals" ? "Owner listings queue" : section === "properties" ? "Property manager" : "Client enquiries & visit requests"}</h1>
        <p className="mt-2 max-w-3xl text-[0.875rem] leading-7 text-ink-muted">
          {section === "approvals" ? "Approve or reject owner submissions. Approved listings retain the owner's photos, contact details and saved map pin." : section === "properties" ? "Manage published listings, photos, prices, locations and seller contacts." : "Every property enquiry and schedule-visit form is saved here. Open a request to see the client's complete details, property reference and preferred date, then record your follow-up."}
        </p>
        <div className="mt-6 min-w-0">
          {section === "approvals" ? <AdminDashboard /> : section === "properties" ? <AdminPropertyManager /> : <AdminInquiryInbox onNewCount={setNewCount} />}
        </div>
      </div>
    </div>
  );
}
