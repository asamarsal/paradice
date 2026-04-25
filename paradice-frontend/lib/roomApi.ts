const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type RoomPlayer = {
  user_id: string;
  username: string;
  wallet_address: string;
  seat_position: number;
  joined_at: string | null;
};

export type RoomDetail = {
  room_code: string;
  entry_fee: number;
  max_players: 2 | 4;
  is_private: boolean;
  creator_wallet_address: string;
  status: string;
  expires_at: string | null;
  created_at: string | null;
  players: RoomPlayer[];
};

export type RoomListItem = {
  room_code: string;
  entry_fee: number;
  max_players: 2 | 4;
  is_private: boolean;
  status: string;
  player_count: number;
  expires_at: string | null;
  created_at: string | null;
};

export type CreateRoomInput = {
  walletAddress: string;
  username?: string;
  entryFee: number;
  maxPlayers: 2 | 4;
  isPrivate: boolean;
  password?: string;
};

export type JoinRoomInput = {
  roomCode: string;
  walletAddress: string;
  username?: string;
  password?: string;
};

export type RoomVisibility = "all" | "public" | "private";

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

export async function createRoom(input: CreateRoomInput): Promise<RoomDetail> {
  return readJson<RoomDetail>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({
      wallet_address: input.walletAddress,
      username: input.username,
      entry_fee: input.entryFee,
      max_players: input.maxPlayers,
      is_private: input.isPrivate,
      password: input.password,
    }),
  });
}

export async function getRoomDetail(roomCode: string): Promise<RoomDetail> {
  return readJson<RoomDetail>(`/api/rooms/${encodeURIComponent(roomCode)}`, {
    method: "GET",
  });
}

export async function joinRoom(input: JoinRoomInput): Promise<RoomDetail> {
  return readJson<RoomDetail>(`/api/rooms/${encodeURIComponent(input.roomCode)}/join`, {
    method: "POST",
    body: JSON.stringify({
      wallet_address: input.walletAddress,
      username: input.username,
      password: input.password,
    }),
  });
}

export async function listRooms(visibility: RoomVisibility = "all"): Promise<RoomListItem[]> {
  const response = await readJson<{ rooms: RoomListItem[] }>(`/api/rooms?visibility=${encodeURIComponent(visibility)}`, {
    method: "GET",
  });

  return response.rooms;
}
