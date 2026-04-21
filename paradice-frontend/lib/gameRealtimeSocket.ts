export type DiceRealtimeEnvelope = {
  event?: string;
  type?: string;
  room_id?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

export type DiceRealtimeListener = (eventName: string, payload: Record<string, unknown>) => void;

const WS_BASE_URL = process.env.NEXT_PUBLIC_GAME_WS_URL;

export function connectGameRealtime(roomId: string, listener: DiceRealtimeListener): () => void {
  if (!WS_BASE_URL || typeof window === "undefined" || typeof window.WebSocket === "undefined") {
    return () => {};
  }

  const separator = WS_BASE_URL.includes("?") ? "&" : "?";
  const wsUrl = `${WS_BASE_URL}${separator}room_id=${encodeURIComponent(roomId)}`;
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (messageEvent) => {
    let parsed: DiceRealtimeEnvelope | null = null;

    try {
      parsed = JSON.parse(String(messageEvent.data)) as DiceRealtimeEnvelope;
    } catch {
      return;
    }

    const eventName = parsed?.event ?? parsed?.type;
    if (!eventName || typeof eventName !== "string") {
      return;
    }

    const payloadSource = (parsed.data && typeof parsed.data === "object") ? parsed.data : parsed;
    const payload = payloadSource as Record<string, unknown>;
    const payloadRoomId = payload.room_id;

    if (typeof payloadRoomId === "string" && payloadRoomId !== roomId) {
      return;
    }

    listener(eventName, payload);
  };

  return () => {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };
}
