interface LineMessage {
  type: string;
  text: string;
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

export async function startDiscuss(data: WebhookData, request: Request, env: Env, time: number): Promise<any[]> {
    const returnJson = [
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
                                "text": "議論を開始しますか？",
                                "weight": "bold",
                                "size": "xl"
                            }
                        ]
                    },
                    "footer": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "button",
                                "style": "link",
                                "height": "sm",
                                "action": {
                                    "type": "uri",
                                    "label": "タイマースタート！",
                                    "uri": `https://liff.line.me/2005594448-4jkJQ872?time=${time}`
                                }
                            }
                        ],
                        "flex": 0
                    }
                }]
            }
        },
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
                                "text": "議論を終了するときに押してください。",
                                "weight": "bold",
                                "size": "xl"
                            }
                        ]
                    },
                    "footer": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "議論終了!",
                                            "text": `/jinro discuss end`
                                        }
                                    }
                                ]
                            }
                        ],
                        "flex": 0
                    }
                }]
            }
        }
    ]
    return returnJson;
}