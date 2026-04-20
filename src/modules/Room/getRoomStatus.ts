import { eq, sql } from "drizzle-orm";
import { createDb } from "../../db/client";
import { connectedUsers, rooms } from "../../db/schema";
import { buildRoomStatusDashboardMessages } from "./roomStatusFormatter";

interface LineMessage {
  type: string;
  text: string;
}

interface LineEvent {
  type: string;
  message: LineMessage;
  source: {
    userId: string;
    type: string;
  };
}

interface WebhookData {
  events: LineEvent[];
}

interface Env {
  ACCESS_TOKEN: string;
  D1_DATABASE: D1Database;
}

export async function getRoomStatus(data: WebhookData, request: Request, env: Env): Promise<any[]> {
  const userId = data.events?.[0]?.source?.userId;
  if (!userId) {
    return [{ type: "text", text: "ユーザー情報を取得できませんでした。" }];
  }

  const db = createDb(env);

  const [currentUser] = await db
    .select({ roomCode: connectedUsers.roomCode })
    .from(connectedUsers)
    .where(eq(connectedUsers.connectedUserId, userId))
    .limit(1);

  if (!currentUser) {
    return [{ type: "text", text: "どのルームにも参加していません。" }];
  }

  const [room] = await db
    .select({
      roomCode: rooms.roomCode,
      status: rooms.status,
      connectionCount: rooms.connectionCount,
    })
    .from(rooms)
    .where(eq(rooms.roomCode, currentUser.roomCode))
    .limit(1);

  if (!room) {
    return [{ type: "text", text: "ルーム情報が見つかりませんでした。" }];
  }

  const [counts] = await db
    .select({
      total: sql<number>`count(*)`,
      alive: sql<number>`sum(case when ${connectedUsers.status} = 'alive' then 1 else 0 end)`,
    })
    .from(connectedUsers)
    .where(eq(connectedUsers.roomCode, room.roomCode));

  return buildRoomStatusDashboardMessages({
    roomCode: room.roomCode,
    status: room.status,
    totalCount: Number(counts?.total ?? 0),
    aliveCount: Number(counts?.alive ?? 0),
    connectionCount: Number(room.connectionCount ?? 0),
  });
}
