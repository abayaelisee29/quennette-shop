-- Queennette Shop : schéma de la base Supabase (PostgreSQL).
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».
-- Le script peut être relancé sans danger : il ne recrée que ce qui manque.
--
-- Sécurité : la sécurité par ligne (RLS) est activée sur toutes les tables, sans aucune règle
-- d'accès public. Personne ne peut donc lire ou écrire avec la clé publique (anon) ;
-- seul le serveur du site, qui utilise la clé secrète, a accès aux données.

-- ---------- Tables ----------

create table if not exists public.users (
  id            text primary key,
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  wishlist      text[] not null default '{}',
  shop_id       text,
  created_at    timestamptz not null default now()
);

create table if not exists public.sessions (
  token      text primary key,
  user_id    text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists sessions_user_idx on public.sessions(user_id);

create table if not exists public.shops (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  owner_id    text references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

do $$ begin
  alter table public.users add constraint users_shop_fk foreign key (shop_id) references public.shops(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists public.products (
  id            text primary key,
  seller_id     text not null references public.shops(id) on delete cascade,
  title         text not null,
  brand         text not null default '',
  category      text not null,
  price         numeric(10,2) not null check (price >= 0),
  list_price    numeric(10,2) check (list_price >= 0),
  rating        numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count  integer not null default 0 check (review_count >= 0),
  stock         integer not null default 0 check (stock >= 0),
  fast_delivery boolean not null default false,
  emoji         text not null default '📦',
  hue           integer not null default 0,
  description   text not null default '',
  features      text[] not null default '{}',
  status        text not null default 'actif' check (status in ('actif', 'brouillon')),
  image_url     text,
  fr            jsonb, -- traduction française : { title, description, features }
  created_at    timestamptz not null default now()
);
create index if not exists products_seller_idx on public.products(seller_id);
create index if not exists products_status_category_idx on public.products(status, category);

create table if not exists public.orders (
  id                text primary key,
  user_id           text not null references public.users(id) on delete cascade,
  subtotal          numeric(10,2) not null,
  shipping          numeric(10,2) not null,
  total             numeric(10,2) not null,
  address           jsonb not null,
  status            text not null default 'en_attente' check (status in ('en_attente', 'payee', 'annulee')),
  payment_mode      text not null check (payment_mode in ('stripe', 'demo')),
  stripe_session_id text,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);
create index if not exists orders_user_idx on public.orders(user_id);

-- Une ligne par article commandé (chaque vendeur gère l'expédition de ses propres articles).
create table if not exists public.order_items (
  order_id        text not null references public.orders(id) on delete cascade,
  position        integer not null,
  product_id      text not null, -- pas de clé étrangère : la commande reste lisible si le produit est supprimé
  title           text not null,
  unit_price      numeric(10,2) not null,
  quantity        integer not null check (quantity > 0),
  seller_id       text not null,
  ship_status     text not null default 'a_preparer' check (ship_status in ('a_preparer', 'expediee', 'livree')),
  tracking_number text,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  primary key (order_id, position)
);
create index if not exists order_items_product_idx on public.order_items(product_id);
create index if not exists order_items_seller_idx on public.order_items(seller_id);

create table if not exists public.reviews (
  id         text primary key,
  product_id text not null references public.products(id) on delete cascade,
  user_id    text not null references public.users(id) on delete cascade,
  user_name  text not null,
  rating     integer not null check (rating between 1 and 5),
  title      text not null,
  body       text not null,
  verified   boolean not null default false,
  helpful    text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (product_id, user_id)
);

-- ---------- Sécurité : accès réservé au serveur ----------

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;

alter table public.users       enable row level security;
alter table public.sessions    enable row level security;
alter table public.shops       enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews     enable row level security;

-- ---------- Opérations en une seule transaction ----------

-- Commande payée : change le statut et retire les quantités du stock, une seule fois.
create or replace function public.mark_order_paid(p_order_id text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update orders set status = 'payee', paid_at = now() where id = p_order_id and status = 'en_attente';
  if not found then return false; end if;
  update products p set stock = greatest(0, p.stock - q.qty)
    from (select product_id, sum(quantity) as qty from order_items where order_id = p_order_id group by product_id) q
    where p.id = q.product_id;
  return true;
end $$;

-- Ajoute ou retire un produit de la liste d'envies. Renvoie vrai s'il vient d'être ajouté.
create or replace function public.toggle_wishlist(p_user_id text, p_product_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare added boolean;
begin
  select not (p_product_id = any(wishlist)) into added from users where id = p_user_id for update;
  if added is null then return false; end if;
  update users set wishlist = case when added then array_prepend(p_product_id, wishlist) else array_remove(wishlist, p_product_id) end
    where id = p_user_id;
  return added;
end $$;

-- Crée la boutique et la relie à son propriétaire.
create or replace function public.create_shop(p_id text, p_slug text, p_name text, p_description text, p_owner_id text, p_created_at timestamptz)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into shops (id, slug, name, description, owner_id, created_at) values (p_id, p_slug, p_name, p_description, p_owner_id, p_created_at);
  update users set shop_id = p_id where id = p_owner_id;
end $$;

-- Crée la commande et ses articles ensemble.
create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into orders select * from jsonb_populate_record(null::orders, p_order);
  insert into order_items select * from jsonb_populate_recordset(null::order_items, p_items);
end $$;

-- Crée ou remplace l'avis d'un client et met à jour la note moyenne du produit.
-- (Calcul progressif, comme le site : la note de départ du catalogue d'exemple est conservée.)
create or replace function public.upsert_review(p_id text, p_product_id text, p_user_id text, p_user_name text, p_rating integer, p_title text, p_body text, p_verified boolean)
returns setof reviews language plpgsql security definer set search_path = public as $$
declare old_rating integer; total numeric; cnt integer;
begin
  select rating into old_rating from reviews where product_id = p_product_id and user_id = p_user_id for update;
  select rating * review_count, review_count into total, cnt from products where id = p_product_id for update;
  if found then
    total := total - coalesce(old_rating, 0) + p_rating;
    if old_rating is null then cnt := cnt + 1; end if;
    update products set review_count = cnt, rating = round(total / cnt, 1) where id = p_product_id;
  end if;
  if old_rating is null then
    return query insert into reviews (id, product_id, user_id, user_name, rating, title, body, verified)
      values (p_id, p_product_id, p_user_id, p_user_name, p_rating, p_title, p_body, p_verified) returning *;
  else
    return query update reviews set rating = p_rating, title = p_title, body = p_body, verified = p_verified, user_name = p_user_name, updated_at = now()
      where product_id = p_product_id and user_id = p_user_id returning *;
  end if;
end $$;

-- Supprime l'avis d'un client et met à jour la note moyenne du produit.
create or replace function public.delete_review(p_id text, p_user_id text)
returns void language plpgsql security definer set search_path = public as $$
declare r reviews; total numeric; cnt integer;
begin
  delete from reviews where id = p_id and user_id = p_user_id returning * into r;
  if r.id is null then return; end if;
  select rating * review_count, review_count into total, cnt from products where id = r.product_id for update;
  if found then
    cnt := greatest(0, cnt - 1);
    update products set review_count = cnt, rating = case when cnt > 0 then round((total - r.rating) / cnt, 1) else 0 end where id = r.product_id;
  end if;
end $$;

-- « Cet avis m'a été utile » (pas sur son propre avis).
create or replace function public.toggle_helpful(p_review_id text, p_user_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update reviews set helpful = case when p_user_id = any(helpful) then array_remove(helpful, p_user_id) else array_append(helpful, p_user_id) end
    where id = p_review_id and user_id <> p_user_id;
end $$;

-- Ces fonctions ne sont appelables que par le serveur (clé secrète).
revoke all on function public.mark_order_paid(text), public.toggle_wishlist(text, text),
  public.create_shop(text, text, text, text, text, timestamptz), public.create_order(jsonb, jsonb),
  public.upsert_review(text, text, text, text, integer, text, text, boolean), public.delete_review(text, text),
  public.toggle_helpful(text, text) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text), public.toggle_wishlist(text, text),
  public.create_shop(text, text, text, text, text, timestamptz), public.create_order(jsonb, jsonb),
  public.upsert_review(text, text, text, text, integer, text, text, boolean), public.delete_review(text, text),
  public.toggle_helpful(text, text) to service_role;

-- ---------- Photos produits ----------

-- Seau public : tout le monde peut voir les photos, seul le serveur peut en ajouter.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 3145728, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;
