import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser, safeReturnPath } from "@/lib/auth";

export const metadata: Metadata = { title: "S'identifier" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  if (await getCurrentUser()) redirect(safeReturnPath(suite, "/compte"));
  return <AuthForm mode="connexion" suite={suite ? safeReturnPath(suite) : undefined} />;
}
