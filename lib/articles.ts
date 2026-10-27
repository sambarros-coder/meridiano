import { supabasePublico } from "./supabase";

export type Article = {
  id: string;
  titulo: string;
  trecho: string | null;
  veiculo: string;
  secao: string;
  url: string;
  imagem: string | null;
  publicadoEm: string;
};

const NOMES: Record<string, string> = {
  "economia-e-mercados": "Economia e Mercados",
  "negocios-e-empresas": "Negócios e Empresas",
  "politica-economica": "Política Econômica",
  "internacional": "Internacional",
  "financas-pessoais": "Finanças Pessoais",
  "tecnologia-e-inovacao": "Tecnologia e Inovação",
};

// Artigos ativos mais recentes. Sem banco configurado ou sem notícias, devolve lista vazia.
export async function getArticles(limite = 30): Promise<Article[]> {
  const db = supabasePublico();
  if (!db) return [];
  const { data, error } = await db
    .from("artigos")
    .select("id, titulo, trecho, veiculo, secao, url, imagem_url, publicado_em")
    .eq("status", "ativo")
    .order("publicado_em", { ascending: false })
    .limit(limite);
  if (error || !data) return [];
  return data.map((a) => ({
    id: a.id,
    titulo: a.titulo,
    trecho: a.trecho,
    veiculo: a.veiculo,
    secao: NOMES[a.secao] ?? a.secao,
    url: a.url,
    imagem: a.imagem_url,
    publicadoEm: a.publicado_em,
  }));
}
