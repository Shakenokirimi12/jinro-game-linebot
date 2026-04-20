// @ts-nocheck

import { parseTargetUserId } from "./commandParser";

interface LineMessage {
  type: string;
  text: string;
  mention?: {
    mentionees: Array<{
      type: string;
      userId: string;
    }>;
  };
}

interface LineEvent {
  type: string;
  message: LineMessage;
  replyToken: string;
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

interface ConnectedUser {
  connected_User_Id: string;
  room_Code: string;
  status: string;
  role?: string;
}

interface RoomInfo {
  room_Code: string;
  status: string;
}

interface UserProfile {
  displayName: string;
}

type ReplyMessage = Record<string, any>;

type UserAction = {
  displayName: string;
  userId: string;
};

function isNightTurn(status: string): boolean {
  return status.includes("night") && status !== "day1night";
}

function buildSelectFlex(title: string, subtitle: string, command: string, users: UserAction[]): ReplyMessage {
  const buttons = users.map((user) => ({
    type: "button",
    action: {
      type: "message",
      label: user.displayName,
      text: `${command} ${user.userId}`,
    },
  }));

  return {
    type: "flex",
    altText: "starter",
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: title,
                weight: "bold",
                size: "sm",
              },
              {
                type: "text",
                text: subtitle,
                size: "xs",
              },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: buttons,
            flex: 0,
          },
        },
      ],
    },
  };
}

async function getConnectedUser(env: Env, userId: string): Promise<ConnectedUser | undefined> {
  const { results } = await env.D1_DATABASE.prepare(
    "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
  )
    .bind(userId)
    .all();
  return (results as ConnectedUser[])[0];
}

async function getCurrentRoom(env: Env, roomCode: string): Promise<RoomInfo | undefined> {
  const { results } = await env.D1_DATABASE.prepare("SELECT * FROM Rooms WHERE room_Code = ?")
    .bind(roomCode)
    .all();
  return (results as RoomInfo[])[0];
}

async function getAliveUsersInRoom(env: Env, roomCode: string): Promise<ConnectedUser[]> {
  const { results } = await env.D1_DATABASE.prepare(
    "SELECT * FROM ConnectedUsers WHERE room_Code = ? AND status = ?"
  )
    .bind(roomCode, "alive")
    .all();
  return results as ConnectedUser[];
}

async function toUserActions(env: Env, users: ConnectedUser[]): Promise<UserAction[]> {
  const actions: UserAction[] = [];
  for (const user of users) {
    const profile = await getUserProfile(env, user.connected_User_Id);
    actions.push({ displayName: profile.displayName, userId: user.connected_User_Id });
  }
  return actions;
}

export async function doNightTurn(
  data: WebhookData,
  request: Request,
  env: Env,
  roleName: string,
  status: string
): Promise<ReplyMessage> {
  if (roleName === "werewolf") {
    return selectSomeoneByWerewolf(data, request, env, status);
  }
  if (roleName === "knight") {
    return selectSomeonebyKnight(data, request, env, status);
  }
  if (roleName === "diviner") {
    return selectSomeoneByDiviner(data, request, env, status);
  }
  if (roleName === "spiritist") {
    return selectSomeoneBySpiritist(data, request, env, status);
  }

  return {
    type: "text",
    text: "あなたは夜のターンに行うことはありません。グループトークに戻ってください。",
  };
}

async function selectSomeoneByWerewolf(
  data: WebhookData,
  request: Request,
  env: Env,
  status: string
): Promise<ReplyMessage> {
  if (!isNightTurn(status)) {
    return {
      type: "text",
      text: "現在は第一夜のため、誰かを殺すことはできません。グループトークに戻ってください。",
    };
  }

  const queriedUserId = data.events[0].source.userId;
  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return { type: "text", text: "ユーザー情報の取得に失敗しました。" };
  }

  const connectedUsers = await getAliveUsersInRoom(env, queriedUser.room_Code);
  const users = await toUserActions(env, connectedUsers);

  return buildSelectFlex("夜のターンを行います。", "あなたは人狼です。誰を殺しますか？", "/jinro kill", users);
}

async function selectSomeonebyKnight(
  data: WebhookData,
  request: Request,
  env: Env,
  status: string
): Promise<ReplyMessage> {
  if (!isNightTurn(status)) {
    return {
      type: "text",
      text: "現在は第一夜のため、夜のターンはありません。グループトークに戻ってください。",
    };
  }

  const queriedUserId = data.events[0].source.userId;
  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return { type: "text", text: "ユーザー情報の取得に失敗しました。" };
  }

  const connectedUsers = await getAliveUsersInRoom(env, queriedUser.room_Code);
  const users = await toUserActions(env, connectedUsers);

  return buildSelectFlex("夜のターンを行います。", "あなたは騎士です。誰を守りますか？", "/jinro save", users);
}

async function selectSomeoneByDiviner(
  data: WebhookData,
  request: Request,
  env: Env,
  status: string
): Promise<ReplyMessage> {
  const queriedUserId = data.events[0].source.userId;
  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return { type: "text", text: "ユーザー情報の取得に失敗しました。" };
  }

  const connectedUsers = await getAliveUsersInRoom(env, queriedUser.room_Code);
  const users = await toUserActions(env, connectedUsers);

  return buildSelectFlex("夜のターンを行います。", "あなたは占い師です。誰を占いますか？", "/jinro divine", users);
}

async function selectSomeoneBySpiritist(
  data: WebhookData,
  request: Request,
  env: Env,
  status: string
): Promise<ReplyMessage> {
  if (!isNightTurn(status)) {
    return {
      type: "text",
      text: "現在は第一夜のため、誰かを調べることはできません。グループトークに戻ってください。",
    };
  }

  const queriedUserId = data.events[0].source.userId;
  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return { type: "text", text: "ユーザー情報の取得に失敗しました。" };
  }

  const connectedUsers = await getAliveUsersInRoom(env, queriedUser.room_Code);
  const users = await toUserActions(env, connectedUsers);

  return buildSelectFlex("夜のターンを行います。", "あなたは霊媒師です。誰を調べますか？", "/jinro see", users);
}

export async function killSomeoneByWerewolf(data: WebhookData, request: Request, env: Env): Promise<ReplyMessage[]> {
  const returnValue: ReplyMessage[] = [];
  const queriedUserId = data.events[0].source.userId;

  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return [{ type: "text", text: "ユーザー情報の取得に失敗しました。" }];
  }

  const currentRoom = await getCurrentRoom(env, queriedUser.room_Code);
  if (!currentRoom || !currentRoom.status.includes("night")) {
    return [{ type: "text", text: "現在は夜のターンではありません。" }];
  }

  const prompt = data.events[0].message.text;
  const targetUserId = parseTargetUserId(prompt, "kill");
  if (!targetUserId) {
    return [{ type: "text", text: "コマンド形式が不正です。" }];
  }

  const targetUser = await getConnectedUser(env, targetUserId);
  if (!targetUser) {
    return [{ type: "text", text: "対象ユーザーが見つかりません。" }];
  }

  if (targetUser.status === "alive" || targetUser.status === "saved") {
    await env.D1_DATABASE.prepare("UPDATE ConnectedUsers SET status = ? WHERE connected_User_Id = ?")
      .bind("died-0", targetUserId)
      .all();
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({
      type: "text",
      text: `${targetUserProfile.displayName}の殺害を試みました。\r\n(騎士がいる場合は殺害できていない可能性があります。)`,
    });
  } else {
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんを殺すことはできません。` });
    returnValue.push({ type: "text", text: "再度選択してください。" });
    returnValue.push(await selectSomeoneByWerewolf(data, request, env, currentRoom.status));
  }

  return returnValue;
}

export async function saveSomeonebyKnight(data: WebhookData, request: Request, env: Env): Promise<ReplyMessage[]> {
  const returnValue: ReplyMessage[] = [];
  const queriedUserId = data.events[0].source.userId;

  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return [{ type: "text", text: "ユーザー情報の取得に失敗しました。" }];
  }

  const currentRoom = await getCurrentRoom(env, queriedUser.room_Code);
  if (!currentRoom || !currentRoom.status.includes("night")) {
    return [{ type: "text", text: "現在は夜のターンではありません。" }];
  }

  const prompt = data.events[0].message.text;
  const targetUserId = parseTargetUserId(prompt, "save");
  if (!targetUserId) {
    return [{ type: "text", text: "コマンド形式が不正です。" }];
  }

  const targetUser = await getConnectedUser(env, targetUserId);
  if (!targetUser) {
    return [{ type: "text", text: "対象ユーザーが見つかりません。" }];
  }

  if (targetUser.status === "alive" || targetUser.status === "died-0") {
    await env.D1_DATABASE.prepare("UPDATE ConnectedUsers SET status = ? WHERE connected_User_Id = ?")
      .bind("saved", targetUserId)
      .all();
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんを守りました。` });
  } else {
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんを守ることはできません。` });
    returnValue.push({ type: "text", text: "再度選択してください。" });
    returnValue.push(await selectSomeonebyKnight(data, request, env, currentRoom.status));
  }

  return returnValue;
}

export async function divineSomeoneByDiviner(
  data: WebhookData,
  request: Request,
  env: Env
): Promise<ReplyMessage[]> {
  const returnValue: ReplyMessage[] = [];
  const queriedUserId = data.events[0].source.userId;

  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return [{ type: "text", text: "ユーザー情報の取得に失敗しました。" }];
  }

  const currentRoom = await getCurrentRoom(env, queriedUser.room_Code);
  if (!currentRoom || !currentRoom.status.includes("night")) {
    return [{ type: "text", text: "現在は夜のターンではありません。" }];
  }

  const prompt = data.events[0].message.text;
  const targetUserId = parseTargetUserId(prompt, "divine");
  if (!targetUserId) {
    return [{ type: "text", text: "コマンド形式が不正です。" }];
  }

  const targetUser = await getConnectedUser(env, targetUserId);
  if (!targetUser) {
    return [{ type: "text", text: "対象ユーザーが見つかりません。" }];
  }

  if (targetUser.status === "alive" || targetUser.status === "saved" || targetUser.status === "died-0") {
    const targetUserProfile = await getUserProfile(env, targetUserId);
    const roleName = targetUser.role ?? "citizen";
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんの役職は以下の通りです。` });
    returnValue.push({
      type: "image",
      originalContentUrl: `https://jinro-resources.pages.dev/${roleName}.PNG`,
      previewImageUrl: `https://jinro-resources.pages.dev/${roleName}.PNG`,
    });
  } else {
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんは生存していないため、占うことはできません。` });
    returnValue.push({ type: "text", text: "再度選択してください。" });
    returnValue.push(await selectSomeoneByDiviner(data, request, env, currentRoom.status));
  }

  return returnValue;
}

export async function seeSomeoneBySpiritist(
  data: WebhookData,
  request: Request,
  env: Env
): Promise<ReplyMessage[]> {
  const returnValue: ReplyMessage[] = [];
  const queriedUserId = data.events[0].source.userId;

  const queriedUser = await getConnectedUser(env, queriedUserId);
  if (!queriedUser) {
    return [{ type: "text", text: "ユーザー情報の取得に失敗しました。" }];
  }

  const currentRoom = await getCurrentRoom(env, queriedUser.room_Code);
  if (!currentRoom || !currentRoom.status.includes("night")) {
    return [{ type: "text", text: "現在は夜のターンではありません。" }];
  }

  const prompt = data.events[0].message.text;
  const targetUserId = parseTargetUserId(prompt, "see");
  if (!targetUserId) {
    return [{ type: "text", text: "コマンド形式が不正です。" }];
  }

  const { results: targetUsers } = await env.D1_DATABASE.prepare(
    "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ? AND room_Code = ?"
  )
    .bind(targetUserId, queriedUser.room_Code)
    .all();
  const targetUser = (targetUsers as ConnectedUser[])[0];

  if (!targetUser) {
    return [{ type: "text", text: "対象ユーザーが見つかりません。" }];
  }

  const { results: usersInRoom } = await env.D1_DATABASE.prepare(
    "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
  )
    .bind(queriedUser.room_Code)
    .all();
  const werewolves = (usersInRoom as ConnectedUser[]).filter((user) => user.role === "werewolf");

  const isCheckable =
    targetUser.status === "exiled-1" ||
    targetUser.status.startsWith("exiled-") ||
    targetUser.status.startsWith("dead-") ||
    targetUser.status === "died-0";

  if (isCheckable) {
    const roleName = targetUser.role ?? "citizen";
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({ type: "text", text: `現在、人狼は${werewolves.length}人です。` });
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんの役職は以下の通りです。` });
    returnValue.push({
      type: "image",
      originalContentUrl: `https://jinro-resources.pages.dev/${roleName}.PNG`,
      previewImageUrl: `https://jinro-resources.pages.dev/${roleName}.PNG`,
    });
  } else {
    const targetUserProfile = await getUserProfile(env, targetUserId);
    returnValue.push({ type: "text", text: `${targetUserProfile.displayName}さんは死亡していないため、霊視できません。` });
    returnValue.push({ type: "text", text: "再度選択してください。" });
    returnValue.push(await selectSomeoneBySpiritist(data, request, env, currentRoom.status));
  }

  return returnValue;
}

async function getUserProfile(env: Env, userId: string): Promise<UserProfile> {
  const requestUrl = `https://api.line.me/v2/bot/profile/${userId}`;
  const returnData = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${env.ACCESS_TOKEN}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data as UserProfile;
    });

  return returnData;
}
