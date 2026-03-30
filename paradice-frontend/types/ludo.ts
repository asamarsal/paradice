// ─── Types ───────────────────────────────────────────────────────────────────

export type PlayerColor = "red" | "green" | "yellow" | "blue";
export type PawnStatus = "base" | "active" | "home_lane" | "finished";
export type PlayerType = "human" | "bot" | "none";
export type BoardSlot = "TL" | "TR" | "BL" | "BR";
export type GameMode = "2player" | "4player";

export interface Pawn {
    id: string;
    owner: PlayerColor;
    status: PawnStatus;
    position: number | null;
    steps: number;
}

export interface GameState {
    pawns: Pawn[];
    currentPlayer: PlayerColor;
    diceValue: number | null;
    diceRolled: boolean;
    selectedPawnId: string | null;
    phase: "waiting_roll" | "waiting_move" | "bot_thinking" | "bot_moving" | "game_over";
    winner: PlayerColor | null;
    message: string;
}

export interface SlotConfig {
    slot: BoardSlot;
    color: PlayerColor;
    type: PlayerType;
    active: boolean;
    label: string;
}

export interface PathConfig {
    startCell: number;
    homeEntry: number;
    homeLane: number[];
    finalCell: number;
    totalSteps: number;
    startOffset: number;
}

// ─── Fixed Board Geometry ────────────────────────────────────────────────────
const cell = (col: number, row: number): [number, number] => [col * 10 + 5, row * 10 + 5];

// Cell coordinates (1-76) mapped to SVG positions
export const CELL_COORDS: Record<number, [number, number]> = {
    // Bottom corridor (col 6-8, rows 9-14)
    1: cell(6, 14), 2: cell(7, 14), 3: cell(8, 14),
    4: cell(8, 13), 5: cell(8, 12), 6: cell(8, 11), 7: cell(8, 10), 8: cell(8, 9),
    // Right corridor (cols 9-14, rows 6-8)
    9: cell(9, 8), 10: cell(10, 8), 11: cell(11, 8), 12: cell(12, 8), 13: cell(13, 8), 14: cell(14, 8),
    15: cell(14, 7), 16: cell(14, 6),
    17: cell(13, 6), 18: cell(12, 6), 19: cell(11, 6), 20: cell(10, 6), 21: cell(9, 6),
    // Top corridor (col 6-8, rows 0-5)
    22: cell(8, 5), 23: cell(8, 4), 24: cell(8, 3), 25: cell(8, 2), 26: cell(8, 1), 27: cell(8, 0),
    28: cell(7, 0), 29: cell(6, 0),
    30: cell(6, 1), 31: cell(6, 2), 32: cell(6, 3), 33: cell(6, 4), 34: cell(6, 5),
    // Left corridor (cols 0-5, rows 6-8)
    35: cell(5, 6), 36: cell(4, 6), 37: cell(3, 6), 38: cell(2, 6), 39: cell(1, 6), 40: cell(0, 6),
    41: cell(0, 7), 42: cell(0, 8),
    43: cell(1, 8), 44: cell(2, 8), 45: cell(3, 8), 46: cell(4, 8), 47: cell(5, 8),
    // Bottom corridor return (col 6, rows 9-13)
    48: cell(6, 9), 49: cell(6, 10), 50: cell(6, 11), 51: cell(6, 12), 52: cell(6, 13),
    // Home Lanes
    53: cell(7, 13), 54: cell(7, 12), 55: cell(7, 11), 56: cell(7, 10), 57: cell(7, 9), 58: cell(7, 8),  // Red/Blue bottom→center
    59: cell(13, 7), 60: cell(12, 7), 61: cell(11, 7), 62: cell(10, 7), 63: cell(9, 7), 64: cell(8, 7),  // Blue/Yellow right→center
    65: cell(7, 1), 66: cell(7, 2), 67: cell(7, 3), 68: cell(7, 4), 69: cell(7, 5), 70: cell(7, 6),      // Yellow/Green top→center
    71: cell(1, 7), 72: cell(2, 7), 73: cell(3, 7), 74: cell(4, 7), 75: cell(5, 7), 76: cell(6, 7),      // Green/Red left→center
};

export const MAIN_TRACK = [
    2, 1, 52, 51, 50, 49, 48, 47, 46, 45,
    44, 43, 42, 40, 39, 38, 37, 36, 35, 34,
    33, 32, 31, 30, 29, 28, 27, 26, 25, 24,
    23, 22, 21, 20, 19, 18, 17, 16, 15, 14,
    13, 12, 11, 10, 9, 8, 7, 6, 5, 4,
    3
];

export const SAFE_ZONES = new Set([2, 5, 9, 15, 18, 22, 28, 31, 34, 39, 41, 44, 54, 59]);

// ─── Fixed path data per board slot ──────────────────────────────────────────
// startCell = cell to the RIGHT of the base entrance (where pawn exits on 6)
// homeEntry = last cell on main track before entering home lane
// startOffset = index of startCell in MAIN_TRACK
export const SLOT_PATHS: Record<BoardSlot, PathConfig> = {
    TL: { startCell: 39, homeEntry: 40, homeLane: [71, 72, 73, 74, 75, 76], finalCell: 76, totalSteps: 57, startOffset: 14 },
    TR: { startCell: 26, homeEntry: 27, homeLane: [65, 66, 67, 68, 69, 70], finalCell: 70, totalSteps: 57, startOffset: 27 },
    BL: { startCell: 52, homeEntry: 1, homeLane: [53, 54, 55, 56, 57, 58], finalCell: 58, totalSteps: 57, startOffset: 2 },
    BR: { startCell: 13, homeEntry: 14, homeLane: [59, 60, 61, 62, 63, 64], finalCell: 64, totalSteps: 57, startOffset: 40 },
};

// Home base pawn positions (SVG coords for the 4 slots inside each base)
export const SLOT_HOME: Record<BoardSlot, [number, number][]> = {
    TL: [[20, 20], [40, 20], [20, 40], [40, 40]],
    TR: [[110, 20], [130, 20], [110, 40], [130, 40]],
    BL: [[20, 110], [40, 110], [20, 130], [40, 130]],
    BR: [[110, 110], [130, 110], [110, 130], [130, 130]],
};

// ─── Mode configurations ─────────────────────────────────────────────────────
export const MODE_2P: SlotConfig[] = [
    { slot: "TL", color: "red", type: "none", active: false, label: "" },
    { slot: "TR", color: "green", type: "bot", active: true, label: "Bot" },
    { slot: "BL", color: "blue", type: "human", active: true, label: "You" },
    { slot: "BR", color: "yellow", type: "none", active: false, label: "" },
];

export const MODE_4P: SlotConfig[] = [
    { slot: "TL", color: "blue", type: "bot", active: true, label: "Bot1" },
    { slot: "TR", color: "red", type: "bot", active: true, label: "Bot2" },
    { slot: "BL", color: "yellow", type: "human", active: true, label: "You" },
    { slot: "BR", color: "green", type: "bot", active: true, label: "Bot3" },
];

// ─── Config builder ──────────────────────────────────────────────────────────
export interface BuiltGameConfig {
    players: SlotConfig[];
    config: Record<PlayerColor, PathConfig>;
    startOffset: Record<PlayerColor, number>;
    homePositions: Record<PlayerColor, [number, number][]>;
    turnOrder: PlayerColor[];
}

export function buildGameConfig(mode: GameMode): BuiltGameConfig {
    const slots = mode === "2player" ? MODE_2P : MODE_4P;
    const config = {} as Record<PlayerColor, PathConfig>;
    const startOffset = {} as Record<PlayerColor, number>;
    const homePositions = {} as Record<PlayerColor, [number, number][]>;
    const turnOrder: PlayerColor[] = [];

    // Turn order follows slot order: TL → TR → BL → BR (clockwise-ish)
    const slotOrder: BoardSlot[] = ["TL", "TR", "BR", "BL"]; // clockwise
    for (const s of slotOrder) {
        const sc = slots.find(sl => sl.slot === s)!;
        const path = SLOT_PATHS[sc.slot];
        config[sc.color] = path;
        startOffset[sc.color] = path.startOffset;
        homePositions[sc.color] = SLOT_HOME[sc.slot];
        if (sc.active) turnOrder.push(sc.color);
    }

    return { players: slots, config, startOffset, homePositions, turnOrder };
}
