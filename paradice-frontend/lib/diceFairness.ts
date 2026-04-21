import { DiceHistoryRoll } from "@/lib/diceRealtimeApi";

const textEncoder = new TextEncoder();

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(input));
  return toHex(new Uint8Array(digest));
}

export async function verifyDiceRoll(
  serverSeed: string,
  roll: DiceHistoryRoll,
): Promise<{ hashMatches: boolean; diceMatches: boolean }> {
  const computedHash = await sha256Hex(`${serverSeed}${roll.player_seed}${roll.nonce}`);
  const hashMatches = computedHash === roll.result_hash;
  const intValue = parseInt(computedHash.slice(0, 8), 16);
  const computedDice = (intValue % 6) + 1;
  const diceMatches = computedDice === roll.dice_value;

  return { hashMatches, diceMatches };
}
