import { coletar } from "@/lib/coleta";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Chamada pelo agendador da Supabase a cada 30 minutos, com o segredo no cabeçalho.
async function tratar(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  try {
    return Response.json(await coletar());
  } catch (e) {
    return Response.json({ erro: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export const GET = tratar;
export const POST = tratar;
