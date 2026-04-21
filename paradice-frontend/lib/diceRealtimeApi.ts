export type DiceCommitResponse = {
  room_id: string;
  server_seed_hash: string;
  nonce: number;
  status: "committed" | "revealed" | string;
  reused: boolean;
};

export type DicePlayerSeedResponse = {
  room_id: string;
  player_key: string;
  player_seed: string;
  server_seed_hash: string;
};

export type DiceRollResponse = {
  room_id: string;
  player_key: string;
  server_seed_hash: string;
  nonce: number;
  result_hash: string;
  dice_value: number;
};

export type DiceRevealResponse = {
  room_id: string;
  server_seed: string;
  server_seed_hash: string;
  final_nonce: number;
  status: "revealed" | string;
  revealed_at: string | null;
};

export type DiceHistoryRoll = {
  nonce: number;
  player_seed: string;
  result_hash: string;
  dice_value: number;
  server_seed_hash: string;
  created_at: string | null;
};

export type DiceHistoryResponse = {
  room_id: string;
  status: "committed" | "revealed" | string | null;
  nonce: number;
  server_seed_hash: string | null;
  rolls: DiceHistoryRoll[];
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

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
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function commitDiceRoom(roomId: string): Promise<DiceCommitResponse> {
  return readJson<DiceCommitResponse>(`/api/realtime/rooms/${encodeURIComponent(roomId)}/commit`, {
    method: "POST",
  });
}

export async function getDiceRoomHistory(roomId: string): Promise<DiceHistoryResponse> {
  return readJson<DiceHistoryResponse>(`/api/realtime/rooms/${encodeURIComponent(roomId)}/history`, {
    method: "GET",
  });
}

export async function registerDicePlayerSeed(
  roomId: string,
  playerKey: string,
  playerSeed?: string,
): Promise<DicePlayerSeedResponse> {
  return readJson<DicePlayerSeedResponse>(`/api/realtime/rooms/${encodeURIComponent(roomId)}/player-seed`, {
    method: "POST",
    body: JSON.stringify({
      player_key: playerKey,
      player_seed: playerSeed,
    }),
  });
}

export async function rollDiceFromServer(roomId: string, playerKey: string): Promise<DiceRollResponse> {
  return readJson<DiceRollResponse>(`/api/realtime/rooms/${encodeURIComponent(roomId)}/roll`, {
    method: "POST",
    body: JSON.stringify({
      player_key: playerKey,
    }),
  });
}

export async function revealDiceRoom(roomId: string): Promise<DiceRevealResponse> {
  return readJson<DiceRevealResponse>(`/api/realtime/rooms/${encodeURIComponent(roomId)}/reveal`, {
    method: "POST",
  });
}
