"use client";

import { useEffect, useState } from "react";

type Item = { chave: string; rotulo: string; valor: string; variacao?: number; ouro?: boolean };

const fmt = (n: number, d: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

async function sgs(codigo: number): Promise<number> {
  const r = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`
  );
  const j = await r.json();
  return parseFloat(j[0].valor);
}

const BASE: Item[] = [
  { chave: "selic", rotulo: "SELIC (META)", valor: "—", ouro: true },
  { chave: "cdi", rotulo: "CDI", valor: "—", ouro: true },
  { chave: "ipca", rotulo: "IPCA 12M", valor: "—" },
  { chave: "usd", rotulo: "DÓLAR", valor: "—" },
  { chave: "eur", rotulo: "EURO", valor: "—" },
  { chave: "btc", rotulo: "BITCOIN", valor: "—" },
];

export default function Cotacoes() {
  const [itens, setItens] = useState<Item[]>(BASE);

  useEffect(() => {
    let vivo = true;
    const set = (chave: string, valor: string, variacao?: number) =>
      vivo &&
      setItens((atual) =>
        atual.map((i) => (i.chave === chave ? { ...i, valor, variacao } : i))
      );

    async function carregar() {
      sgs(432).then((v) => set("selic", `${fmt(v, 2)}% a.a.`)).catch(() => {});
      sgs(4389).then((v) => set("cdi", `${fmt(v, 2)}% a.a.`)).catch(() => {});
      sgs(13522).then((v) => set("ipca", `${fmt(v, 2)}%`)).catch(() => {});
      try {
        const r = await fetch(
          "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL"
        );
        const j = await r.json();
        set("usd", `R$ ${fmt(+j.USDBRL.bid, 2)}`, parseFloat(j.USDBRL.pctChange));
        set("eur", `R$ ${fmt(+j.EURBRL.bid, 2)}`, parseFloat(j.EURBRL.pctChange));
        set("btc", `R$ ${fmt(+j.BTCBRL.bid, 0)}`, parseFloat(j.BTCBRL.pctChange));
      } catch {}
    }
    carregar();
    const t = setInterval(carregar, 5 * 60 * 1000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, []);

  const linha = (sufixo: string) => (
    <>
      {itens.map((i) => (
        <span className="mq-i" key={i.chave + sufixo}>
          <span className="mq-l">{i.rotulo}</span>
          <span className={i.ouro ? "mq-v mq-g" : "mq-v"}>{i.valor}</span>
          {i.variacao !== undefined && !Number.isNaN(i.variacao) && (
            <span className={i.variacao >= 0 ? "mq-u" : "mq-d"}>
              {i.variacao >= 0 ? "▲" : "▼"} {fmt(Math.abs(i.variacao), 2)}%
            </span>
          )}
        </span>
      ))}
      <span className="mq-i mq-s">
        fontes: Banco Central (SGS) · AwesomeAPI · dados com atraso, não em tempo real
      </span>
    </>
  );

  return (
    <div className="mq" aria-label="Indicadores e cotações com atraso, não em tempo real">
      <div className="mq-t">
        {linha("a")}
        {linha("b")}
      </div>
    </div>
  );
}
