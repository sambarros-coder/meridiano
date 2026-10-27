export default function AdSlot({
  rotulo,
  largura,
  altura,
}: {
  rotulo: string;
  largura: number;
  altura: number;
}) {
  return (
    <div
      className="ad"
      style={{ width: largura, maxWidth: "100%", height: altura }}
      aria-label="Espaço publicitário"
    >
      Publicidade · {rotulo}
    </div>
  );
}
