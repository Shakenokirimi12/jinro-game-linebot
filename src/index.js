import { initRoom } from "./modules/Room/initRoom.mjs";
import { closeRoom } from "./modules/Room/closeRoom.mjs";
import { connectRoom } from "./modules/Room/connectRoom.mjs";
import { disconRoom } from "./modules/Room/disconRoom.mjs";
import { makeRulelist } from "./modules/Room/makeRuleList.mjs";
import { applyRule } from "./modules/Room/applyRule.mjs";
import { startGame } from "./modules/Game/startGame.mjs";
import { showRole } from "./modules/Game/roleShower.mjs";
import { startDiscuss } from "./modules/Game/startDiscuss.mjs";
import { checkResult, startElection } from "./modules/Game/electionOperator.mjs";
import { handleMention } from "./modules/Game/electionOperator.mjs";
import { divineSomeoneByDiviner, killSomeoneByWerewolf, saveSomeonebyKnight, seeSomeoneBySpiritist } from "./modules/Game/nightTurn.mjs";


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
        case "/jinro role show":
          resmessage = await showRole(data, request, env);
          break;
        case "/jinro discuss start":
          resmessage = await startDiscuss(data, request, env, 600);
          break;
        case "/jinro discuss end":
          resmessage = await startElection(data, request, env);
          break;
        case "/jinro check result":
          resmessage = await checkResult(data, request, env);
          break;
        case "/jinro help":
          resmessage = [
            {
              "type": "flex",
              "altText": "starter",
              "contents": {
                "type": "carousel",
                "contents": [{
                  "type": "bubble",
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ゲーム操作コマンド一覧",
                        "weight": "bold",
                        "size": "sm"
                      }
                    ]
                  },
                  "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": [{
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "ゲームを開始する",
                        "text": `/jinro init`
                      }
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "ゲームを終了する",
                        "text": `/jinro close`
                      }
                    }],
                    "flex": 0
                  }
                }]
              }
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
          else if (prompt.match(/\/jinro kill U[0-9a-f]{32}/)) {
            console.log("人狼の夜のターン");
            resmessage = await killSomeoneByWerewolf(data, request, env)
          }
          else if (prompt.match(/\/jinro save U[0-9a-f]{32}/)) {
            console.log("騎士の夜のターン");
            resmessage = await saveSomeonebyKnight(data, request, env)
          }
          else if (prompt.match(/\/jinro see U[0-9a-f]{32}/)) {
            console.log("霊媒師の夜のターン");
            resmessage = await seeSomeoneBySpiritist(data, request, env)
          }
          else if (prompt.match(/\/jinro divine U[0-9a-f]{32}/)) {
            console.log("占い師の夜のターン");
            resmessage = await divineSomeoneByDiviner(data, request, env)
          }
          else if (prompt.includes("@")) {
            resmessage = await handleMention(data, request, env)
          }
          else if (prompt.includes("/jinro")) {
            resmessage = [
              {
                "type": "text",
                "text": "コマンドが間違っています。"
              }, {
                "type": "flex",
                "altText": "starter",
                "contents": {
                  "type": "carousel",
                  "contents": [{
                    "type": "bubble",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "ゲーム操作コマンド一覧",
                          "weight": "bold",
                          "size": "sm"
                        }
                      ]
                    },
                    "footer": {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [{
                        "type": "button",
                        "action": {
                          "type": "message",
                          "label": "ゲームを開始する",
                          "text": `/jinro init`
                        }
                      },
                      {
                        "type": "button",
                        "action": {
                          "type": "message",
                          "label": "ゲームを終了する",
                          "text": `/jinro close`
                        }
                      }],
                      "flex": 0
                    }
                  }]
                }
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
          Authorization: `Bearer ${env.ACCESS_TOKEN}`,
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