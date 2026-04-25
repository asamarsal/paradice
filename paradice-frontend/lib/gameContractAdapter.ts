import { GameMode } from "@/types/ludo";

export const TEST_USD_TO_CHAIN_UNITS = 1_000_000;
export const DEFAULT_MOVE_MODULE_NAME = "game_core";
export const DEFAULT_MOVE_FUNCTION_NAME = "create_game";

export type MoveFunctionName = "create_game" | "join_game" | "roll_dice" | "move_pawn";

export type MovePayload = {
  moduleAddress: string;
  moduleName: string;
  functionName: MoveFunctionName;
  typeArgs: [];
  args: Array<string | number>;
};

export type CreateGameMovePayload = MovePayload & {
  functionName: "create_game";
  args: [stake: number, maxPlayers: 2 | 4];
};

export type ExecuteMoveTx = (payload: MovePayload) => Promise<{ txHash: string }>;

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

export function getConfiguredMoveModuleAddress(): string {
  return (process.env.NEXT_PUBLIC_MOVE_MODULE_ADDRESS ?? "paradice_ludo").trim();
}

export function buildCreateGamePayload(mode: GameMode, stakeUsd: number): CreateGameMovePayload {
  const maxPlayers = modeToMaxPlayers(mode);
  const stakeUnits = usdToChainStakeUnits(stakeUsd);

  return {
    moduleAddress: getConfiguredMoveModuleAddress(),
    moduleName: DEFAULT_MOVE_MODULE_NAME,
    functionName: DEFAULT_MOVE_FUNCTION_NAME,
    typeArgs: [],
    args: [stakeUnits, maxPlayers],
  };
}

export function createSessionRef(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function roomCodeToSessionRef(roomCode: string): string {
  const normalized = roomCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `room-${normalized}`;
}

export function buildJoinGamePayload(gameCreatorAddress: string): MovePayload {
  return {
    moduleAddress: getConfiguredMoveModuleAddress(),
    moduleName: DEFAULT_MOVE_MODULE_NAME,
    functionName: "join_game",
    typeArgs: [],
    args: [gameCreatorAddress],
  };
}

export function buildRollDicePayload(gameOwnerAddress: string): MovePayload {
  return {
    moduleAddress: getConfiguredMoveModuleAddress(),
    moduleName: DEFAULT_MOVE_MODULE_NAME,
    functionName: "roll_dice",
    typeArgs: [],
    args: [gameOwnerAddress],
  };
}

export function buildMovePawnPayload(gameOwnerAddress: string, pawnIndex: number): MovePayload {
  return {
    moduleAddress: getConfiguredMoveModuleAddress(),
    moduleName: DEFAULT_MOVE_MODULE_NAME,
    functionName: "move_pawn",
    typeArgs: [],
    args: [gameOwnerAddress, pawnIndex],
  };
}

export async function createGameSession(
  mode: GameMode,
  stakeUsd: number,
  executeMoveTx: ExecuteMoveTx,
  sessionRefOverride?: string,
): Promise<CreateGameSessionResult> {
  const payload = buildCreateGamePayload(mode, stakeUsd);
  const sessionRef = sessionRefOverride ?? createSessionRef();
  const tx = await executeMoveTx(payload);
  const txHash = tx.txHash.trim();

  return {
    sessionRef,
    txHash,
    stakeUnits: payload.args[0],
    maxPlayers: payload.args[1],
    payload,
  };
}
