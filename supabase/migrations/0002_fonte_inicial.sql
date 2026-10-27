-- Fonte inicial: apenas feeds testados ao vivo.
-- Agência Brasil (Economia): feed respondeu com itens em 27/10/2026.
insert into fontes (nome, site_url, feed_url, secao) values
  ('Agência Brasil', 'https://agenciabrasil.ebc.com.br', 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml', 'economia-e-mercados')
on conflict (feed_url) do nothing;
