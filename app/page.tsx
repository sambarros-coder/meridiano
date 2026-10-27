import AdSlot from "@/components/AdSlot";
import Cotacoes from "@/components/Cotacoes";
import { getArticles } from "@/lib/articles";
import { SECTIONS } from "@/lib/sections";

export const revalidate = 300;

function quando(iso: string) {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `há ${min} min`;
  if (min < 1440) return `há ${Math.round(min / 60)} h`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function Home() {
  const artigos = await getArticles();
  const [destaque, ...demais] = artigos;
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <>
      <div className="wrap">
        <div className="masthead">
          <a href="/" className="brand">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="17" fill="none" stroke="#0F2A43" strokeWidth="2" />
              <ellipse cx="20" cy="20" rx="7" ry="17" fill="none" stroke="#0F2A43" strokeWidth="1.5" />
              <line x1="20" y1="3" x2="20" y2="37" stroke="#8A6420" strokeWidth="2.5" />
            </svg>
            <span className="brand-t">
              <span className="brand-n">MERIDIANO</span>
              <span className="brand-s">Economia, mercados e informação</span>
            </span>
          </a>
          <div className="masthead-r">
            <span className="data">{hoje}</span>
            <a href="#newsletter" className="btn">Newsletter semanal</a>
          </div>
        </div>
      </div>

      <Cotacoes />

      <div className="wrap">
        <nav aria-label="Seções" className="nav">
          {SECTIONS.map((s) => (
            <a key={s.slug} href={`/secao/${s.slug}`}>{s.nome}</a>
          ))}
          <a href="#videos">Vídeos</a>
          <a href="#artigos">Artigos</a>
          <a href="#newsletter">Newsletter</a>
        </nav>

        <div className="ad-row">
          <AdSlot rotulo="728×90" largura={728} altura={90} />
        </div>

        <div className="cols">
          <main className="main">
            <h2 className="h2">Destaques</h2>
            {!destaque ? (
              <p className="vazio">
                As notícias aparecerão aqui assim que a coleta automática for ativada.
              </p>
            ) : (
              <article className="destaque">
                <div className="kicker">{destaque.secao}</div>
                <h3 className="h3-g">
                  <a href={destaque.url} target="_blank" rel="noopener noreferrer">
                    {destaque.titulo}
                  </a>
                </h3>
                {destaque.trecho && <p className="trecho">{destaque.trecho}</p>}
                <div className="meta">
                  Fonte: <strong>{destaque.veiculo}</strong> · {quando(destaque.publicadoEm)} ·{" "}
                  <a className="ler" href={destaque.url} target="_blank" rel="noopener noreferrer">
                    Ler na fonte ↗
                  </a>
                </div>
              </article>
            )}

            <h2 className="h2 h2-b">Últimas notícias</h2>
            <div>
              {demais.map((a, idx) => (
                <div key={a.id}>
                  {idx === 3 && (
                    <div className="ad-row ad-meio">
                      <AdSlot rotulo="bloco entre as notícias" largura={640} altura={120} />
                    </div>
                  )}
                  <article className="item">
                    <h3 className="h3">
                      <a href={a.url} target="_blank" rel="noopener noreferrer">{a.titulo}</a>
                    </h3>
                    <div className="meta">
                      Fonte: <strong>{a.veiculo}</strong> · {a.secao} · {quando(a.publicadoEm)} ·{" "}
                      <a className="ler" href={a.url} target="_blank" rel="noopener noreferrer">
                        Ler na fonte ↗
                      </a>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </main>

          <aside className="side">
            <AdSlot rotulo="300×250" largura={300} altura={250} />
            <section className="news-box">
              <div className="kicker kicker-g">Newsletter semanal</div>
              <h3 className="nb-t">Indicadores Econômicos</h3>
              <p>Resumo semanal dos principais indicadores, publicado no LinkedIn.</p>
              <a href="#newsletter" className="btn btn-g">Assinar no LinkedIn</a>
            </section>
            <AdSlot rotulo="300×600" largura={300} altura={600} />
          </aside>
        </div>
      </div>

      <footer className="foot">
        <div className="wrap foot-in">
          <div>
            <div className="foot-b">MERIDIANO</div>
            <p>
              O Meridiano reúne títulos e trechos de matérias de outros veículos e direciona o
              leitor à publicação original, sempre com o crédito da fonte. As cotações têm
              caráter informativo, com atraso, e não constituem recomendação de investimento.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
