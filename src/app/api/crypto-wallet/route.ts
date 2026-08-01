import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WalletResult {
  address: string;
  blockchain: string;
  balance: number | null;
  totalReceived: number | null;
  totalSent: number | null;
  txCount: number | null;
  transactions: Array<{
    txid: string;
    amount: number;
    time: number;
    type: string;
  }>;
  error?: string;
}

function sanitizeAddress(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Bitcoin addresses: start with 1, 3, or bc1
  if (/^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(trimmed)) return trimmed;
  // Ethereum addresses: start with 0x + 40 hex chars
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return trimmed;
  return null;
}

function detectBlockchain(address: string): string {
  if (/^(1|3|bc1)/.test(address)) return "bitcoin";
  if (/^0x/.test(address)) return "ethereum";
  return "unknown";
}

export async function GET(req: NextRequest) {
  const rawAddress = req.nextUrl.searchParams.get("address") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";
  const address = sanitizeAddress(rawAddress);

  if (!address) {
    return NextResponse.json({ error: "Invalid wallet address. Supports Bitcoin (1..., 3..., bc1...) and Ethereum (0x...)." }, { status: 400 });
  }

  const cacheKey = `crypto-wallet:${address}`;
  if (!skipCache) {
    const cached = cacheGet<WalletResult>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  const blockchain = detectBlockchain(address);
  const result: WalletResult = {
    address, blockchain,
    balance: null, totalReceived: null, totalSent: null,
    txCount: null, transactions: [],
  };

  try {
    if (blockchain === "bitcoin") {
      // Blockchain.com API (free, no key)
      const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=10`, {
        headers: { "User-Agent": "OSINT-Toolkit/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`Blockchain.com API returned HTTP ${res.status}`);
      const data = await res.json() as Record<string, unknown>;
      result.balance = (data.final_balance as number) / 1e8;
      result.totalReceived = (data.total_received as number) / 1e8;
      result.totalSent = (data.total_sent as number) / 1e8;
      result.txCount = data.n_tx as number;
      result.transactions = ((data.txs as Array<Record<string, unknown>>) || []).slice(0, 10).map((tx) => {
        const inputs = (tx.inputs as Array<Record<string, unknown>>) || [];
        const outputs = (tx.out as Array<Record<string, unknown>>) || [];
        const isSent = inputs.some((inp) => {
          const prev = inp.prev_out as Record<string, unknown> | undefined;
          return prev?.addr === address;
        });
        const amount = (isSent ? outputs : inputs).reduce((sum, o) => {
          const val = isSent ? (o as Record<string, unknown>).value : ((o as Record<string, unknown>).prev_out as Record<string, unknown> | undefined)?.value;
          return sum + ((val as number) || 0);
        }, 0) / 1e8;
        return {
          txid: tx.hash as string,
          amount,
          time: tx.time as number,
          type: isSent ? "sent" : "received",
        };
      });
    } else if (blockchain === "ethereum") {
      // Blockscout API (free, no key)
      const res = await fetch(
        `https://eth.blockscout.com/api/v2/addresses/${address}`,
        { headers: { "User-Agent": "OSINT-Toolkit/1.0" }, signal: AbortSignal.timeout(10000) },
      );
      if (!res.ok) throw new Error(`Blockscout API returned HTTP ${res.status}`);
      const data = await res.json() as Record<string, unknown>;
      const stats = (data.coin_balance as string);
      result.balance = stats ? parseFloat(stats) / 1e18 : null;
      result.txCount = (data.transactions_count as number) || null;

      // Fetch recent transactions
      const txRes = await fetch(
        `https://eth.blockscout.com/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`,
        { headers: { "User-Agent": "OSINT-Toolkit/1.0" }, signal: AbortSignal.timeout(10000) },
      );
      if (txRes.ok) {
        const txData = await txRes.json() as Record<string, unknown>;
        result.transactions = ((txData.items as Array<Record<string, unknown>>) || []).slice(0, 10).map((tx) => ({
          txid: tx.hash as string,
          amount: parseFloat((tx.value as string) || "0") / 1e18,
          time: tx.timestamp ? new Date(tx.timestamp as string).getTime() / 1000 : 0,
          type: (tx.from?.hash as string) === address ? "sent" : "received",
        }));
      }
    }

    cacheSet(cacheKey, result, 10 * 60 * 1000);
    return NextResponse.json({ ...result, cached: false });
  } catch (e) {
    result.error = (e as Error).message;
    return NextResponse.json(result, { status: 500 });
  }
}
