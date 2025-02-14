export async function startGame(data, request, env) {
    let origintype = data.events[0].source.type;
    let queriedUserId = data.events[0].source.userId;
    if (origintype == "group") {
        let groupId = data.events[0].source.groupId;
    } else {
        return [{ "type": "text", "text": "個人チャットからルームを終了することはできません... \r\n グループから終了操作を行なってください...." }];
    }
    const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rooms WHERE created_User_Id = ?"
    ).bind(queriedUserId).all();
    try {
        if (currentRoomInfo.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していないか、ルームの作成者ではありません。ルームに参加するか、ルーム作成者がボタンを押してください。" }];
        } else {
            const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
                "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
            ).bind(queriedUserId).all();
            const { results: currentRoomUsers } = await env.D1_DATABASE.prepare(
                "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
            ).bind(queriedUserInfo[0].room_Code).all();

            await env.D1_DATABASE.prepare(
                "UPDATE ConnectedUsers SET status = ? WHERE room_Code = ?"
            ).bind("alive", queriedUserInfo[0].room_Code).all();

            await env.D1_DATABASE.prepare(
                "UPDATE ConnectedUsers SET votes = ? WHERE room_Code = ?"
            ).bind(0, queriedUserInfo[0].room_Code).all();

            await env.D1_DATABASE.prepare(
                "UPDATE Rooms SET status = ? WHERE room_Code = ?"
            ).bind("day1night", queriedUserInfo[0].room_Code).all();

            let roomRule = currentRoomInfo[0].room_Type_Code;
            let citizen = parseInt(roomRule[0]);
            let werewolf = parseInt(roomRule[1]);
            let diviner = parseInt(roomRule[2]);
            let spiritist = parseInt(roomRule[3]);
            let knight = parseInt(roomRule[4]);
            let madman = parseInt(roomRule[5]);
            let fox = parseInt(roomRule[6]);

            const assignRole = async (role, count) => {
                for (let i = 0; i < count; i++) {
                    if (currentRoomUsers.length === 0) break;
                    let userCount = currentRoomUsers.length;
                    let pointer = Math.floor(Math.random() * userCount);
                    console.log(JSON.stringify(currentRoomUsers), JSON.stringify(currentRoomUsers[pointer]), queriedUserInfo[0].room_Code, pointer, currentRoomUsers[pointer].connected_User_Id);
                    let destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                    await env.D1_DATABASE.prepare(
                        "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                    ).bind(role, destinationUserId).run();
                    await env.D1_DATABASE.prepare(
                        "UPDATE ConnectedUsers SET status = ? WHERE connected_User_Id = ? AND status = ?"
                    ).bind("alive", destinationUserId, "connected").run();
                    currentRoomUsers.splice(pointer, 1);
                }
            };

            await assignRole("citizen", citizen);
            await assignRole("werewolf", werewolf);
            await assignRole("diviner", diviner);
            await assignRole("spiritist", spiritist);
            await assignRole("knight", knight);
            await assignRole("madman", madman);
            await assignRole("fox", fox);

            console.log("ロールアサインが完了しました。", JSON.stringify(currentRoomUsers));
            return [
                { "type": "text", "text": "ゲームを開始します。" },
                { "type": "text", "text": "まず、役職を配布し、夜のターンを行います。このBotの個人チャットに行き、下の「役職を見る」ボタンを押してください。" },
                { "type": "text", "text": "全員が役職を見終わったら、ルームを作った人が下の「議論タイム開始」を押してください、" },
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
                                        "text": "次へ進む",
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
                                                    "label": "議論タイム開始",
                                                    "text": "/jinro discuss start"
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
    } catch (error) {
        return [{ "type": "text", "text": `サーバーでエラーが発生しました。 ${error}` }];
    }
}
