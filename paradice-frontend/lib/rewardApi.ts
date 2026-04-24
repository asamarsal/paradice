const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type ClaimWinnerNftInput = {
  walletAddress: string;
  username?: string;
  sessionRef: string;
  mode: "2player" | "4player";
  stakeUsd: number;
  playerWon: boolean;
};

export type ClaimWinnerNftResponse = {
  message: string;
  claimed: boolean;
  already_claimed: boolean;
  claim_ref: string;
  wallet_address: string;
  mint_tx_hash: string;
  claimed_at: string | null;
  nft: {
    id: string | null;
    contract_address: string | null;
    token_id: number | null;
    token_standard: string | null;
  };
};

async function readJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message || `Request failed with status ${response.status}`);
    } catch {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
  }

  return response.json() as Promise<T>;
}

export async function claimWinnerNft(input: ClaimWinnerNftInput): Promise<ClaimWinnerNftResponse> {
  return readJson<ClaimWinnerNftResponse>("/api/rewards/winner-nft/claim", {
    method: "POST",
    body: JSON.stringify({
      wallet_address: input.walletAddress,
      username: input.username,
      session_ref: input.sessionRef,
      mode: input.mode,
      stake_usd: input.stakeUsd,
      player_won: input.playerWon,
    }),
  });
}
