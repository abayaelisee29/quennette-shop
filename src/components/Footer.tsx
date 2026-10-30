import Link from "next/link";
import { categories } from "@/lib/catalog";
import { shop } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-12 bg-nav text-nav-ink">
      <a href="#top" className="block bg-header/60 py-3 text-center text-sm hover:brightness-110">
        Retour en haut
      </a>
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 py-10 text-sm md:grid-cols-4">
        <div>
          <h3 className="mb-3 font-bold">Mieux nous connaître</h3>
          <ul className="space-y-2 opacity-85">
            <li>À propos de {shop.name}</li>
            <li>Carrières</li>
            <li>Nos engagements</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Vendre sur {shop.name}</h3>
          <ul className="space-y-2 opacity-85">
            <li>Devenir vendeur</li>
            <li>Espace vendeur (étape 3)</li>
            <li>Publicité</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Catégories</h3>
          <ul className="space-y-2 opacity-85">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/categorie/${c.slug}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Besoin d&apos;aide ?</h3>
          <ul className="space-y-2 opacity-85">
            <li>Votre compte</li>
            <li>Livraison et frais</li>
            <li>Retours et remboursements</li>
            <li>Service client</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-nav-ink/15 py-6 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {shop.name} · {shop.tagline}
      </div>
    </footer>
  );
}
