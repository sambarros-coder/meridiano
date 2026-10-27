-- Meridiano — estrutura inicial do banco (Supabase / PostgreSQL)
-- Regras: nada é apagado de verdade (só arquivado) e o público só lê artigos ativos.

-- Seções do site (mesmos identificadores usados em lib/sections.ts)
create type secao_slug as enum (
  'economia-e-mercados',
  'negocios-e-empresas',
  'politica-economica',
  'internacional',
  'financas-pessoais',
  'tecnologia-e-inovacao'
);

create type status_artigo as enum ('ativo', 'arquivado');

-- Fontes de notícias (feeds RSS) gerenciadas no painel admin
create table fontes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,                 -- nome do veículo exibido como crédito
  site_url      text not null,                 -- site do veículo
  feed_url      text not null unique,          -- endereço do feed RSS
  secao         secao_slug not null,           -- seção padrão das matérias desta fonte
  ativa         boolean not null default true, -- desligar não apaga o histórico
  ultima_coleta timestamptz,
  ultimo_erro   text,
  criado_em     timestamptz not null default now()
);

-- Artigos agregados: só título, trecho curto, crédito e link para o original
create table artigos (
  id                  uuid primary key default gen_random_uuid(),
  fonte_id            uuid references fontes(id),
  veiculo             text not null,           -- crédito exibido ("Fonte: ...")
  titulo              text not null,
  titulo_normalizado  text not null,           -- minúsculas, sem acento/pontuação, p/ detectar duplicatas
  trecho              text check (char_length(trecho) <= 400),
  url                 text not null unique,    -- link da matéria no veículo original
  imagem_url          text,
  secao               secao_slug not null,
  publicado_em        timestamptz not null,
  coletado_em         timestamptz not null default now(),
  status              status_artigo not null default 'ativo',
  destaque            boolean not null default false,
  arquivado_em        timestamptz
);

create index artigos_status_data_idx on artigos (status, publicado_em desc);
create index artigos_secao_data_idx  on artigos (secao, publicado_em desc);
create index artigos_titulo_idx      on artigos (titulo_normalizado);

-- Registro de cada execução da coleta
create table coletas (
  id            uuid primary key default gen_random_uuid(),
  iniciada_em   timestamptz not null default now(),
  finalizada_em timestamptz,
  fontes_lidas  int not null default 0,
  novos         int not null default 0,
  duplicados    int not null default 0,
  erros         int not null default 0,
  detalhes      jsonb
);

-- Nada é apagado: qualquer DELETE nessas tabelas é bloqueado.
-- Para ocultar uma matéria, use: update artigos set status = 'arquivado', arquivado_em = now() where id = ...
create function bloquear_exclusao() returns trigger
language plpgsql as $$
begin
  raise exception 'Exclusão não permitida em %. Arquive o registro em vez de apagar.', tg_table_name;
end $$;

create trigger fontes_sem_exclusao   before delete on fontes   for each row execute function bloquear_exclusao();
create trigger artigos_sem_exclusao  before delete on artigos  for each row execute function bloquear_exclusao();
create trigger coletas_sem_exclusao  before delete on coletas  for each row execute function bloquear_exclusao();

-- Segurança: leitura pública apenas de artigos ativos.
-- Escritas (coleta e painel admin) usam a chave de serviço, que fica só no servidor.
alter table fontes  enable row level security;
alter table artigos enable row level security;
alter table coletas enable row level security;

create policy "publico_le_artigos_ativos" on artigos
  for select to anon, authenticated
  using (status = 'ativo');
