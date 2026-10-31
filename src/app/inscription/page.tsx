import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser, safeReturnPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  if (await getCurrentUser()) redirect(safeReturnPath(suite, "/compte"));
  return <AuthForm mode="inscription" suite={suite ? safeReturnPath(suite) : undefined} />;
}
