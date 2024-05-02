import { startGame } from "./modules/startgame.mjs";
import { endGame } from "./modules/endgame.mjs";
import { connectRoom } from "./modules/connectRoom.mjs";
import { disconRoom } from "./modules/disconRoom.mjs";
import { contToNext } from "./modules/continueToNext.mjs";

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
      var prompt = data.events[0].message.text;
      console.log(prompt)
      let resmessage;
      if (prompt == "/jinro start") {
        resmessage = await startGame(data, request, env, BOT_URL)
      }
      else if (prompt == "/jinro end") {
        resmessage = await endGame(data, request, env)
      }
      else if (prompt == "/jinro next") {
        resmessage = await contToNext(data, request, env)
      }
      else if (prompt == "/jinro discon") {
        resmessage = await disconRoom(data, request, env)
      }
      else if (prompt.match(/\/jinro connect \d{6}/)) {
        resmessage = await connectRoom(data, request, env)
      }
      else if (prompt == "/jinro help"){
        resmessage = [
          {
            "type": "text",
            "text": "ゲームを始めるには \r\n /jinro start \r\n ゲームを終了するには \r\n　/jinro end \r\n ルームに接続するには \r\n /jinro connect 000000 \r\n (000000はルームコードに置き換えてください)"
          }]
      }
      else if (prompt.includes("/jinro")){
        resmessage = [
          {
            "type": "text",
            "text": "コマンドが間違っています。タイプミスがないかご確認ください。"
          }]
      }
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
      console.log(init)
      const res = await fetch(url, init)
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
  console.log(reqBody)
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