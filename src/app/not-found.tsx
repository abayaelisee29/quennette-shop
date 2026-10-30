import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-6xl">🔎</p>
      <h1 className="mt-4 text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-muted">Ce produit ou cette page n&apos;existe pas, ou plus.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
