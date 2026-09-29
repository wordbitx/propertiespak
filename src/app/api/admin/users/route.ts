import { NextResponse } from "next/server";
import { getAdminUserRows } from "@/lib/queries";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Admin list: every registered account with its listing footprint. */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  try {
    const users = await getAdminUserRows();
    return NextResponse.json({
      ok: true,
      items: users,
      counts: {
        total: users.length,
        verified: users.filter((user) => user.isVerified).length,
        dealers: users.filter((user) => user.listings > 0).length,
        profiles: users.filter((user) => user.profileCompletedAt).length,
        requested: users.filter((user) => user.verificationRequestedAt && !user.isVerified).length,
      },
    });
  } catch (error) {
    console.error("admin users failed", error);
    return NextResponse.json({ ok: false, error: "Could not load accounts." }, { status: 500 });
  }
}
