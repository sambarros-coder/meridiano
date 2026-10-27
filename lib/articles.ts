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

// Etapa 4 (em andamento): aqui entrará a leitura da tabela "artigos" na Supabase.
// Enquanto o banco não estiver conectado, não há notícias para exibir.
export async function getArticles(): Promise<Article[]> {
  return [];
}
