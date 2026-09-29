import { NextResponse } from "next/server";
import { clearVerificationRequest, setUserVerification } from "@/lib/queries";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Admin verification toggle. `{ verified: true }` switches the blue tick on for
 * the account site-wide (profile, listings, cards); `{ verified: false }`
 * removes it. This is the only place verification state can change.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid account id." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { verified?: boolean; action?: string };

    // Reviewing a request (approved or rejected) clears it from the queue.
    if (body.action === "clear-request") {
      const cleared = await clearVerificationRequest(userId);
      if (!cleared) {
        return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    const verified =
      typeof body.verified === "boolean"
        ? body.verified
        : body.action === "verify"
          ? true
          : body.action === "unverify"
            ? false
            : null;
    if (verified === null) {
      return NextResponse.json({ ok: false, error: "Send { verified: true } or { verified: false }." }, { status: 400 });
    }

    const updated = await setUserVerification(userId, verified);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("admin verification failed", error);
    return NextResponse.json({ ok: false, error: "Could not update verification." }, { status: 500 });
  }
}
