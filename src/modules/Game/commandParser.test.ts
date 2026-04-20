import { describe, expect, it } from "vitest";
import { isJinroCommand, parseTargetUserId } from "./commandParser";

describe("parseTargetUserId", () => {
  const userId = "U0123456789abcdef0123456789abcdef";

  it("対象ユーザーIDを抽出できる", () => {
    expect(parseTargetUserId(`/jinro kill ${userId}`, "kill")).toBe(userId);
  });

  it("余分な空白があっても抽出できる", () => {
    expect(parseTargetUserId(`/jinro   save   ${userId} `, "save")).toBe(userId);
  });

  it("コマンド不一致なら null を返す", () => {
    expect(parseTargetUserId(`/jinro save ${userId}`, "kill")).toBeNull();
  });
});

describe("isJinroCommand", () => {
  it("jinro コマンドを検知する", () => {
    expect(isJinroCommand("/jinro init")).toBe(true);
  });

  it("通常メッセージは false", () => {
    expect(isJinroCommand("hello")).toBe(false);
  });
});
