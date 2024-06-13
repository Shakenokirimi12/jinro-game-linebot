export async function applyRule(data, request, env) {
    let origintype = data.events[0].source.type;
    let queriedUserId = data.events[0].source.userId;
    let prompt = data.events[0].message.text;
    const ruleId = prompt.match(/\/jinro rule (\d{7})/)[1];

    if (origintype == "group") {
        const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queriedUserId).all();
        await env.D1_DATABASE.prepare(
            "UPDATE Rooms SET room_Type_Code = ? WHERE room_Code = ?"
        ).bind(ruleId, queriedUserInfo[0].room_Code).run();
        const { results: ruleDatas } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rules WHERE ruleId = ?"
        ).bind(ruleId).all();
        let citizen = ruleDatas[0].citizen;
        let werewolf = ruleDatas[0].werewolf;
        let diviner = ruleDatas[0].diviner;
        let spiritist = ruleDatas[0].spiritist;
        let knight = ruleDatas[0].knight;
        let madman = ruleDatas[0].madman;
        let fox = ruleDatas[0].fox;

        let returnValue = [
            {
                "type": "text",
                "text": ruleDatas[0].ruleName + "で遊びます！もう一度ご確認ください。"
            }
        ];

        returnValue.push(
            {
                "type": "flex",
                "altText": "Rule-Confirm",
                "contents": {
                    "type": "carousel",
                    "contents": [
                        {
                            "type": "bubble",
                            "size": "deca",
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": ruleDatas[0].ruleName,
                                        "weight": "bold",
                                        "size": "xl"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "margin": "lg",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "市民",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": citizen + "人"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "人狼",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": werewolf + "人"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "占い師",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": diviner + "人"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "霊媒師",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": spiritist + "人"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4,
                                                        "text": "騎士"
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": knight + "人"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "狂人",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": madman + "人"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "妖狐",
                                                        "color": "#aaaaaa",
                                                        "size": "sm",
                                                        "flex": 4
                                                    },
                                                    {
                                                        "type": "text",
                                                        "wrap": true,
                                                        "color": "#666666",
                                                        "size": "sm",
                                                        "flex": 5,
                                                        "text": fox + "人"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [

                                ],
                                "flex": 0
                            }
                        }
                    ]
                }
            });

        let startButton = {
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
                                "text": "ゲームを開始しますか？",
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
                                            "label": "ゲームを開始",
                                            "text": "/jinro game start"
                                        }
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "ルールを選び直す",
                                            "text": "/jinro rule select"
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

        returnValue.push({
            "type": "text",
            "text": "ゲームを開始するには、以下を押してください。"
        })

        returnValue.push(startButton);
        return returnValue;

    }
    else {
        return [{ "type": "text", "text": "個人チャットからルームを操作することはできません... \r\n グループから操作を行なってください...." }];
    }
    //処理完了後、ゲームを開始。ゲームを開始しますか？と聞き、開始。
}

