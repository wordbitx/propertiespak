import { NextResponse } from "next/server";
import { clearVerificationRequest, setUserVerification, updateAdminUserIdentity } from "@/lib/queries";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { invalidateCatalog } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Admin-only account controls: verification and the public name / agency shown
 * on dealer profiles and directory cards.
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
    const body = (await request.json()) as {
      verified?: boolean;
      action?: string;
      name?: unknown;
      agency?: unknown;
    };

    // Reviewing a request (approved or rejected) clears it from the queue.
    if (body.action === "clear-request") {
      const cleared = await clearVerificationRequest(userId);
      if (!cleared) {
        return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasAgency = Object.prototype.hasOwnProperty.call(body, "agency");
    if (hasName || hasAgency) {
      if ((hasName && typeof body.name !== "string") || (hasAgency && typeof body.agency !== "string")) {
        return NextResponse.json({ ok: false, error: "Name and agency must be text values." }, { status: 400 });
      }

      const name = hasName ? (body.name as string).trim() : undefined;
      const agency = hasAgency ? (body.agency as string).trim() : undefined;
      if (name !== undefined && (name.length < 2 || name.length > 120)) {
        return NextResponse.json({ ok: false, error: "Name must be between 2 and 120 characters." }, { status: 400 });
      }
      if (agency !== undefined && agency.length > 160) {
        return NextResponse.json({ ok: false, error: "Agency name must be 160 characters or fewer." }, { status: 400 });
      }

      const changes = {
        ...(name !== undefined ? { name } : {}),
        ...(agency !== undefined ? { agency } : {}),
      };
      const updatedIdentity = await updateAdminUserIdentity(userId, changes);
      if (!updatedIdentity) {
        return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
      }
      invalidateCatalog();
      return NextResponse.json({ ok: true, user: updatedIdentity });
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
    invalidateCatalog();
    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("admin account update failed", error);
    return NextResponse.json({ ok: false, error: "Could not update the account." }, { status: 500 });
  }
}
