import { describe, expect, it } from "vitest";
import { enhanceLineReplyMessages } from "./lineResponseEnhancer";

describe("enhanceLineReplyMessages", () => {
  it("quickReply がない最後の text に共通ショートカットを追加する", () => {
    const messages = [{ type: "text", text: "ok" }];
    const enhanced = enhanceLineReplyMessages(messages);

    expect(enhanced).toHaveLength(1);
    expect(enhanced[0]?.quickReply?.items?.length).toBeGreaterThan(0);
  });

  it("既存 quickReply は上書きしない", () => {
    const messages = [
      {
        type: "text",
        text: "already",
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "message",
                label: "既存",
                text: "/jinro help",
              },
            },
          ],
        },
      },
    ];

    const enhanced = enhanceLineReplyMessages(messages);
    expect(enhanced[0]?.quickReply?.items).toHaveLength(1);
    expect(enhanced[0]?.quickReply?.items?.[0]?.action?.label).toBe("既存");
  });

  it("text がない場合は 5 件未満なら案内 text を追加する", () => {
    const messages = [{ type: "flex", altText: "x", contents: { type: "bubble", body: { type: "box", layout: "vertical", contents: [] } } }];
    const enhanced = enhanceLineReplyMessages(messages);

    expect(enhanced).toHaveLength(2);
    expect(enhanced[1]?.type).toBe("text");
    expect(enhanced[1]?.quickReply?.items?.length).toBeGreaterThan(0);
  });

  it("text がなく 5 件ある場合は追加しない", () => {
    const messages = [
      { type: "flex", altText: "1", contents: {} },
      { type: "flex", altText: "2", contents: {} },
      { type: "flex", altText: "3", contents: {} },
      { type: "flex", altText: "4", contents: {} },
      { type: "flex", altText: "5", contents: {} },
    ];

    const enhanced = enhanceLineReplyMessages(messages);
    expect(enhanced).toHaveLength(5);
    expect(enhanced.every((message) => message.type === "flex")).toBe(true);
  });
});
