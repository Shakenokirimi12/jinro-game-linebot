import { getStatusRefreshPostback } from "./lineRichUi";

type LineMessageObject = Record<string, any>;

function buildCommonQuickReplyItems(): Array<{ type: "action"; action: Record<string, any> }> {
  return [
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
        label: "議論",
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

function isTextMessage(message: LineMessageObject): boolean {
  return message?.type === "text" && typeof message?.text === "string";
}

function hasQuickReply(message: LineMessageObject): boolean {
  return Array.isArray(message?.quickReply?.items) && message.quickReply.items.length > 0;
}

export function enhanceLineReplyMessages(messages: LineMessageObject[]): LineMessageObject[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }

  const cloned = messages.map((message) => ({ ...message }));

  for (let index = cloned.length - 1; index >= 0; index -= 1) {
    if (!isTextMessage(cloned[index])) {
      continue;
    }

    if (hasQuickReply(cloned[index])) {
      return cloned;
    }

    cloned[index] = {
      ...cloned[index],
      quickReply: {
        items: buildCommonQuickReplyItems(),
      },
    };

    return cloned;
  }

  if (cloned.length < 5) {
    cloned.push({
      type: "text",
      text: "ショートカットから次の操作を選べます。",
      quickReply: {
        items: buildCommonQuickReplyItems(),
      },
    });
  }

  return cloned;
}
