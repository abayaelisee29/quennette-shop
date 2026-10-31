import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { categories } from "@/lib/catalog";
import { shop } from "@/lib/config";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { ThemeSwitcher } from "./ThemeSwitcher";

const hover = "rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-header-ink/40";

export async function Header() {
  const [user, cart] = await Promise.all([getCurrentUser(), getCart()]);
  const firstName = user?.name.split(" ")[0];
  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="bg-header text-header-ink">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 md:flex-nowrap">
          <Logo />
          <div className={`hidden leading-tight lg:block ${hover}`}>
            <span className="block text-xs opacity-80">Livraison</span>
            <span className="text-sm font-bold">📍 Choisir l&apos;adresse</span>
          </div>
          <div className="order-last w-full md:order-none md:flex-1">
            <Suspense fallback={<div className="h-11 rounded-card bg-surface" />}>
              <SearchBar />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeSwitcher />
            <Link href={user ? "/compte" : "/connexion"} className={`hidden leading-tight sm:block ${hover}`}>
              <span className="block text-xs opacity-80">{user ? `Bonjour ${firstName}` : "Bonjour, identifiez-vous"}</span>
              <span className="text-sm font-bold">Compte & listes ▾</span>
            </Link>
            <Link href="/compte#commandes" className={`hidden leading-tight lg:block ${hover}`}>
              <span className="block text-xs opacity-80">Retours</span>
              <span className="text-sm font-bold">et commandes</span>
            </Link>
            <Link href="/envies" className={`hidden leading-tight md:block ${hover}`}>
              <span className="block text-xs opacity-80">Vos</span>
              <span className="text-sm font-bold">♡ Envies</span>
            </Link>
            <Link href="/panier" className={`flex items-end gap-1 ${hover}`}>
              <span className="relative text-2xl">
                🛒
                <span className="absolute -top-1 left-3 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-brand-ink">{cart.count}</span>
              </span>
              <span className="text-sm font-bold">Panier</span>
            </Link>
          </div>
        </div>
      </div>
      <nav className="bg-nav text-nav-ink">
        <div className="no-scrollbar mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-3 py-1 text-sm whitespace-nowrap">
          <Link href="/recherche" className="rounded px-2 py-1 font-bold hover:outline hover:outline-1 hover:outline-nav-ink/50">
            ☰ Toutes les catégories
          </Link>
          <Link href="/recherche?promo=1" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
            Offres du jour
          </Link>
          <Link href="/recherche?tri=nouveautes" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
            Nouveautés
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categorie/${c.slug}`} className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
              {c.name}
            </Link>
          ))}
          <span className="ml-auto hidden pl-4 font-semibold text-brand 2xl:inline">Livraison offerte dès {shop.freeShippingFrom} €</span>
        </div>
      </nav>
    </header>
  );
}
