import { getStatusRefreshPostback } from "../ui/lineRichUi";

export interface RoomStatusSummary {
  roomCode: string;
  status: string;
  totalCount: number;
  aliveCount: number;
  connectionCount: number;
}

export function describeRoomPhase(status: string): string {
  if (status === "initialized") {
    return "準備中";
  }
  if (status === "day1night") {
    return "1日目の夜";
  }
  if (status.includes("night")) {
    return `夜フェーズ (${status})`;
  }
  if (status.includes("day")) {
    return `昼フェーズ (${status})`;
  }
  return status;
}

export function buildRoomStatusMessages(summary: RoomStatusSummary): Array<{ type: "text"; text: string }> {
  const phase = describeRoomPhase(summary.status);

  return [
    { type: "text", text: `ルームコード: ${summary.roomCode}` },
    { type: "text", text: `現在の状態: ${phase}` },
    {
      type: "text",
      text: `参加者: ${summary.totalCount}人 (生存 ${summary.aliveCount}人 / 接続数 ${summary.connectionCount}人)`,
    },
  ];
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

export function buildRoomStatusDashboardMessages(summary: RoomStatusSummary): Array<Record<string, any>> {
  const phase = describeRoomPhase(summary.status);
  const aliveRate = summary.totalCount > 0 ? Math.round((summary.aliveCount / summary.totalCount) * 100) : 0;
  const gaugePercent = clampPercent(aliveRate);

  return [
    {
      type: "flex",
      altText: `ルーム ${summary.roomCode} の状態`,
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#1F2937",
          contents: [
            {
              type: "text",
              text: "ROOM DASHBOARD",
              color: "#FFFFFF",
              weight: "bold",
              size: "md",
            },
            {
              type: "text",
              text: `Code ${summary.roomCode}`,
              color: "#D1D5DB",
              size: "xs",
              margin: "sm",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "box",
              layout: "baseline",
              contents: [
                { type: "text", text: "現在フェーズ", size: "sm", color: "#6B7280", flex: 3 },
                { type: "text", text: phase, size: "sm", color: "#111827", flex: 5, wrap: true },
              ],
            },
            {
              type: "box",
              layout: "baseline",
              contents: [
                { type: "text", text: "参加者", size: "sm", color: "#6B7280", flex: 3 },
                {
                  type: "text",
                  text: `${summary.totalCount}人 (生存 ${summary.aliveCount}人 / 接続 ${summary.connectionCount}人)`,
                  size: "sm",
                  color: "#111827",
                  flex: 5,
                  wrap: true,
                },
              ],
            },
            {
              type: "text",
              text: `生存率 ${gaugePercent}%`,
              size: "xs",
              color: "#6B7280",
            },
            {
              type: "box",
              layout: "vertical",
              backgroundColor: "#E5E7EB",
              height: "8px",
              cornerRadius: "8px",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  backgroundColor: "#10B981",
                  height: "8px",
                  cornerRadius: "8px",
                  width: `${gaugePercent}%`,
                  contents: [],
                },
              ],
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#1F2937",
              action: {
                type: "postback",
                label: "状態を更新",
                data: getStatusRefreshPostback(),
                displayText: "/jinro status",
              },
            },
            {
              type: "button",
              style: "secondary",
              action: {
                type: "message",
                label: "役職を見る",
                text: "/jinro role show",
              },
            },
            {
              type: "button",
              action: {
                type: "message",
                label: "ヘルプ",
                text: "/jinro help",
              },
            },
          ],
        },
      },
    },
    {
      type: "text",
      text: "ショートカットから操作を続けられます。",
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "postback",
              label: "状態更新",
              data: getStatusRefreshPostback(),
              displayText: "/jinro status",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "役職",
              text: "/jinro role show",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "議論開始",
              text: "/jinro discuss start",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "ヘルプ",
              text: "/jinro help",
            },
          },
        ],
      },
    },
  ];
}
