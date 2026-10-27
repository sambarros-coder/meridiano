// Teste simples do leitor de feeds com um feed sintético (rodar: npx tsx scripts/testar-rss.ts)
import { lerFeed, trechoCurto, normalizarTitulo } from "../lib/rss";
import assert from "node:assert";

const xml = `<?xml version="1.0"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>
<item><title>Título &amp; Teste</title><link>https://ex.com/a</link>
<imagem-destaque>https://ex.com/i.jpg</imagem-destaque>
<description>&lt;p&gt;&lt;img src="x"/&gt;Primeiro parágrafo da matéria.&lt;/p&gt;&lt;p&gt;${"palavra ".repeat(200)}&lt;/p&gt;</description>
<pubDate>Mon, 26 Oct 2026 22:08:00 -0300</pubDate></item>
<item><title>Sem link</title></item>
<item><title>Outro</title><link>https://ex.com/b</link></item>
</channel></rss>`;

const r = lerFeed(xml);
assert.equal(r.length, 2);
assert.equal(r[0].titulo, "Título & Teste");
assert.equal(r[0].imagem, "https://ex.com/i.jpg");
assert.ok(r[0].trecho && r[0].trecho.length <= 281 && r[0].trecho.startsWith("Primeiro parágrafo"));
assert.ok(!r[0].trecho!.includes("<"));
assert.equal(r[0].publicadoEm.toISOString(), "2026-10-27T01:08:00.000Z");
assert.equal(normalizarTitulo("Dólar sobe, Bolsa cai!"), "dolar sobe bolsa cai");
assert.equal(trechoCurto("<b>oi</b>"), "oi");
console.log("ok");
