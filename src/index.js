import { initRoom } from "./modules/Room/initRoom.mjs";
import { closeRoom } from "./modules/Room/closeRoom.mjs";
import { connectRoom } from "./modules/Room/connectRoom.mjs";
import { disconRoom } from "./modules/Room/disconRoom.mjs";
import { makeRulelist } from "./modules/Room/makeRuleList.mjs";
import { applyRule } from "./modules/Room/applyRule.mjs";
import { startGame } from "./modules/Game/startGame.mjs";
import { decideRole } from "./modules/Game/RoleSetter.mjs";
import { showRole } from "./modules/Game/RoleSetter.mjs";
import { startDiscuss } from "./modules/Game/startDiscuss.mjs";
import { startElection } from "./modules/Game/electionOperator.mjs";
import { handleMention } from "./modules/Game/electionOperator.mjs";


const BOT_URL = "https://lin.ee/H6oMBxr"

const url = "https://api.line.me/v2/bot/message/reply"
function rawHtmlResponse(html) {
  const init = {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  }
  return new Response(html, init)
}

async function readRequestBody(request, env) {
  const { headers } = request
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const data = await request.json()
    if (data.events[0]) {
      let prompt = data.events[0].message.text;
      console.log(prompt)
      let resmessage;
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
        case "/jinro button rolecheck":
          resmessage = await showRole(data, request, env);
          break;
        case "/jinro discuss start":
          resmessage = await startDiscuss(data, request, env, 5);
          break;
        case "/jinro timeup":
          resmessage = await startElection(data, request, env);
          break;
        case "/jinro help":
          resmessage = [
            {
              "type": "text",
              "text": "ゲームを始めるには \r\n /jinro init \r\n ゲームを終了するには \r\n　/jinro close \r\n ルームに接続するには \r\n /jinro connect 000000 \r\n (000000はルームコードに置き換えてください)"
            }
          ];
          break;
        default:
          if (prompt.match(/\/jinro connect \d{6}/)) {
            resmessage = await connectRoom(data, request, env, BOT_URL)
          }
          else if (prompt.match(/\/jinro rule \d{7}/)) {
            resmessage = await applyRule(data, request, env)
          }
          else if (prompt.includes("@")) {
            resmessage = await handleMention(data, request, env)
          }
          else if (prompt.includes("/jinro")) {
            resmessage = [
              {
                "type": "text",
                "text": "コマンドが間違っています。タイプミスがないかご確認ください。"
              }]
          }
      }
      console.log(JSON.stringify(resmessage))
      const init = {
        body: JSON.stringify({
          replyToken: data.events[0].replyToken,
          messages: resmessage
        }),
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.ACCESS_TOKEN,
          "content-type": "application/json"
        }
      }
      const res = await fetch(url, init);
      console.log(JSON.stringify(res))
      return JSON.stringify(res)
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
    const body = {}
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return JSON.stringify(body)
  }
  else {
    const myBlob = await request.blob()
    const objectURL = URL.createObjectURL(myBlob)
    return objectURL
  }
}

async function handleRequest(request, env) {
  const reqBody = await readRequestBody(request, env)
  const retBody = `The request body sent in was ${reqBody}`
  console.log(retBody)
  return new Response(retBody);
}


export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      return handleRequest(request, env)
    }
    else if (request.method === "GET") {
      return new Response(`The request was a GET`)
    }
  }
}