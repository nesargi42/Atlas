import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const summary = {
    ok: true,
    mockMode: env.MOCK_MODE === "true",
    providers: {
      fmp: Boolean(env.FMP_API_KEY),
      alphaVantage: Boolean(env.ALPHAVANTAGE_API_KEY),
      eodhd: Boolean(env.EODHD_API_TOKEN),
      ctgov: env.CTGOV_BASE,
      chembl: env.CHEMBL_BASE,
      nihReporter: env.NIH_REPORTER_BASE,
      ai: Boolean(env.AI_API_KEY),
    }
  };
  return NextResponse.json(summary);
}

