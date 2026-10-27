import { lerFeed, normalizarTitulo } from "./rss";
import { supabaseServico } from "./supabase";

type Fonte = { id: string; nome: string; feed_url: string; secao: string };

async function baixar(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: {
      "user-agent": "MeridianoBot/1.0 (agregador de notícias com crédito e link para a fonte)",
      accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

export async function coletar() {
  const db = supabaseServico();
  const { data: coleta } = await db.from("coletas").insert({}).select("id").single();

  const { data: fontes, error } = await db
    .from("fontes")
    .select("id, nome, feed_url, secao")
    .eq("ativa", true);
  if (error) throw error;

  // Títulos recentes, para não repetir a mesma notícia vinda de fontes diferentes.
  const desde = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
  const { data: recentes } = await db.from("artigos").select("titulo_normalizado").gte("publicado_em", desde);
  const vistos = new Set((recentes ?? []).map((r) => r.titulo_normalizado));

  let novos = 0, duplicados = 0, erros = 0;
  const detalhes: Record<string, unknown>[] = [];

  for (const f of (fontes ?? []) as Fonte[]) {
    try {
      const itens = lerFeed(await baixar(f.feed_url));
      const linhas = [];
      for (const i of itens) {
        const norm = normalizarTitulo(i.titulo);
        if (vistos.has(norm)) { duplicados++; continue; }
        vistos.add(norm);
        linhas.push({
          fonte_id: f.id,
          veiculo: f.nome,
          titulo: i.titulo,
          titulo_normalizado: norm,
          trecho: i.trecho,
          url: i.url,
          imagem_url: i.imagem,
          secao: f.secao,
          publicado_em: i.publicadoEm.toISOString(),
        });
      }
      if (linhas.length) {
        // Se o link já existe, ignora (não altera nem apaga nada).
        const { data: inseridos, error: e } = await db
          .from("artigos")
          .upsert(linhas, { onConflict: "url", ignoreDuplicates: true })
          .select("id");
        if (e) throw e;
        const n = inseridos?.length ?? 0;
        novos += n;
        duplicados += linhas.length - n;
      }
      await db.from("fontes").update({ ultima_coleta: new Date().toISOString(), ultimo_erro: null }).eq("id", f.id);
      detalhes.push({ fonte: f.nome, itens: itens.length });
    } catch (e) {
      erros++;
      const msg = e instanceof Error ? e.message : String(e);
      await db.from("fontes").update({ ultimo_erro: msg.slice(0, 300) }).eq("id", f.id);
      detalhes.push({ fonte: f.nome, erro: msg });
    }
  }

  if (coleta?.id) {
    await db
      .from("coletas")
      .update({ finalizada_em: new Date().toISOString(), fontes_lidas: fontes?.length ?? 0, novos, duplicados, erros, detalhes })
      .eq("id", coleta.id);
  }
  return { fontes: fontes?.length ?? 0, novos, duplicados, erros };
}
