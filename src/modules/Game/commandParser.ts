const USER_ID_REGEXP = /(U[0-9a-f]{32})/;

export type NightAction = "kill" | "save" | "divine" | "see";

export function parseTargetUserId(prompt: string, action: NightAction): string | null {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  const commandPattern = new RegExp(`^\\/jinro ${action} ${USER_ID_REGEXP.source}$`);
  const matched = normalized.match(commandPattern);

  return matched?.[1] ?? null;
}

export function isJinroCommand(prompt: string): boolean {
  return /^\s*\/jinro\b/.test(prompt);
}
