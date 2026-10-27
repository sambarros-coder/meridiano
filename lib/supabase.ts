import { createClient } from "@supabase/supabase-js";

// Leitura pública (chave anon): só enxerga artigos ativos, por causa da regra de segurança do banco.
export function supabasePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Escrita (chave de serviço): só no servidor. Nunca importar em componentes de navegador.
export function supabaseServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variáveis do Supabase ausentes");
  return createClient(url, key, { auth: { persistSession: false } });
}
