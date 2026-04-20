import { describe, expect, it } from "vitest";
import { buildRoomStatusMessages, describeRoomPhase } from "./roomStatusFormatter";

describe("describeRoomPhase", () => {
  it("initialized を準備中と表示する", () => {
    expect(describeRoomPhase("initialized")).toBe("準備中");
  });

  it("day1night を1日目の夜と表示する", () => {
    expect(describeRoomPhase("day1night")).toBe("1日目の夜");
  });

  it("night を含む状態を夜フェーズとして表示する", () => {
    expect(describeRoomPhase("day2night")).toBe("夜フェーズ (day2night)");
  });
});

describe("buildRoomStatusMessages", () => {
  it("ステータスメッセージを3件生成する", () => {
    const messages = buildRoomStatusMessages({
      roomCode: "123456",
      status: "day1night",
      totalCount: 6,
      aliveCount: 5,
      connectionCount: 6,
    });

    expect(messages).toHaveLength(3);
    expect(messages[0]?.text).toContain("123456");
    expect(messages[1]?.text).toContain("1日目の夜");
    expect(messages[2]?.text).toContain("生存 5人");
  });
});
