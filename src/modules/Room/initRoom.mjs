
export async function initRoom(data, request, env, BOT_URL) {
    let origintype = data.events[0].source.type;
    //ルームコード生成
    let S = "0123456789"
    let N = 6
    let roomCode = Array.from(Array(N)).map(() => S[Math.floor(Math.random() * S.length)]).join('')
    console.log(`Room code is :${roomCode}`);
    //ルームコード生成
    let queriedUserId = data.events[0].source.userId;
    let currentTime = String(Math.floor((new Date()).getTime() / 1e3)); //unixtime
    try {
        if (origintype == "group") {
            let groupId = data.events[0].source.groupId;
            const { results: searchByUserId } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rooms WHERE created_User_Id = ?"
            ).bind(queriedUserId).run();
            if (searchByUserId.length == 0) {
                const { results: searchByGroupId } = await env.D1_DATABASE.prepare(
                    "SELECT * FROM Rooms WHERE groupId = ?"
                ).bind(groupId).all();
                if (searchByGroupId.length == 0) {
                    await env.D1_DATABASE.prepare(
                        "INSERT INTO Rooms VALUES ( ? , ? , ? , ? , ? , ? , ?, ?)"
                    ).bind(roomCode, queriedUserId, null, currentTime, null, 1, "initialized", groupId).run();

                    await env.D1_DATABASE.prepare(
                        "INSERT INTO ConnectedUsers VALUES ( ? , ? , ?, ? , ? ,?)"
                    ).bind(roomCode, queriedUserId, currentTime, "connected", null, 0).run();
                    return [
                        { "type": "text", "text": "ルームを作成します。\r\nあなたのルームコードは" },
                        { "type": "text", "text": roomCode },
                        { "type": "text", "text": `です。\r\n参加する方は、URLから友達登録の上、以下のボタンを押してください。${BOT_URL}` },
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
                else {
                    return [{ "type": "text", "text": "グループ内の誰かがゲームをすでに始めています。\r\n ルームコードは" }, { "type": "text", "text": searchByGroupId[0].room_Code }, { "type": "text", "text": "です。" }];
                }
            }
            else {
                return [{ "type": "text", "text": "すでにゲームを開始しています。 \r\n あなたのルームコードは" }, { "type": "text", "text": searchByUserId[0].room_Code }, { "type": "text", "text": "です。" }, { "type": "text", "text": "新しいゲームを開始したい場合は、現在のゲームを終了させる必要があります。  \r\n 終了するには、/jinro closeと送信してください。" }]
            }
        }
        else {
            return [{ "type": "text", "text": "個人チャットからルームを開始することはできません... \r\n グループから開始操作を行なってください...." }];
        }
    }
    catch (error) {
        console.log(error);
        return [{ "type": "text", "text": `サーバーでエラーが発生しました。 ${error}` }];
    }
}
