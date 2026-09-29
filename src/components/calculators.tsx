"use client";

import { useMemo, useState } from "react";
import {
  IconCalculator,
  IconChart,
  IconCompass,
  IconLayers,
  IconBuilding,
  IconKey,
  IconSpark,
  IconArea,
} from "@/components/icons";
import { formatPrice, monthlyInstalment } from "@/lib/format";

export type ToolKey =
  | "mortgage"
  | "yield"
  | "growth"
  | "affordability"
  | "roi"
  | "construction"
  | "tax"
  | "rentvsbuy";

export const TOOL_DEFINITIONS: {
  key: ToolKey;
  label: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "mortgage", label: "Mortgage", blurb: "Estimate the monthly instalment on a financed purchase.", icon: IconCalculator },
  { key: "yield", label: "Rental yield", blurb: "See gross and net yield before you buy to let.", icon: IconChart },
  { key: "affordability", label: "Affordability", blurb: "Work out the price range that fits your monthly budget.", icon: IconCompass },
  { key: "rentvsbuy", label: "Rent vs buy", blurb: "Compare the cost of renting against buying over time.", icon: IconKey },
  { key: "roi", label: "ROI", blurb: "Total and annualised return including rent and appreciation.", icon: IconSpark },
  { key: "growth", label: "Investment projection", blurb: "Model appreciation and cumulative rent over a holding period.", icon: IconLayers },
  { key: "construction", label: "Construction cost", blurb: "Budget a build by covered area and construction tier.", icon: IconBuilding },
  { key: "tax", label: "Property tax", blurb: "Illustrative transaction, holding and disposal charges.", icon: IconArea },
];

const currency = (value: number) => `PKR ${Math.round(value).toLocaleString("en-PK")}`;
const pct = (value: number) => `${value.toFixed(2)}%`;

const CONSTRUCTION_TIERS = [
  { label: "Economy", rate: 4200, note: "Standard blockwork, basic finishes" },
  { label: "Standard", rate: 6200, note: "Good quality tiles, joinery and fittings" },
  { label: "Premium", rate: 9500, note: "Imported finishes, custom joinery, smart wiring" },
  { label: "Luxury", rate: 14000, note: "Marble, architectural elevations, full home automation" },
];

function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-semibold text-navy-900">
          {label}
        </label>
        {hint && <span className="text-[0.75rem] text-ink-muted">{hint}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="field"
        />
        {suffix && <span className="shrink-0 text-[0.8125rem] font-medium text-ink-muted">{suffix}</span>}
      </div>
      {typeof max === "number" && (
        <input
          type="range"
          aria-hidden="true"
          tabIndex={-1}
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-soft accent-forest-600"
        />
      )}
    </div>
  );
}

function Result({
  items,
  emphasis,
  note,
}: {
  items: { label: string; value: string }[];
  emphasis: { label: string; value: string };
  note?: string;
}) {
  return (
    <div className="rounded-panel bg-navy-950 p-6 text-white">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-forest-400">{emphasis.label}</p>
      <p className="mt-2 font-sans text-[clamp(1.55rem,3vw,2.1rem)] font-bold leading-none tracking-[-0.03em]">
        {emphasis.value}
      </p>
      <dl className="mt-6 space-y-3 border-t border-white/12 pt-5 text-[0.875rem]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <dt className="text-white/65">{item.label}</dt>
            <dd className="font-semibold text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-[0.75rem] leading-relaxed text-white/45">
        {note ??
          "Illustrative estimate for planning only. Bank rates, taxes and fees vary — confirm terms with your lender or advisor."}
      </p>
    </div>
  );
}

export function Calculators({
  defaultPrice = 25000000,
  initialTool = "mortgage",
  defaultRent = 180000,
}: {
  defaultPrice?: number;
  initialTool?: ToolKey;
  defaultRent?: number;
}) {
  const [tool, setTool] = useState<ToolKey>(initialTool);

  const [price, setPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(19);
  const [years, setYears] = useState(15);

  const [rent, setRent] = useState(defaultRent);
  const [expenses, setExpenses] = useState(60000);
  const [rentGrowth, setRentGrowth] = useState(8);

  const [appreciation, setAppreciation] = useState(9);
  const [holdYears, setHoldYears] = useState(5);
  const [exitCosts, setExitCosts] = useState(3);

  const [income, setIncome] = useState(450000);
  const [obligations, setObligations] = useState(50000);
  const [downPayment, setDownPayment] = useState(8000000);

  const [coveredArea, setCoveredArea] = useState(2400);
  const [tier, setTier] = useState(CONSTRUCTION_TIERS[1].rate);
  const [contingency, setContingency] = useState(12);
  const [plotCost, setPlotCost] = useState(12000000);

  const [purchaseTax, setPurchaseTax] = useState(4.5);
  const [annualHolding, setAnnualHolding] = useState(60000);
  const [cgtApplied, setCgtApplied] = useState(true);
  const [saleValue, setSaleValue] = useState(defaultPrice);

  const mortgage = useMemo(() => {
    const loan = Math.max(0, price - (price * downPct) / 100);
    const monthly = monthlyInstalment(loan, rate, years);
    const total = monthly * years * 12;
    return { loan, monthly, totalInterest: Math.max(0, total - loan), total };
  }, [price, downPct, rate, years]);

  const yieldResult = useMemo(() => {
    const annualRent = rent * 12;
    const gross = price > 0 ? (annualRent / price) * 100 : 0;
    const net = price > 0 ? ((annualRent - expenses * 12) / price) * 100 : 0;
    return { annualRent, gross, net, payback: net > 0 ? 100 / net : 0 };
  }, [price, rent, expenses]);

  const growth = useMemo(() => {
    const value = price * Math.pow(1 + appreciation / 100, holdYears);
    const cumulativeRent = rent * 12 * holdYears;
    const gain = value - price;
    return { value, cumulativeRent, gain, totalReturn: price > 0 ? ((gain + cumulativeRent) / price) * 100 : 0 };
  }, [price, appreciation, holdYears, rent]);

  const affordability = useMemo(() => {
    const available = Math.max(0, income * 0.4 - obligations);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const loan = monthlyRate > 0 ? (available * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate : available * months;
    return { available, loan, maxPrice: loan + downPayment };
  }, [income, obligations, rate, years, downPayment]);

  const roi = useMemo(() => {
    const annualRent = rent * 12;
    const value = price * Math.pow(1 + appreciation / 100, holdYears);
    const exitValue = value * (1 - exitCosts / 100);
    const capitalGain = exitValue - price;
    const netRent = Math.max(0, annualRent - expenses * 12) * holdYears;
    const totalProfit = capitalGain + netRent;
    const totalReturnPct = price > 0 ? (totalProfit / price) * 100 : 0;
    return {
      exitValue,
      capitalGain,
      netRent,
      totalProfit,
      totalReturnPct,
      annualised: holdYears > 0 ? (Math.pow(1 + totalReturnPct / 100, 1 / holdYears) - 1) * 100 : 0,
    };
  }, [price, rent, expenses, appreciation, holdYears, exitCosts]);

  const construction = useMemo(() => {
    const base = coveredArea * tier;
    const contingencyAmount = (base * contingency) / 100;
    const consultants = base * 0.04;
    const approvals = base * 0.02;
    const total = base + contingencyAmount + consultants + approvals;
    return {
      base,
      contingencyAmount,
      consultants,
      approvals,
      total,
      withPlot: total + plotCost,
      perSqft: coveredArea > 0 ? total / coveredArea : 0,
    };
  }, [coveredArea, tier, contingency, plotCost]);

  const tax = useMemo(() => {
    const purchase = (price * purchaseTax) / 100;
    const societyTransfer = price * 0.01;
    const holding = annualHolding * holdYears;
    const gain = Math.max(0, saleValue - price);
    const cgt = cgtApplied ? gain * 0.15 : 0;
    const totalCost = purchase + societyTransfer + holding + cgt;
    return { purchase, societyTransfer, holding, gain, cgt, totalCost };
  }, [price, purchaseTax, annualHolding, holdYears, saleValue, cgtApplied]);

  const rentVsBuy = useMemo(() => {
    let rentTotal = 0;
    let currentRent = rent;
    for (let year = 0; year < holdYears; year += 1) {
      rentTotal += currentRent * 12;
      currentRent *= 1 + rentGrowth / 100;
    }
    const down = (price * downPct) / 100;
    const loan = price - down;
    const monthly = monthlyInstalment(loan, rate, years);
    const monthsPaid = Math.min(years * 12, holdYears * 12);
    const paid = monthly * monthsPaid;
    const remaining = monthly * Math.max(0, years * 12 - monthsPaid);
    const propertyValue = price * Math.pow(1 + appreciation / 100, holdYears);
    const equity = propertyValue - remaining;
    const buyNetCost = down + paid + Math.max(0, annualHolding * holdYears) - equity;
    return { rentTotal, buyNetCost, propertyValue, equity, down, paid };
  }, [rent, rentGrowth, holdYears, price, downPct, rate, years, appreciation, annualHolding]);

  const activeTool = TOOL_DEFINITIONS.find((item) => item.key === tool) ?? TOOL_DEFINITIONS[0];

  const showPriceField = tool !== "construction";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="rounded-panel border border-soft bg-white p-3 shadow-soft">
        <div role="tablist" aria-label="Property tools" className="flex flex-col gap-1.5">
          {TOOL_DEFINITIONS.map((item) => {
            const Icon = item.icon;
            const active = item.key === tool;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTool(item.key)}
                className={[
                  "flex w-full items-start gap-3.5 rounded-xl border p-3 text-left transition-colors",
                  active ? "border-navy-800 bg-mist" : "border-transparent hover:bg-mist/70",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    active ? "bg-navy-800 text-white" : "bg-mist text-navy-700",
                  ].join(" ")}
                >
                  <Icon className="h-[1.05rem] w-[1.05rem]" />
                </span>
                <span>
                  <span className="block font-sans text-[0.9375rem] font-semibold text-navy-900">{item.label}</span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-muted">{item.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-panel border border-soft bg-white p-6 shadow-soft">
          <h3 className="font-sans text-[1.0625rem] font-semibold text-navy-900">{activeTool.label} inputs</h3>
          <div className="mt-5 space-y-5">
            {showPriceField && (
              <NumberField
                id={`calc-price-${tool}`}
                label={tool === "tax" ? "Purchase price" : "Property price"}
                value={price}
                onChange={setPrice}
                min={1000000}
                max={600000000}
                step={500000}
                suffix="PKR"
              />
            )}

            {tool === "mortgage" && (
              <>
                <NumberField id="calc-down" label="Down payment" value={downPct} onChange={setDownPct} min={5} max={80} suffix="%" />
                <NumberField id="calc-rate" label="Annual interest rate" value={rate} onChange={setRate} min={1} max={35} step={0.5} suffix="%" />
                <NumberField id="calc-years" label="Loan term" value={years} onChange={setYears} min={1} max={25} suffix="years" />
              </>
            )}

            {tool === "yield" && (
              <>
                <NumberField id="calc-rent" label="Monthly rent" value={rent} onChange={setRent} min={10000} max={3000000} step={5000} suffix="PKR" />
                <NumberField
                  id="calc-expenses"
                  label="Monthly expenses"
                  value={expenses}
                  onChange={setExpenses}
                  min={0}
                  max={500000}
                  step={5000}
                  suffix="PKR"
                  hint="maintenance, charges, management"
                />
              </>
            )}

            {tool === "affordability" && (
              <>
                <NumberField id="calc-income" label="Monthly household income" value={income} onChange={setIncome} min={50000} max={5000000} step={10000} suffix="PKR" />
                <NumberField id="calc-oblig" label="Existing monthly obligations" value={obligations} onChange={setObligations} min={0} max={2000000} step={5000} suffix="PKR" />
                <NumberField id="calc-downpay" label="Available down payment" value={downPayment} onChange={setDownPayment} min={0} max={400000000} step={500000} suffix="PKR" />
                <NumberField id="calc-rate-af" label="Expected rate" value={rate} onChange={setRate} min={1} max={35} step={0.5} suffix="%" />
                <NumberField id="calc-years-af" label="Loan term" value={years} onChange={setYears} min={1} max={25} suffix="years" />
              </>
            )}

            {tool === "rentvsbuy" && (
              <>
                <NumberField id="calc-rent-rb" label="Current monthly rent" value={rent} onChange={setRent} min={10000} max={2000000} step={5000} suffix="PKR" />
                <NumberField id="calc-rentgrowth" label="Annual rent increase" value={rentGrowth} onChange={setRentGrowth} min={0} max={25} step={0.5} suffix="%" />
                <NumberField id="calc-down-rb" label="Down payment" value={downPct} onChange={setDownPct} min={5} max={80} suffix="%" />
                <NumberField id="calc-rate-rb" label="Financing rate" value={rate} onChange={setRate} min={1} max={35} step={0.5} suffix="%" />
                <NumberField id="calc-hold-rb" label="Years you expect to stay" value={holdYears} onChange={setHoldYears} min={1} max={25} suffix="years" />
              </>
            )}

            {tool === "roi" && (
              <>
                <NumberField id="calc-rent-roi" label="Monthly rent" value={rent} onChange={setRent} min={0} max={3000000} step={5000} suffix="PKR" />
                <NumberField id="calc-expenses-roi" label="Monthly expenses" value={expenses} onChange={setExpenses} min={0} max={500000} step={5000} suffix="PKR" />
                <NumberField id="calc-appr-roi" label="Assumed annual appreciation" value={appreciation} onChange={setAppreciation} min={0} max={25} step={0.5} suffix="%" />
                <NumberField id="calc-hold-roi" label="Holding period" value={holdYears} onChange={setHoldYears} min={1} max={20} suffix="years" />
                <NumberField id="calc-exit" label="Exit / transfer costs" value={exitCosts} onChange={setExitCosts} min={0} max={15} step={0.5} suffix="%" />
              </>
            )}

            {tool === "growth" && (
              <>
                <NumberField id="calc-rent-2" label="Monthly rent" value={rent} onChange={setRent} min={0} max={3000000} step={5000} suffix="PKR" />
                <NumberField id="calc-appr" label="Assumed annual appreciation" value={appreciation} onChange={setAppreciation} min={0} max={25} step={0.5} suffix="%" />
                <NumberField id="calc-hold" label="Holding period" value={holdYears} onChange={setHoldYears} min={1} max={20} suffix="years" />
              </>
            )}

            {tool === "construction" && (
              <>
                <NumberField
                  id="calc-area"
                  label="Covered area"
                  value={coveredArea}
                  onChange={setCoveredArea}
                  min={500}
                  max={20000}
                  step={50}
                  suffix="sq ft"
                  hint="all floors combined"
                />
                <div>
                  <label htmlFor="calc-tier" className="text-[0.8125rem] font-semibold text-navy-900">
                    Construction tier
                  </label>
                  <select
                    id="calc-tier"
                    value={tier}
                    onChange={(event) => setTier(Number(event.target.value))}
                    className="field mt-2"
                  >
                    {CONSTRUCTION_TIERS.map((item) => (
                      <option key={item.label} value={item.rate}>
                        {item.label} — approx PKR {item.rate.toLocaleString("en-PK")} / sq ft
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[0.75rem] text-ink-muted">{CONSTRUCTION_TIERS.find((item) => item.rate === tier)?.note}</p>
                </div>
                <NumberField id="calc-contingency" label="Contingency" value={contingency} onChange={setContingency} min={0} max={30} suffix="%" />
                <NumberField id="calc-plot" label="Plot cost (optional)" value={plotCost} onChange={setPlotCost} min={0} max={400000000} step={500000} suffix="PKR" />
              </>
            )}

            {tool === "tax" && (
              <>
                <NumberField id="calc-purchase-tax" label="Purchase / transfer charges" value={purchaseTax} onChange={setPurchaseTax} min={0} max={15} step={0.5} suffix="%" />
                <NumberField id="calc-holding" label="Annual holding cost" value={annualHolding} onChange={setAnnualHolding} min={0} max={2000000} step={10000} suffix="PKR" hint="tax, society, utilities" />
                <NumberField id="calc-hold-tax" label="Holding period" value={holdYears} onChange={setHoldYears} min={1} max={20} suffix="years" />
                <NumberField id="calc-sale" label="Expected sale value" value={saleValue} onChange={setSaleValue} min={0} max={800000000} step={500000} suffix="PKR" />
                <div className="flex items-center justify-between gap-4 rounded-xl border border-soft bg-mist/60 px-4 py-3">
                  <label htmlFor="calc-cgt" className="text-[0.8125rem] font-semibold text-navy-900">
                    Apply indicative gain charge
                  </label>
                  <input
                    id="calc-cgt"
                    type="checkbox"
                    checked={cgtApplied}
                    onChange={(event) => setCgtApplied(event.target.checked)}
                    className="h-5 w-5 accent-forest-600"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {tool === "mortgage" && (
          <Result
            emphasis={{ label: "Estimated monthly instalment", value: currency(mortgage.monthly) }}
            items={[
              { label: "Loan amount", value: currency(mortgage.loan) },
              { label: "Down payment", value: currency(price - mortgage.loan) },
              { label: "Total interest", value: currency(mortgage.totalInterest) },
              { label: "Total payable", value: currency(mortgage.total) },
            ]}
          />
        )}
        {tool === "yield" && (
          <Result
            emphasis={{ label: "Net rental yield", value: pct(yieldResult.net) }}
            items={[
              { label: "Gross yield", value: pct(yieldResult.gross) },
              { label: "Annual rent", value: currency(yieldResult.annualRent) },
              { label: "Annual expenses", value: currency(expenses * 12) },
              { label: "Payback estimate", value: yieldResult.payback > 0 ? `${yieldResult.payback.toFixed(1)} years` : "—" },
            ]}
            note="Gross yield ignores costs; net yield is the figure worth comparing between two options. Estimates only."
          />
        )}
        {tool === "affordability" && (
          <Result
            emphasis={{ label: "Indicative price range up to", value: formatPrice(Math.round(affordability.maxPrice)) }}
            items={[
              { label: "Instalment budget", value: currency(affordability.available) },
              { label: "Indicative loan", value: currency(affordability.loan) },
              { label: "Down payment", value: currency(downPayment) },
              { label: "Rate assumption", value: `${rate}% over ${years} years` },
            ]}
            note="Based on housing outgoings capped at 40% of stated income after existing obligations. Verify with your lender."
          />
        )}
        {tool === "rentvsbuy" && (
          <Result
            emphasis={{
              label: rentVsBuy.buyNetCost <= rentVsBuy.rentTotal ? "Buying is cheaper in this scenario" : "Renting is cheaper in this scenario",
              value: `${Math.abs(rentVsBuy.rentTotal - rentVsBuy.buyNetCost) >= 0 ? currency(Math.abs(rentVsBuy.rentTotal - rentVsBuy.buyNetCost)) : "—"} difference`,
            }}
            items={[
              { label: `Total rent over ${holdYears} years`, value: currency(rentVsBuy.rentTotal) },
              { label: "Net cost of buying", value: currency(rentVsBuy.buyNetCost) },
              { label: "Projected property value", value: currency(rentVsBuy.propertyValue) },
              { label: "Estimated equity", value: currency(rentVsBuy.equity) },
            ]}
            note="Buying cost nets off equity at exit but includes down payment, instalments and holding costs. Scenario modelling only."
          />
        )}
        {tool === "roi" && (
          <Result
            emphasis={{ label: "Total return over the period", value: pct(roi.totalReturnPct) }}
            items={[
              { label: "Annualised return", value: pct(roi.annualised) },
              { label: "Net rental income", value: currency(roi.netRent) },
              { label: "Capital gain after exit costs", value: currency(roi.capitalGain) },
              { label: "Projected exit value", value: currency(roi.exitValue) },
            ]}
            note="Not a forecast. Appreciation assumptions are inputs, not predictions, and no return is guaranteed."
          />
        )}
        {tool === "growth" && (
          <Result
            emphasis={{ label: `Projected value in ${holdYears} years`, value: formatPrice(Math.round(growth.value)) }}
            items={[
              { label: "Capital appreciation", value: currency(growth.gain) },
              { label: "Cumulative rent", value: currency(growth.cumulativeRent) },
              { label: "Total return (scenario)", value: pct(growth.totalReturn) },
              { label: "Assumed appreciation", value: `${appreciation}% per year` },
            ]}
            note="Scenario modelling only — historic appreciation in Pakistan has been uneven between areas and years."
          />
        )}
        {tool === "construction" && (
          <Result
            emphasis={{ label: "Estimated build cost", value: currency(construction.total) }}
            items={[
              { label: `Construction (${coveredArea.toLocaleString("en-PK")} sq ft)`, value: currency(construction.base) },
              { label: `Contingency (${contingency}%)`, value: currency(construction.contingencyAmount) },
              { label: "Consultants and approvals", value: currency(construction.consultants + construction.approvals) },
              { label: "Land + build (with plot)", value: currency(construction.withPlot) },
            ]}
            note={`Effective rate ≈ PKR ${Math.round(construction.perSqft).toLocaleString("en-PK")} per sq ft. Material prices move — treat this as a budgeting range.`}
          />
        )}
        {tool === "tax" && (
          <Result
            emphasis={{ label: "Illustrative total charges", value: currency(tax.totalCost) }}
            items={[
              { label: "Purchase / transfer charges", value: currency(tax.purchase) },
              { label: "Society transfer (approx 1%)", value: currency(tax.societyTransfer) },
              { label: `Holding cost over ${holdYears} years`, value: currency(tax.holding) },
              { label: "Indicative gain charge", value: tax.cgt > 0 ? currency(tax.cgt) : "Not applied" },
            ]}
            note="Illustrative estimate only. Tax treatment in Pakistan depends on filer status, holding period and current law — confirm with FBR guidance or a tax practitioner."
          />
        )}
      </div>
    </div>
  );
}
