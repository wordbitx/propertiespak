/**
 * Founding dealer accounts. These are real, working platform accounts: each one
 * owns published listings, has a public profile at `/dealers/<slug>` and is
 * verified or unverified exactly as the admin workspace shows it. Verified
 * accounts carry the blue tick across the site.
 */
export type DealerSeed = {
  slug: string;
  name: string;
  email: string;
  phone: string;
  citySlug: string;
  cityName: string;
  agency: string;
  bio: string;
  isVerified: boolean;
  /** Login password for the seeded account (documented for the platform team). */
  password: string;
};

export const dealerSeed: DealerSeed[] = [
  {
    slug: "hassan-rizvi",
    name: "Hassan Rizvi",
    email: "hassan.rizvi@propertywx.pk",
    phone: "+92 300 1234567",
    citySlug: "lahore",
    cityName: "Lahore",
    agency: "Properties Pak Partners — Lahore",
    bio: "Eleven years on the Lahore desk with a focus on DHA, Bahria Town, Lake City and the Raiwind Road belt. Specialises in documentation checks, transfer timelines and helping overseas Pakistani families buy without flying in for every step.",
    isVerified: true,
    password: "propertiespak",
  },
  {
    slug: "ayesha-noor",
    name: "Ayesha Noor",
    email: "ayesha.noor@propertywx.pk",
    phone: "+92 301 7654321",
    citySlug: "islamabad",
    cityName: "Islamabad",
    agency: "Properties Pak Partners — Islamabad",
    bio: "Investment advisor covering Islamabad and Rawalpindi: CDA sectors, DHA, Bahria Enclave and the Expressway schemes. Works with institutional tenants and landlords on yield modelling and long-lease agreements.",
    isVerified: true,
    password: "propertiespak",
  },
  {
    slug: "bilal-shaikh",
    name: "Bilal Shaikh",
    email: "bilal.shaikh@propertywx.pk",
    phone: "+92 321 4455667",
    citySlug: "karachi",
    cityName: "Karachi",
    agency: "Properties Pak Partners — Karachi",
    bio: "Karachi commercial and apartment specialist working across DHA, Clifton, PECHS and Gulshan-e-Iqbal. Handles corporate leasing, builder-floor acquisitions and high-street retail mandates.",
    isVerified: true,
    password: "propertiespak",
  },
  {
    slug: "sana-ali",
    name: "Sana Ali",
    email: "sana.ali@propertywx.pk",
    phone: "+92 333 9988776",
    citySlug: "multan",
    cityName: "Multan",
    agency: "Properties Pak Partners — South Punjab",
    bio: "Covers Multan, Faisalabad and Peshawar for the platform: DHA Multan, Gulgasht, Bosan Road and Wapda City. Advises first-time buyers and overseas investors on plot selection and possession timelines.",
    isVerified: true,
    password: "propertiespak",
  },
  {
    slug: "usman-tariq",
    name: "Usman Tariq",
    email: "usman.tariq@propertywx.pk",
    phone: "+92 345 2233445",
    citySlug: "lahore",
    cityName: "Lahore",
    agency: "Tariq Estate & Builders",
    bio: "Independent Lahore dealer listing residential plots and ready homes across the Ferozepur Road corridor — Etihad Town, Khayaban-e-Amin, Central Park and State Life Housing Society. Construction and renovation support available on request.",
    isVerified: false,
    password: "propertiespak",
  },
  {
    slug: "hira-malik",
    name: "Hira Malik",
    email: "hira.malik@propertywx.pk",
    phone: "+92 311 5566778",
    citySlug: "rawalpindi",
    cityName: "Rawalpindi",
    agency: "Malik Property Consultants",
    bio: "Twin-city dealer handling Gulraiz, Chaklala Scheme 3, Adiala Road and Bahria Town Phase 8. Focused on families relocating to Islamabad who want a Rawalpindi price point with a workable commute.",
    isVerified: false,
    password: "propertiespak",
  },
  {
    slug: "kamran-abbasi",
    name: "Kamran Abbasi",
    email: "kamran.abbasi@propertywx.pk",
    phone: "+92 322 3344556",
    citySlug: "karachi",
    cityName: "Karachi",
    agency: "Abbasi Realty",
    bio: "Karachi north-side dealer working Scheme 33, North Nazimabad and Gulshan-e-Iqbal. Deals in 120 and 240 sq yd plots, builder floors and small commercial units suitable for family businesses.",
    isVerified: true,
    password: "propertiespak",
  },
  {
    slug: "nadia-sultan",
    name: "Nadia Sultan",
    email: "nadia.sultan@propertywx.pk",
    phone: "+92 300 6677889",
    citySlug: "faisalabad",
    cityName: "Faisalabad",
    agency: "Sultan Homes & Land",
    bio: "Faisalabad and Gujranwala dealer listing plots and family houses in Wapda City, Green Valley, Peoples Colony and DC Colony. Handles instalment-plan schemes with written payment schedules.",
    isVerified: false,
    password: "propertiespak",
  },
];
