import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconArrowRight,
  IconCheck,
  IconGoogle,
  IconHeart,
  IconLayers,
  IconShield,
} from "@/components/icons";
import { loginAction, registerAction } from "@/app/actions/auth";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { getSessionUserId } from "@/lib/auth";
import { isGoogleSignInConfigured } from "@/lib/google-oauth";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Login or Register — Properties Pak Account",
  description:
    "Sign in to Properties Pak to sync your saved property shortlist across devices, track enquiries and save searches across Pakistan's property markets.",
  path: "/login",
  robots: { index: false, follow: true },
});

type PageProps = { searchParams: Promise<{ error?: string; mode?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const [{ error, mode }, userId] = await Promise.all([searchParams, getSessionUserId()]);
  if (userId) redirect("/account");

  const googleEnabled = isGoogleSignInConfigured();

  const inputClass = "field mt-2";
  const labelClass = "text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted";

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Sign In to Your Properties Pak Account"
        description="Save the properties you like, keep your shortlist in sync across devices and follow every enquiry you send."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Login", href: "/login" },
        ]}
      />

      <Section tone="light">
        <div className="ui-container">
          {error && (
            <p role="alert" className="mx-auto mb-8 max-w-3xl rounded-panel border border-red-200 bg-red-50 px-5 py-4 text-[0.875rem] text-red-700">
              {error}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <form action={loginAction} className="rounded-panel border border-soft bg-white p-6 shadow-soft lg:p-8">
              <h2 className="font-sans text-[1.25rem] font-bold text-navy-900">Sign in</h2>
              <p className="mt-2 text-[0.875rem] text-ink-muted">
                Welcome back. Access your synced shortlist and enquiry history.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className={labelClass} htmlFor="login-email">
                    Email
                  </label>
                  <input id="login-email" name="email" type="email" required autoComplete="email" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className={inputClass}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-6 w-full">
                Sign in <IconArrowRight className="h-4 w-4" />
              </button>

              {googleEnabled && (
                <>
                  <div className="my-5 flex items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-soft" />
                    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      or
                    </span>
                    <span className="h-px flex-1 bg-soft" />
                  </div>
                  {/* A Link, not a form post: the handshake is a full-page
                      redirect to Google and back. */}
                  <Link
                    href="/api/auth/google?returnTo=/account"
                    className="btn btn-outline w-full justify-center gap-2.5"
                  >
                    <IconGoogle className="h-[1.125rem] w-[1.125rem]" />
                    Continue with Google
                  </Link>
                  <p className="mt-3 text-center text-[0.75rem] text-ink-muted">
                    New here? We&apos;ll create your {SITE.name} account from your Google profile.
                  </p>
                </>
              )}

              <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-muted">
                Passwords are stored hashed, never in plain text. Accounts are operated by {SITE.company}.
              </p>
            </form>

            <form
              action={registerAction}
              className={`rounded-panel border bg-white p-6 shadow-soft lg:p-8 ${
                mode === "register" ? "border-forest-500/50" : "border-soft"
              }`}
            >
              <h2 className="font-sans text-[1.25rem] font-bold text-navy-900">Create an account</h2>
              <p className="mt-2 text-[0.875rem] text-ink-muted">
                Free to join. Build a shortlist, save searches and get matched listings for your budget.
              </p>

              {googleEnabled && (
                <>
                  {/* A Link, not a form post: the handshake is a full-page
                      redirect to Google and back. */}
                  <Link
                    href="/api/auth/google?returnTo=/account"
                    className="btn btn-outline mt-5 w-full justify-center gap-2.5"
                  >
                    <IconGoogle className="h-[1.125rem] w-[1.125rem]" />
                    Sign up with Google
                  </Link>
                  <div className="my-5 flex items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-soft" />
                    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      or use your details
                    </span>
                    <span className="h-px flex-1 bg-soft" />
                  </div>
                </>
              )}
              <div className="mt-6 space-y-4">
                <div>
                  <label className={labelClass} htmlFor="register-name">
                    Full name
                  </label>
                  <input id="register-name" name="name" required autoComplete="name" className={inputClass} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="register-email">
                      Email
                    </label>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="register-phone">
                      Phone
                    </label>
                    <input id="register-phone" name="phone" inputMode="tel" autoComplete="tel" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="register-password">
                    Password
                  </label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                  <p className="mt-2 text-[0.75rem] text-ink-muted">At least 6 characters.</p>
                </div>
              </div>
              <button type="submit" className="btn btn-green mt-6 w-full">
                Create account <IconArrowRight className="h-4 w-4" />
              </button>

              <ul className="mt-6 space-y-2.5 border-t border-soft pt-5 text-[0.8125rem] text-ink-muted">
                {[
                  { icon: IconHeart, text: "Shortlist properties and compare them later" },
                  { icon: IconLayers, text: "Keep searches and requirements on file" },
                  { icon: IconShield, text: "Enquiries tracked with status updates" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 text-forest-600" />
                      {item.text}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-[0.8125rem] text-ink-muted">
                <IconCheck className="h-4 w-4 text-forest-600" />
                No listing fees. We never sell your data.
              </p>
            </form>
          </div>

          <p className="mt-8 text-center text-[0.8125rem] text-ink-muted">
            Looking for a property?{" "}
            <Link href="/properties" className="font-semibold text-navy-900 hover:text-forest-700">
              Browse live listings
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="font-semibold text-navy-900 hover:text-forest-700">
              talk to an advisor
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
