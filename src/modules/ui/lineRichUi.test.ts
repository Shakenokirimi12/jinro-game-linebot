import { describe, expect, it } from "vitest";
import {
  buildHelpMessages,
  buildInvalidCommandMessages,
  getStatusRefreshPostback,
  resolvePromptFromEvent,
} from "./lineRichUi";

describe("resolvePromptFromEvent", () => {
  it("message event からプロンプトを取得できる", () => {
    const prompt = resolvePromptFromEvent({
      type: "message",
      message: { type: "text", text: " /jinro help " },
    });

    expect(prompt).toBe("/jinro help");
  });

  it("postback event からプロンプトを取得できる", () => {
    const prompt = resolvePromptFromEvent({
      type: "postback",
      postback: { data: getStatusRefreshPostback() },
    });

    expect(prompt).toBe("/jinro status");
  });
});

describe("rich ui builders", () => {
  it("ヘルプメッセージを3件返す", () => {
    const messages = buildHelpMessages("https://lin.ee/H6oMBxr");

    expect(messages).toHaveLength(3);
    expect(messages[0]?.type).toBe("flex");
    expect(messages[1]?.type).toBe("template");
    expect(messages[2]?.quickReply?.items?.length).toBeGreaterThan(0);
  });

  it("不正コマンドメッセージにQuickReplyが含まれる", () => {
    const messages = buildInvalidCommandMessages();

    expect(messages[0]?.type).toBe("flex");
    expect(messages[1]?.type).toBe("text");
    expect(messages[1]?.quickReply?.items?.length).toBeGreaterThan(0);
  });
});
