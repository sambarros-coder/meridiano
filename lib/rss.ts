import { XMLParser } from "fast-xml-parser";

export type ItemFeed = {
  titulo: string;
  trecho: string | null;
  url: string;
  imagem: string | null;
  publicadoEm: Date;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
  trimValues: true,
});

const ENTIDADES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};

function texto(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return texto(o["#text"] ?? o["@_href"] ?? "");
  }
  return "";
}

/** Remove HTML e devolve só um trecho curto (nunca o texto completo da matéria). */
export function trechoCurto(html: string, max = 280): string | null {
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (m) => ENTIDADES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return null;
  if (t.length <= max) return t;
  t = t.slice(0, max);
  const corte = t.lastIndexOf(" ");
  return (corte > max * 0.6 ? t.slice(0, corte) : t).replace(/[\s,;:.\-–]+$/, "") + "…";
}

export function normalizarTitulo(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function imagemDe(item: Record<string, unknown>): string | null {
  const candidatos: unknown[] = [
    item["imagem-destaque"],
    (item["enclosure"] as Record<string, unknown> | undefined)?.["@_url"],
    (item["media:content"] as Record<string, unknown> | undefined)?.["@_url"],
    (item["media:thumbnail"] as Record<string, unknown> | undefined)?.["@_url"],
  ];
  for (const c of candidatos) {
    const s = texto(c).trim();
    if (/^https?:\/\//i.test(s)) return s;
  }
  return null;
}

export function lerFeed(xml: string, limite = 30): ItemFeed[] {
  const doc = parser.parse(xml);
  const bruto = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
  const lista: Record<string, unknown>[] = Array.isArray(bruto) ? bruto : [bruto];
  const saida: ItemFeed[] = [];
  for (const item of lista.slice(0, limite)) {
    const titulo = trechoCurto(texto(item.title), 300);
    const url = texto(item.link).trim();
    if (!titulo || !/^https?:\/\//i.test(url)) continue;
    const resumo = texto(item.description ?? item.summary ?? item["content:encoded"] ?? "");
    const data = new Date(texto(item.pubDate ?? item.published ?? item.updated));
    saida.push({
      titulo,
      trecho: resumo ? trechoCurto(resumo) : null,
      url,
      imagem: imagemDe(item),
      publicadoEm: Number.isNaN(data.getTime()) ? new Date() : data,
    });
  }
  return saida;
}
