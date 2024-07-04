
export async function connectRoom(data, request, env, BOT_URL) {
    console.log(JSON.stringify(data.events[0]));
    let origintype = data.events[0].source.type;
    let queriedUserId = data.events[0].source.userId;
    let prompt = data.events[0].message.text;
    let userData = await getUserProfile(env, queriedUserId);
    const roomCode = prompt.match(/\/jinro connect (\d{6})/)[1];
    console.log("6桁の数字:", roomCode);
    let currentTime = String(Math.floor((new Date()).getTime() / 1e3));
    const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queriedUserId).all();
    if (userData.displayName == undefined) {//友達登録をしていない場合 
        return [{ "type": "text", "text": "ゲームに参加するためには、このアカウントとの友達登録が必要です。" }, { "type": "text", "text": BOT_URL }];
    }
    else {
        if (queriedUserInfo.length == 0) {
            await env.D1_DATABASE.prepare(
                "INSERT INTO ConnectedUsers VALUES ( ? , ? , ?, ? , ? ,? )"
            ).bind(roomCode, queriedUserId, currentTime, "connected", null, 0).run();

            const { results: connectDestination } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rooms WHERE room_Code = ?"
            ).bind(roomCode).all();

            if (connectDestination.length == 0) {
                return [{ "type": "text", "text": "指定したルームが存在しません。" }];
            }

            if (connectDestination[0].status == "initialized") {
                await env.D1_DATABASE.prepare(
                    //ルームの接続数を1増やす=接続処理
                    "UPDATE Rooms SET connection_Count = ? WHERE room_Code = ?"
                ).bind(Number(connectDestination[0].connection_Count) + 1, roomCode).run();

                const { results: destinationRoomConnectedUsersInfo } = await env.D1_DATABASE.prepare(
                    "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
                ).bind(roomCode).all();

                if (destinationRoomConnectedUsersInfo.length >= 4) {
                    return [
                        { "type": "text", "text": `${userData.displayName}さんがルーム${roomCode}に参加しました。` },
                        { "type": "text", "text": `他に参加する方は、URLから友達登録の上、以下のボタンを押してください。${BOT_URL}` },
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
                                                "text": "ルーム参加はこちら",
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
                                                            "label": "ルームに参加する!",
                                                            "text": `/jinro connect ${roomCode}`
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        "flex": 0
                                    }
                                }]
                            }
                        },
                        { "type": "text", "text": `参加者が${destinationRoomConnectedUsersInfo.length}人になりました。ゲームを開始することができます。始める場合は下のボタンを押してください。` },
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
                                                "text": "ルールを選ぶ",
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
                                                            "label": "ルール選択開始!",
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
                    ];
                }
                else {
                    return [
                        { "type": "text", "text": `${userData.displayName}さんがルーム${roomCode}に参加しました。` },
                        { "type": "text", "text": `他に参加する方は、URLから友達登録の上、以下のボタンを押してください。${BOT_URL}` },
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
                                                "text": "ルーム参加はこちら",
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
                                                            "label": "ルームに参加する!",
                                                            "text": `/jinro connect ${roomCode}`
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
                    ];
                }
            }
            else {
                return [{ "type": "text", "text": "ルームに接続できませんでした。ゲームが始まっています。" }];
            }
        }
        else {
            return [{ "type": "text", "text": `${userData.displayName}さんはすでにルームに参加しています。\r\n接続を解除するには、/jinro discon　と送信してください。\r\nルームを作った人は、connectは必要ありません。` }];
        }
    }
}




async function getUserProfile(env, userId) {
    let requestUrl = `https://api.line.me/v2/bot/profile/${userId}`;
    let returnData = await fetch(requestUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${env.ACCESS_TOKEN}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        });

    return returnData;
}