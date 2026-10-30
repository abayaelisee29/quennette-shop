"use client";

// Liste déroulante qui envoie son formulaire dès qu'on change de valeur.
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
