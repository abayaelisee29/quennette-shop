"use client";

import { useFormStatus } from "react-dom";
import { useI18n } from "./I18nProvider";

// Bouton qui se désactive pendant l'envoi du formulaire.
export function SubmitButton({ children, pendingText, className = "" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <button type="submit" disabled={pending} className={`disabled:cursor-wait disabled:opacity-70 ${className}`}>
      {pending ? (pendingText ?? t.common.wait) : children}
    </button>
  );
}
