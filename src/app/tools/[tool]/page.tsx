import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowRight } from "@/components/icons";
import { Calculators, type ToolKey } from "@/components/calculators";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { LeadForm } from "@/components/lead-form";
import { formatPrice } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

type ToolConfig = {
  key: ToolKey;
  eyebrow: string;
  title: string;
  description: string;
  notes: string[];
  meta: string;
  keywords: string[];
};

const TOOL_CONFIG: Record<string, ToolConfig> = {
  "mortgage-calculator": {
    key: "mortgage",
    eyebrow: "Mortgage calculator",
    title: "Mortgage & Instalment Calculator for Pakistan",
    description:
      "Work out what a financed property purchase costs per month in Pakistan. Adjust price, down payment, rate and tenure to see the instalment, total interest and total payable.",
    notes: [
      "Down payments in Pakistan typically range from 20% to 40% depending on the lender and property type.",
      "Home finance rates move with the policy rate — model a range of rates rather than a single figure.",
      "Add processing fees, legal charges and valuation costs to your upfront budget.",
      "If you are buying off-plan, check whether the developer's instalment plan or bank finance produces the cheaper total.",
    ],
    meta: "mortgage calculator Pakistan",
    keywords: ["mortgage calculator Pakistan", "home loan instalment calculator Pakistan", "house finance calculator"],
  },
  "affordability-calculator": {
    key: "affordability",
    eyebrow: "Affordability",
    title: "Home Affordability Calculator for Pakistan",
    description:
      "Start from income and obligations to see the instalment budget you can realistically carry, then the indicative property price range that fits.",
    notes: [
      "Most advisors suggest keeping total housing outgoings within 35–40% of net monthly income.",
      "Include society charges, utilities and maintenance in your monthly carrying cost, not just the instalment.",
      "A larger down payment reduces both the instalment and the total interest paid.",
      "Keep a cash buffer of at least three months of outgoings after completing the purchase.",
    ],
    meta: "home affordability calculator Pakistan",
    keywords: ["home affordability calculator Pakistan", "how much house can I afford Pakistan"],
  },
  "rental-yield-calculator": {
    key: "yield",
    eyebrow: "Rental yield",
    title: "Rental Yield Calculator for Pakistan",
    description:
      "Compare gross and net rental yield for any property price and rent. Net yield accounts for recurring maintenance, society charges and management costs.",
    notes: [
      "Gross yield ignores expenses — always compare net yield when judging two options.",
      "Furnished and serviced units usually rent higher but carry faster replacement costs.",
      "Allow for roughly one vacant month per year on most residential units.",
      "Compare your computed yield against the indicative yields shown on our listing comparison tool.",
    ],
    meta: "rental yield calculator Pakistan",
    keywords: ["rental yield calculator Pakistan", "property yield calculator", "rental return Pakistan"],
  },
  "roi-calculator": {
    key: "roi",
    eyebrow: "ROI",
    title: "Property ROI Calculator for Pakistan",
    description:
      "Model total and annualised return on a property investment, combining net rental income, assumed capital appreciation and exit costs.",
    notes: [
      "Set appreciation to zero to see what the investment returns on rent alone.",
      "Exit costs, transfer charges and tax treatment materially change a net return.",
      "ROI assumes a single purchase and single sale — staged or partial exits produce different figures.",
      "Returns are scenario outputs, not forecasts, and nothing here is guaranteed.",
    ],
    meta: "property ROI calculator Pakistan",
    keywords: ["property ROI calculator Pakistan", "real estate return calculator", "investment return property"],
  },
  "investment-calculator": {
    key: "growth",
    eyebrow: "Investment projection",
    title: "Property Investment Projection",
    description:
      "Model a holding scenario: assumed annual appreciation, cumulative rent over the period and the combined return. Change the assumptions to test how sensitive an outcome is.",
    notes: [
      "Appreciation in Pakistan's cities has historically been uneven between societies and years.",
      "Projections are planning scenarios, not forecasts, and no return is guaranteed.",
      "Include transfer taxes, holding costs and maintenance in your own model.",
    ],
    meta: "property investment calculator Pakistan",
    keywords: ["property investment calculator Pakistan", "capital growth calculator Pakistan"],
  },
  "rent-vs-buy-calculator": {
    key: "rentvsbuy",
    eyebrow: "Rent vs buy",
    title: "Rent vs Buy Calculator for Pakistan",
    description:
      "Compare the cumulative cost of renting with the net cost of buying over the years you realistically expect to stay in the property.",
    notes: [
      "Short horizons usually favour renting once transfer taxes and exit costs are included.",
      "Rent escalation assumptions matter as much as the starting rent — model a higher case too.",
      "Buying nets off the equity you build, but that equity is illiquid in Pakistan.",
      "Test at least three horizons: your minimum, expected and maximum stay.",
    ],
    meta: "rent vs buy calculator Pakistan",
    keywords: ["rent vs buy calculator Pakistan", "is it better to rent or buy Pakistan"],
  },
  "construction-cost-calculator": {
    key: "construction",
    eyebrow: "Construction cost",
    title: "Construction Cost Calculator for Pakistan",
    description:
      "Budget a build per square foot of covered area across economy, standard, premium and luxury tiers, including contingency, consultants and approvals.",
    notes: [
      "Material prices move with the market — always add contingency to any per-square-foot estimate.",
      "Luxury tier costs can exceed three times economy tier rates for the same covered area.",
      "Add connection charges, site security and utility deposits separately.",
      "If financing the build, model interest during construction as a distinct cost.",
    ],
    meta: "construction cost calculator Pakistan",
    keywords: ["construction cost calculator Pakistan", "house construction cost per sq ft Pakistan"],
  },
  "property-tax-calculator": {
    key: "tax",
    eyebrow: "Property tax",
    title: "Property Tax & Charges Calculator",
    description:
      "Illustrative estimate of the transaction, holding and disposal charges that apply when buying, holding and selling property in Pakistan.",
    notes: [
      "Tax rules change with each Finance Act — verify current rates with FBR or a provincial authority.",
      "Treatment depends on filer status, holding period and the nature of the transaction.",
      "Society transfer fees and maintenance levies sit outside federal tax and vary by developer.",
      "This calculator is a planning aid only and is not tax advice.",
    ],
    meta: "property tax calculator Pakistan",
    keywords: ["property tax calculator Pakistan", "FBR property tax", "capital gains tax property Pakistan"],
  },
};

type PageProps = { params: Promise<{ tool: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TOOL_CONFIG).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  const config = TOOL_CONFIG[tool];
  if (!config) {
    return buildMetadata({
      title: "Tool not found",
      description: "This calculator is not available on Pak Property.",
      path: "/tools",
    });
  }
  return buildMetadata({
    title: `${config.title} | Pak Property`,
    description: config.description,
    path: `/tools/${tool}`,
    keywords: config.keywords,
  });
}

export default async function ToolPage({ params }: PageProps) {
  const { tool } = await params;
  const config = TOOL_CONFIG[tool];
  if (!config) notFound();

  const others = Object.entries(TOOL_CONFIG).filter(([slug]) => slug !== tool);

  return (
    <>
      <PageHero
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: config.eyebrow, href: `/tools/${tool}` },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          <Calculators key={config.key} initialTool={config.key} defaultPrice={25_000_000} />
        </div>
      </Section>

      <Section tone="mist">
        <div className="ui-container grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading eyebrow="Assumptions" title="What to keep in mind" />
            <ul className="mt-6 space-y-4">
              {config.notes.map((note) => (
                <li key={note} className="flex gap-3 border-b border-soft pb-4 text-[0.9375rem] leading-relaxed text-ink">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" />
                  {note}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/properties" className="btn btn-primary">
                Browse listings <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/property-investment-in-pakistan" className="btn btn-outline">
                Investment guide
              </Link>
              <Link href="/compare" className="btn btn-outline">
                Compare properties
              </Link>
            </div>

            <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-muted">
              Example: {formatPrice(25_000_000)} at a 30% down payment over 15 years is modelled above as a starting point.
              Adjust every input for your own case. All tools are estimates for planning and are not financial advice.
            </p>

            <div className="mt-9">
              <h2 className="font-sans text-[1.05rem] font-semibold text-navy-900">Other Pak Property tools</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {others.map(([slug, item]) => (
                  <Link key={slug} href={`/tools/${slug}`} className="chip">
                    {item.eyebrow}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <LeadForm
            variant="contact"
            heading="Want a second opinion on the numbers?"
            description="Share the property and your assumptions — our advisory desk will review the figures and highlight risks you may have missed."
            source={`tool-${tool}`}
          />
        </div>
      </Section>

      <Section tone="light">
        <div className="ui-container">
          <SectionHeading
            eyebrow="Related reading"
            title="Guides that pair with this tool"
            description="Calculation only gets you so far — documentation, area choice and carrying cost decide the outcome."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { label: "Real estate investment in Pakistan", href: "/property-investment-in-pakistan" },
              { label: "Property documentation checklist", href: "/blog/property-documentation-checklist-pakistan" },
              { label: "Real estate investment mistakes", href: "/blog/real-estate-investment-mistakes-pakistan" },
              { label: "FBR property tax overview", href: "/blog/fbr-property-tax-guide-pakistan" },
              { label: "Rent vs buy in Pakistan", href: "/blog/rent-vs-buy-in-pakistan" },
              { label: "Construction cost guide", href: "/blog/construction-cost-guide-pakistan" },
              { label: "Property for sale in Lahore", href: "/property-for-sale-in-lahore" },
              { label: "Property for sale in Islamabad", href: "/property-for-sale-in-islamabad" },
              { label: "Property for sale in Karachi", href: "/property-for-sale-in-karachi" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="chip">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
