import { startGame } from "./modules/startgame.mjs";

const BOT_URL = "https://lin.ee/H6oMBxr"

const url = "https://api.line.me/v2/bot/message/reply"
let LINE_ACCESS_TOKEN;
function rawHtmlResponse(html) {
  const init = {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  }
  return new Response(html, init)
}

async function readRequestBody(request,env) {
  const { headers } = request
  const contentType = headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    const data = await request.json()

    if (data.events[0]) {
      var prompt = data.events[0].message;
      var resultjson;
      if(prompt == "/jinro start"){
        var resultjson = await startGame(request,env);
      }
      const body = {
        replyToken: data.events[0].replyToken,
        messages: resultjson
      }
      const init = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
          Authorization: "Bearer " + LINE_ACCESS_TOKEN,
          "content-type": "application/json"
          }
      }
      const res = await fetch(url, init)

      return JSON.stringify(data)
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

async function handleRequest(request,env) {
  const reqBody = await readRequestBody(request,env)
  const retBody = `The request body sent in was ${reqBody}`
  //console.log(reqBody)
  return new Response(retBody);
}


export default {
	async fetch(request, env, ctx) {
		const { url } = request
		LINE_ACCESS_TOKEN = env.ACCESS_TOKEN;
		console.log(JSON.stringify(request))
	  
		if (request.method === "POST") {
		  return handleRequest(request,env)
		}
		else if (request.method === "GET") {
		  return new Response(`The request was a GET`)
		}
	}
}