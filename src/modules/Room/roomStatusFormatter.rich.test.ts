import { describe, expect, it } from "vitest";
import { buildRoomStatusDashboardMessages } from "./roomStatusFormatter";

describe("buildRoomStatusDashboardMessages", () => {
  it("ダッシュボードFlexとQuickReplyテキストを生成する", () => {
    const messages = buildRoomStatusDashboardMessages({
      roomCode: "654321",
      status: "day2night",
      totalCount: 8,
      aliveCount: 6,
      connectionCount: 8,
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.type).toBe("flex");
    expect(messages[0]?.altText).toContain("654321");
    expect(messages[1]?.type).toBe("text");
    expect(messages[1]?.quickReply?.items?.length).toBeGreaterThan(0);
  });

  it("更新ボタンがpostback actionを持つ", () => {
    const messages = buildRoomStatusDashboardMessages({
      roomCode: "654321",
      status: "initialized",
      totalCount: 0,
      aliveCount: 0,
      connectionCount: 0,
    });

    const refreshButton = messages[0]?.contents?.footer?.contents?.[0];
    expect(refreshButton?.action?.type).toBe("postback");
    expect(refreshButton?.action?.data).toContain("cmd=");
  });
});
