import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArea as IconAreaIcon,
  IconArrowRight,
  IconBuilding,
  IconCalculator,
  IconChart,
  IconCompass,
  IconKey,
  IconLayers,
  IconSpark,
} from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { Calculators } from "@/components/calculators";
import { Section, SectionHeading } from "@/components/section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Property Investment Tools & Calculators for Pakistan",
  description:
    "Mortgage, rental yield, investment projection and affordability calculators built for Pakistan's property market. Estimate instalments, yields and price ranges before you commit.",
  path: "/tools",
  keywords: [
    "mortgage calculator Pakistan",
    "rental yield calculator Pakistan",
    "property investment calculator",
    "home affordability calculator",
  ],
});

const TOOLS = [
  {
    href: "/tools/mortgage-calculator",
    title: "Mortgage Calculator",
    copy: "Estimate the monthly instalment, total interest and total payable for a financed purchase.",
    icon: IconCalculator,
  },
  {
    href: "/tools/affordability-calculator",
    title: "Affordability Calculator",
    copy: "Work out the price range that fits a realistic monthly budget including existing obligations.",
    icon: IconCompass,
  },
  {
    href: "/tools/rental-yield-calculator",
    title: "Rental Yield Calculator",
    copy: "Compare gross and net yield against expenses to see what a rental property actually returns.",
    icon: IconChart,
  },
  {
    href: "/tools/roi-calculator",
    title: "ROI Calculator",
    copy: "Total and annualised return combining net rent, capital gain and exit costs.",
    icon: IconSpark,
  },
  {
    href: "/tools/investment-calculator",
    title: "Investment Projection",
    copy: "Model appreciation and cumulative rent across a holding period as a planning scenario.",
    icon: IconLayers,
  },
  {
    href: "/tools/rent-vs-buy-calculator",
    title: "Rent vs Buy Calculator",
    copy: "Compare cumulative rent against the net cost of buying over the years you expect to stay.",
    icon: IconKey,
  },
  {
    href: "/tools/construction-cost-calculator",
    title: "Construction Cost Calculator",
    copy: "Budget a build per square foot across economy to luxury tiers, with contingency and consultants.",
    icon: IconBuilding,
  },
  {
    href: "/tools/property-tax-calculator",
    title: "Property Tax Calculator",
    copy: "Illustrative transaction, holding and disposal charges to include in your total cost of ownership.",
    icon: IconAreaIcon,
  },
];

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Smart tools"
        title="Make Smarter Property Decisions"
        description="Understand the numbers before you make the move. Every tool uses standard formulas and clearly stated assumptions — no guarantees, no hidden fees."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex h-full flex-col rounded-panel border border-soft bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-navy-100 hover:shadow-card"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-4 font-sans text-[1rem] font-semibold text-navy-900">{tool.title}</span>
                  <span className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-muted">{tool.copy}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700">
                    Open tool <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container">
          <SectionHeading
            eyebrow="All in one place"
            title="Compare every scenario in one session"
            description="Switch between the four tools below — inputs stay consistent so you can compare a purchase, a rental and a financed option side by side."
          />
          <div className="mt-9">
            <Calculators />
          </div>
        </div>
      </Section>
    </>
  );
}
