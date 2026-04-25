const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type StartGameSessionInput = {
  sessionRef: string;
  roomCode?: string;
  creatorWalletAddress: string;
  mode: "2player" | "4player";
  stakeUsd: number;
  stakeUnits: number;
  maxPlayers: 2 | 4;
  chainId: string;
  moduleAddress: string;
  createGameTxHash: string;
};

export type FinishGameSessionInput = {
  sessionRef: string;
  settleTxHash: string;
};

export type GameSessionResponse = {
  session_ref: string;
  room_id: string | null;
  creator_wallet_address: string;
  status: "started" | "finished" | string;
  verification_status: "pending" | "verified" | "failed" | string;
  verification_reason: string | null;
  mode: "2player" | "4player";
  stake_usd: number;
  stake_units: number;
  max_players: 2 | 4;
  chain_id: string;
  module_address: string;
  create_game_tx_hash: string;
  winner_wallet_address: string | null;
  settle_tx_hash: string | null;
  finished_at: string | null;
  verified_at: string | null;
  created_at: string | null;
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

export async function startGameSession(input: StartGameSessionInput): Promise<GameSessionResponse> {
  return readJson<GameSessionResponse>("/api/game-sessions/start", {
    method: "POST",
    body: JSON.stringify({
      session_ref: input.sessionRef,
      room_code: input.roomCode,
      creator_wallet_address: input.creatorWalletAddress,
      mode: input.mode,
      stake_usd: input.stakeUsd,
      stake_units: input.stakeUnits,
      max_players: input.maxPlayers,
      chain_id: input.chainId,
      module_address: input.moduleAddress,
      create_game_tx_hash: input.createGameTxHash,
    }),
  });
}

export async function finishGameSession(input: FinishGameSessionInput): Promise<GameSessionResponse> {
  return readJson<GameSessionResponse>(`/api/game-sessions/${encodeURIComponent(input.sessionRef)}/finish`, {
    method: "POST",
    body: JSON.stringify({
      settle_tx_hash: input.settleTxHash,
    }),
  });
}
