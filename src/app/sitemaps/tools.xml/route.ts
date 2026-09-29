import { renderUrlSet, xmlResponse } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

const TOOL_PATHS = [
  "/tools",
  "/tools/mortgage-calculator",
  "/tools/affordability-calculator",
  "/tools/rental-yield-calculator",
  "/tools/roi-calculator",
  "/tools/investment-calculator",
  "/tools/construction-cost-calculator",
  "/tools/property-tax-calculator",
  "/tools/rent-vs-buy-calculator",
  "/compare",
];

export async function GET() {
  return xmlResponse(
    renderUrlSet(
      TOOL_PATHS.filter((path) => path !== "/compare").map((path) => ({
        path,
        changeFrequency: "monthly" as const,
        priority: path === "/tools" ? 0.8 : 0.75,
      })),
    ),
  );
}
