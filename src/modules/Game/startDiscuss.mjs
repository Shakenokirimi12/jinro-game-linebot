export async function startDiscuss(data, request, env, time) {
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
        }
    ]
    return returnJson;
}