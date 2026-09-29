"use server";

import { redirect } from "next/navigation";
import { destroySession, loginUser, registerUser } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/login?error=Please%20enter%20your%20email%20and%20password.");
  }
  const result = await loginUser(email, password);
  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/account");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    redirect("/login?error=Please%20complete%20all%20required%20fields.&mode=register");
  }
  const result = await registerUser({ name, email, phone, password });
  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}&mode=register`);
  }
  redirect("/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
