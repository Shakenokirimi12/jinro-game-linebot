import { initRoom } from "./modules/Room/initRoom";
import { closeRoom } from "./modules/Room/closeRoom";
import { connectRoom } from "./modules/Room/connectRoom";
import { disconRoom } from "./modules/Room/disconRoom";
import { makeRulelist } from "./modules/Room/makeRuleList";
import { applyRule } from "./modules/Room/applyRule";
import { startGame } from "./modules/Game/startGame";
import { showRole } from "./modules/Game/roleShower";
import { startDiscuss } from "./modules/Game/startDiscuss";
import { checkResult, startElection } from "./modules/Game/electionOperator";
import { handleMention } from "./modules/Game/electionOperator";
import { parseTargetUserId, isJinroCommand } from "./modules/Game/commandParser";
import { divineSomeoneByDiviner, killSomeoneByWerewolf, saveSomeonebyKnight, seeSomeoneBySpiritist } from "./modules/Game/nightTurn";
import { getRoomStatus } from "./modules/Room/getRoomStatus";
import {
  buildHelpMessages,
  buildInvalidCommandMessages,
  buildUnsupportedEventMessages,
  resolvePromptFromEvent,
} from "./modules/ui/lineRichUi";
import { enhanceLineReplyMessages } from "./modules/ui/lineResponseEnhancer";

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

interface LinePostback {
  data?: string;
}

interface LineEvent {
  type: string;
  message: LineMessage;
  postback?: LinePostback;
  replyToken: string;
  source: {
    userId: string;
    type: string;
    groupId?: string;
  };
}

interface WebhookData {
  events: LineEvent[];
}

interface UserProfile {
  displayName: string;
}

interface ConnectedUser {
  connected_User_Id: string;
  room_Code: string;
  status: string;
  votes?: number;
  role?: string;
}

interface Env {
  ACCESS_TOKEN: string;
  D1_DATABASE: D1Database;
}

const BOT_URL = "https://lin.ee/H6oMBxr"

const url = "https://api.line.me/v2/bot/message/reply"
function rawHtmlResponse(html: string): Response {
  const init = {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  }
  return new Response(html, init)
}

async function replyToLine(replyToken: string, messages: any[], env: Env): Promise<Response> {
  const init = {
    body: JSON.stringify({
      replyToken,
      messages,
    }),
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
  };

  return fetch(url, init);
}

async function readRequestBody(request: Request, env: Env): Promise<string> {
  const { headers } = request
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const data: WebhookData = await request.json()
    const event = data.events?.[0];
    if (event) {
      const prompt = resolvePromptFromEvent(event);
      if (!prompt) {
        const unsupportedMessages = buildUnsupportedEventMessages(event.type);
        const unsupportedRes = await replyToLine(event.replyToken, unsupportedMessages, env);
        console.log(JSON.stringify(unsupportedRes));
        return JSON.stringify({
          handled: false,
          eventType: event.type,
        });
      }

      console.log(prompt)
      let resmessage: any[] | undefined;
      switch (prompt) {
        case "/jinro init":
          resmessage = await initRoom(data, request, env, BOT_URL);
          break;
        case "/jinro close":
          resmessage = await closeRoom(data, request, env);
          break;
        case "/jinro rule select":
          resmessage = await makeRulelist(data, request, env);
          break;
        case "/jinro discon":
          resmessage = await disconRoom(data, request, env);
          break;
        case "/jinro game start":
          resmessage = await startGame(data, request, env);
          break;
        case "/jinro role show":
          resmessage = await showRole(data, request, env);
          break;
        case "/jinro discuss start":
          resmessage = await startDiscuss(data, request, env, 600);
          break;
        case "/jinro discuss end":
          resmessage = await startElection(data, env);
          break;
        case "/jinro check result":
          resmessage = await checkResult(data, request, env);
          break;
        case "/jinro status":
          resmessage = await getRoomStatus(data, request, env);
          break;
        case "/jinro help":
          resmessage = buildHelpMessages(BOT_URL);
          break;
        default:
          if (prompt.match(/\/jinro connect \d{6}/)) {
            resmessage = await connectRoom(data, request, env, BOT_URL)
          }
          else if (prompt.match(/\/jinro rule \d{7}/)) {
            resmessage = await applyRule(data, request, env)
          }
          else if (parseTargetUserId(prompt, "kill")) {
            console.log("人狼の夜のターン");
            resmessage = await killSomeoneByWerewolf(data, request, env)
          }
          else if (parseTargetUserId(prompt, "save")) {
            console.log("騎士の夜のターン");
            resmessage = await saveSomeonebyKnight(data, request, env)
          }
          else if (parseTargetUserId(prompt, "see")) {
            console.log("霊媒師の夜のターン");
            resmessage = await seeSomeoneBySpiritist(data, request, env)
          }
          else if (parseTargetUserId(prompt, "divine")) {
            console.log("占い師の夜のターン");
            resmessage = await divineSomeoneByDiviner(data, request, env)
          }
          else if (prompt.trim().match(/^\/jinro (kill|save|see|divine)$/)) {
            resmessage = [
              {
                type: "text",
                text: "対象ユーザーIDを指定してください。例: /jinro see Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                quickReply: {
                  items: [
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
          else if (event.type === "message" && event.message?.mention && prompt.includes("@")) {
            resmessage = await handleMention(data, request, env)
          }
          else if (isJinroCommand(prompt)) {
            resmessage = buildInvalidCommandMessages();
          }
      }

      if (!resmessage) {
        return JSON.stringify({
          handled: false,
          prompt,
        });
      }

      const enhancedMessages = enhanceLineReplyMessages(resmessage);
      console.log(JSON.stringify(enhancedMessages))
      const res = await replyToLine(event.replyToken, enhancedMessages, env);
      console.log(JSON.stringify(res))
      return JSON.stringify({
        handled: true,
        prompt,
      });
    }
    else {
      return JSON.stringify(data)
    }
  }
  else if (contentType.includes("application/text")) {
    return await request.text()
  }
  else if (contentType.includes("text/html")) {
    return await request.text()
  }
  else if (contentType.includes("form")) {
    const formData = await request.formData()
    const text = await formData.entries()
    const body: { [key: string]: any } = {}
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return JSON.stringify(body)
  }
  else {
    const myBlob = await request.blob()
    return myBlob.toString()
  }
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const reqBody = await readRequestBody(request, env)
  const retBody = `The request body sent in was ${reqBody}`
  console.log(retBody)
  return new Response(retBody);
}


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "POST") {
      return handleRequest(request, env)
    }
    else if (request.method === "GET") {
      return new Response(`The request was a GET`)
    }
    return new Response("Method Not Allowed", { status: 405 })
  }
}