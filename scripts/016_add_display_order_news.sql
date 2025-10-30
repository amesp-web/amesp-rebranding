-- Adiciona coluna de ordenação em news
alter table public.news
  add column if not exists display_order integer not null default 0;

-- Inicializa com índice sequencial baseado na data (se quiser)
-- update public.news n set display_order = sub.rn - 1 from (
--   select id, row_number() over(order by created_at asc) as rn from public.news
-- ) as sub where sub.id = n.id;


