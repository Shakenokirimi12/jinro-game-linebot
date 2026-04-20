type LineMessageObject = Record<string, any>;

export interface LineEventLike {
  type: string;
  message?: {
    type?: string;
    text?: string;
    mention?: {
      mentionees?: Array<{
        type: string;
        userId: string;
      }>;
    };
  };
  postback?: {
    data?: string;
  };
}

function buildCommandPostbackData(command: string): string {
  return `cmd=${encodeURIComponent(command)}`;
}

function parsePostbackCommand(data?: string): string | null {
  if (!data) {
    return null;
  }

  if (data.startsWith("cmd=")) {
    return decodeURIComponent(data.slice(4));
  }

  if (data.startsWith("/jinro")) {
    return data;
  }

  return null;
}

export function resolvePromptFromEvent(event: LineEventLike): string | null {
  if (event.type === "message") {
    const text = event.message?.text;
    if (typeof text === "string") {
      return text.trim();
    }
    return null;
  }

  if (event.type === "postback") {
    return parsePostbackCommand(event.postback?.data);
  }

  return null;
}

export function getStatusRefreshPostback(): string {
  return buildCommandPostbackData("/jinro status");
}

function buildCommonQuickReplyItems(): Array<{ type: "action"; action: Record<string, any> }> {
  return [
    {
      type: "action",
      action: {
        type: "postback",
        label: "状態を更新",
        data: getStatusRefreshPostback(),
        displayText: "/jinro status",
      },
    },
    {
      type: "action",
      action: {
        type: "message",
        label: "役職を見る",
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
  ];
}

export function buildHelpMessages(botUrl: string): LineMessageObject[] {
  const overviewFlex: LineMessageObject = {
    type: "flex",
    altText: "JINRO CONTROL CENTER",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#111827",
        contents: [
          {
            type: "text",
            text: "JINRO CONTROL CENTER",
            weight: "bold",
            color: "#FFFFFF",
            size: "md",
          },
          {
            type: "text",
            text: "LINE Messaging API Rich UI",
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
            type: "text",
            text: "このBotは、Flex / Template / Quick Reply / Postback に対応しています。",
            wrap: true,
            size: "sm",
            color: "#374151",
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              { type: "text", text: "ルーム", size: "sm", color: "#6B7280", flex: 2 },
              { type: "text", text: "作成・参加・切断・終了", size: "sm", color: "#111827", flex: 5, wrap: true },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              { type: "text", text: "ゲーム", size: "sm", color: "#6B7280", flex: 2 },
              { type: "text", text: "開始・議論・投票・結果確認", size: "sm", color: "#111827", flex: 5, wrap: true },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              { type: "text", text: "補助", size: "sm", color: "#6B7280", flex: 2 },
              { type: "text", text: "ステータス表示・ショートカット", size: "sm", color: "#111827", flex: 5, wrap: true },
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
            color: "#111827",
            action: {
              type: "postback",
              label: "状態を今すぐ更新",
              data: getStatusRefreshPostback(),
              displayText: "/jinro status",
            },
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "uri",
              label: "Botを友だち追加",
              uri: botUrl,
            },
          },
        ],
      },
    },
  };

  const commandTemplate: LineMessageObject = {
    type: "template",
    altText: "コマンドショートカット",
    template: {
      type: "carousel",
      columns: [
        {
          title: "Room",
          text: "ルーム操作",
          actions: [
            { type: "message", label: "初期化", text: "/jinro init" },
            { type: "message", label: "切断", text: "/jinro discon" },
            { type: "message", label: "終了", text: "/jinro close" },
          ],
        },
        {
          title: "Game",
          text: "ゲーム進行",
          actions: [
            { type: "message", label: "開始", text: "/jinro game start" },
            { type: "message", label: "議論開始", text: "/jinro discuss start" },
            { type: "message", label: "結果確認", text: "/jinro check result" },
          ],
        },
        {
          title: "Utility",
          text: "確認・補助",
          actions: [
            { type: "message", label: "役職表示", text: "/jinro role show" },
            {
              type: "postback",
              label: "ステータス更新",
              data: getStatusRefreshPostback(),
              displayText: "/jinro status",
            },
            { type: "message", label: "ヘルプ", text: "/jinro help" },
          ],
        },
      ],
      imageAspectRatio: "rectangle",
      imageSize: "cover",
    },
  };

  const quickReplyGuide: LineMessageObject = {
    type: "text",
    text: "下のショートカットから操作できます。",
    quickReply: {
      items: buildCommonQuickReplyItems(),
    },
  };

  return [overviewFlex, commandTemplate, quickReplyGuide];
}

export function buildInvalidCommandMessages(): LineMessageObject[] {
  return [
    {
      type: "flex",
      altText: "コマンドエラー",
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#7F1D1D",
          contents: [
            {
              type: "text",
              text: "COMMAND ERROR",
              color: "#FFFFFF",
              weight: "bold",
              size: "sm",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "コマンドの形式が正しくありません。",
              wrap: true,
              size: "md",
              weight: "bold",
            },
            {
              type: "text",
              text: "ヘルプから選ぶと、入力ミスを減らせます。",
              wrap: true,
              size: "sm",
              color: "#4B5563",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#111827",
              action: {
                type: "message",
                label: "ヘルプを開く",
                text: "/jinro help",
              },
            },
          ],
        },
      },
    },
    {
      type: "text",
      text: "必要な操作をショートカットから選んでください。",
      quickReply: {
        items: buildCommonQuickReplyItems(),
      },
    },
  ];
}

export function buildUnsupportedEventMessages(eventType: string): LineMessageObject[] {
  return [
    {
      type: "text",
      text: `イベント ${eventType} は現在UI上で直接操作できません。`,
    },
    {
      type: "text",
      text: "テキストコマンドまたはショートカットを使ってください。",
      quickReply: {
        items: buildCommonQuickReplyItems(),
      },
    },
  ];
}
