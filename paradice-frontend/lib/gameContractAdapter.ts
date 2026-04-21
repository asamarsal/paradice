import { GameMode } from "@/types/ludo";

export const TEST_USD_TO_CHAIN_UNITS = 1_000_000;

export type CreateGameMovePayload = {
  moduleAddress: "paradice_ludo";
  moduleName: "game_core";
  functionName: "create_game";
  typeArgs: [];
  args: [stake: number, maxPlayers: 2 | 4];
};

export type CreateGameSessionResult = {
  sessionRef: string;
  txHash: string;
  stakeUnits: number;
  maxPlayers: 2 | 4;
  payload: CreateGameMovePayload;
};

export function modeToMaxPlayers(mode: GameMode): 2 | 4 {
  return mode === "2player" ? 2 : 4;
}

export function usdToChainStakeUnits(usd: number): number {
  const normalized = Math.max(usd, 0);
  return Math.max(1, Math.round(normalized * TEST_USD_TO_CHAIN_UNITS));
}

export function buildCreateGamePayload(mode: GameMode, stakeUsd: number): CreateGameMovePayload {
  const maxPlayers = modeToMaxPlayers(mode);
  const stakeUnits = usdToChainStakeUnits(stakeUsd);

  return {
    moduleAddress: "paradice_ludo",
    moduleName: "game_core",
    functionName: "create_game",
    typeArgs: [],
    args: [stakeUnits, maxPlayers],
  };
}

function createSessionRef(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Temporary mock adapter. Replace internals with real wallet tx call later.
export async function createGameSession(mode: GameMode, stakeUsd: number): Promise<CreateGameSessionResult> {
  const payload = buildCreateGamePayload(mode, stakeUsd);

  await new Promise((resolve) => setTimeout(resolve, 280));

  const sessionRef = createSessionRef();
  const txHash = `0xmock${Math.random().toString(16).slice(2, 12)}`;

  return {
    sessionRef,
    txHash,
    stakeUnits: payload.args[0],
    maxPlayers: payload.args[1],
    payload,
  };
}
