import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { getCategories } from "@/lib/categories";
import { shop } from "@/lib/config";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { ThemeSwitcher } from "./ThemeSwitcher";

const hover = "rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-header-ink/40";

export async function Header() {
  const { lang, t, fmt } = await getI18n();
  const h = t.header;
  const [user, cart] = await Promise.all([getCurrentUser(), getCart(lang)]);
  const firstName = user?.name.split(" ")[0];
  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="bg-header text-header-ink">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 md:flex-nowrap">
          <Logo />
          <div className={`hidden shrink-0 leading-tight whitespace-nowrap xl:block ${hover}`}>
            <span className="block text-xs opacity-80">{h.deliverTo}</span>
            <span className="text-sm font-bold">📍 {h.chooseAddress}</span>
          </div>
          <div className="order-last w-full md:order-none md:min-w-0 md:flex-1">
            <Suspense fallback={<div className="h-11 rounded-card bg-surface" />}>
              <SearchBar />
            </Suspense>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap md:ml-0">
            <LanguageSwitcher lang={lang} t={t} />
            <ThemeSwitcher />
            <Link href={user ? "/account" : "/signin"} className={`hidden leading-tight sm:block ${hover}`}>
              <span className="block text-xs opacity-80">{user ? fill(h.hello, { name: firstName ?? "" }) : h.helloSignIn}</span>
              <span className="text-sm font-bold">{h.accountLists} ▾</span>
            </Link>
            <Link href="/account#orders" className={`hidden leading-tight 2xl:block ${hover}`}>
              <span className="block text-xs opacity-80">{h.returns}</span>
              <span className="text-sm font-bold">{h.andOrders}</span>
            </Link>
            <Link href="/wishlist" className={`hidden leading-tight md:block ${hover}`}>
              <span className="block text-xs opacity-80">{h.your}</span>
              <span className="text-sm font-bold">♡ {h.wishlist}</span>
            </Link>
            <Link href="/cart" className={`flex items-end gap-1 ${hover}`}>
              <span className="relative text-2xl">
                🛒
                <span className="absolute -top-1 left-3 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-brand-ink">{cart.count}</span>
              </span>
              <span className="text-sm font-bold">{h.cart}</span>
            </Link>
          </div>
        </div>
      </div>
      <nav className="bg-nav text-nav-ink">
        <div className="no-scrollbar mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-3 py-1 text-sm whitespace-nowrap">
          <Link href="/search" className="rounded px-2 py-1 font-bold hover:outline hover:outline-1 hover:outline-nav-ink/50">
            ☰ {h.allCategories}
          </Link>
          <Link href="/search?deal=1" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
            {h.todaysDeals}
          </Link>
          <Link href="/search?sort=newest" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
            {h.newArrivals}
          </Link>
          <Link href="/seller" className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
            {fill(h.sellOn, { shop: shop.name })}
          </Link>
          {getCategories(lang).map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-nav-ink/50">
              {c.name}
            </Link>
          ))}
          <span className="ml-auto hidden pl-4 font-semibold text-brand 2xl:inline">{fill(h.freeShipping, { amount: fmt.price(shop.freeShippingFrom) })}</span>
        </div>
      </nav>
    </header>
  );
}
