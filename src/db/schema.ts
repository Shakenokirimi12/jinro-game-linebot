import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("Rooms", {
  roomCode: text("room_Code").primaryKey(),
  createdUserId: text("created_User_Id").notNull(),
  roomTypeCode: text("room_Type_Code"),
  createdTime: text("created_Time"),
  closedTime: text("closed_Time"),
  connectionCount: int("connection_Count").notNull(),
  status: text("status").notNull(),
  groupId: text("groupId"),
});

export const connectedUsers = sqliteTable("ConnectedUsers", {
  connectedUserId: text("connected_User_Id").primaryKey(),
  roomCode: text("room_Code").notNull(),
  connectedTime: text("connected_Time"),
  status: text("status").notNull(),
  role: text("role"),
  votes: int("votes").notNull().default(0),
});

export const rules = sqliteTable("Rules", {
  ruleId: text("ruleId").primaryKey(),
  ruleName: text("ruleName").notNull(),
  players: int("Players").notNull(),
  citizen: int("citizen").notNull(),
  werewolf: int("werewolf").notNull(),
  diviner: int("diviner").notNull(),
  spiritist: int("spiritist").notNull(),
  knight: int("knight").notNull(),
  madman: int("madman").notNull(),
  fox: int("fox").notNull(),
});

export const menus = sqliteTable("Menus", {
  modeName: text("modeName").primaryKey(),
  richMenuId: text("richMenuId").notNull(),
});

export const schema = {
  rooms,
  connectedUsers,
  rules,
  menus,
};
