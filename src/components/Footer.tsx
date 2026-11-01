import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { shop } from "@/lib/config";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export async function Footer() {
  const { lang, t } = await getI18n();
  const f = t.footer;
  return (
    <footer className="mt-12 bg-nav text-nav-ink">
      <a href="#top" className="block bg-header/60 py-3 text-center text-sm hover:brightness-110">
        {f.backToTop}
      </a>
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 py-10 text-sm md:grid-cols-4">
        <div>
          <h3 className="mb-3 font-bold">{f.getToKnowUs}</h3>
          <ul className="space-y-2 opacity-85">
            <li>{fill(f.about, { shop: shop.name })}</li>
            <li>{f.careers}</li>
            <li>{f.commitments}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">{fill(f.sellOn, { shop: shop.name })}</h3>
          <ul className="space-y-2 opacity-85">
            <li><Link href="/seller" className="hover:underline">{f.becomeSeller}</Link></li>
            <li><Link href="/seller" className="hover:underline">{f.sellerCentral}</Link></li>
            <li>{f.advertising}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">{f.categories}</h3>
          <ul className="space-y-2 opacity-85">
            {getCategories(lang).slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">{f.help}</h3>
          <ul className="space-y-2 opacity-85">
            <li><Link href="/account" className="hover:underline">{f.yourAccount}</Link></li>
            <li>{f.shipping}</li>
            <li>{f.returns}</li>
            <li>{f.customerService}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-nav-ink/15 py-6 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {shop.name} · {t.meta.tagline}
      </div>
    </footer>
  );
}
