import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TraceResult {
  address: string;
  blockchain: string;
  txCount: number;
  transactions: Array<{
    txid: string;
    from: string;
    to: string;
    amount: number;
    time: number;
    type: string;
  }>;
  error?: string;
}

function sanitizeAddress(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(trimmed)) return trimmed;
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return trimmed;
  return null;
}

export async function GET(req: NextRequest) {
  const rawAddress = req.nextUrl.searchParams.get("address") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";
  const address = sanitizeAddress(rawAddress);

  if (!address) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  const cacheKey = `tx-tracer:${address}`;
  if (!skipCache) {
    const cached = cacheGet<TraceResult>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  const blockchain = address.startsWith("0x") ? "ethereum" : "bitcoin";
  const result: TraceResult = { address, blockchain, txCount: 0, transactions: [] };

  try {
    if (blockchain === "bitcoin") {
      const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=20`, {
        headers: { "User-Agent": "OSINT-Toolkit/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
      const data = await res.json() as Record<string, unknown>;
      result.txCount = data.n_tx as number;
      result.transactions = ((data.txs as Array<Record<string, unknown>>) || []).slice(0, 20).map((tx) => {
        const inputs = (tx.inputs as Array<Record<string, unknown>>) || [];
        const outputs = (tx.out as Array<Record<string, unknown>>) || [];
        const fromAddr = ((inputs[0]?.prev_out as Record<string, unknown>)?.addr as string) || "unknown";
        const toAddr = ((outputs[0]?.addr as string) || "unknown");
        const isSent = fromAddr === address;
        const amount = ((isSent ? outputs : inputs).reduce((sum, o) => {
          const val = isSent ? (o as Record<string, unknown>).value : ((o as Record<string, unknown>).prev_out as Record<string, unknown>)?.value;
          return sum + ((val as number) || 0);
        }, 0)) / 1e8;
        return {
          txid: tx.hash as string, from: fromAddr, to: toAddr,
          amount, time: tx.time as number, type: isSent ? "sent" : "received",
        };
      });
    } else {
      const res = await fetch(
        `https://eth.blockscout.com/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`,
        { headers: { "User-Agent": "OSINT-Toolkit/1.0" }, signal: AbortSignal.timeout(10000) },
      );
      if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
      const data = await res.json() as Record<string, unknown>;
      result.txCount = (data.items?.length as number) || 0;
      result.transactions = ((data.items as Array<Record<string, unknown>>) || []).slice(0, 20).map((tx) => ({
        txid: tx.hash as string,
        from: (tx.from?.hash as string) || "unknown",
        to: (tx.to?.hash as string) || "unknown",
        amount: parseFloat((tx.value as string) || "0") / 1e18,
        time: tx.timestamp ? new Date(tx.timestamp as string).getTime() / 1000 : 0,
        type: (tx.from?.hash as string) === address ? "sent" : "received",
      }));
    }

    cacheSet(cacheKey, result, 10 * 60 * 1000);
    return NextResponse.json({ ...result, cached: false });
  } catch (e) {
    result.error = (e as Error).message;
    return NextResponse.json(result, { status: 500 });
  }
}
