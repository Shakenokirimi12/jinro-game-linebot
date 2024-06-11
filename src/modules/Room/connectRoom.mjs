
export async function connectRoom(data, request, env) {
    var origintype = data.events[0].source.type;
    var connected_User_Id = data.events[0].source.userId;
    var prompt = data.events[0].message.text;
    const room_Code = prompt.match(/\/jinro connect (\d{6})/)[1];
    console.log("6桁の数字:", room_Code);
    var currentTime = String(Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3));
    const { results: connectDestination } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rooms WHERE room_Code = ?"
    ).bind(room_Code).all();
    if (connectDestination.length == 0) {
        if (origintype == "user") {
            await env.D1_DATABASE.prepare(
                "INSERT INTO ConnectedUsers VALUES ( ? , ? , ?, ? , ? )"
            ).bind(room_Code, connected_User_Id, currentTime, "connected", null).run();

            const { results: connectDestination } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rooms WHERE room_Code = ?"
            ).bind(room_Code).all();

            if (connectDestination[0].status == "initialized") {
                await env.D1_DATABASE.prepare(
                    //ルームの接続数を1増やす=接続処理
                    "UPDATE Rooms SET connection_Count = ? WHERE room_Code = ?"
                ).bind(Number(connectDestination[0].connection_Count) + 1, room_Code).run();

                return [{ "type": "text", "text": "ルーム" + room_Code + "に参加しました。" }];
            }
            else {
                return [{ "type": "text", "text": "ルームに接続できませんでした。ゲームが始まっています。" }];
            }
        }
        else {
            return [{ "type": "text", "text": "グループチャットからルームに参加することはできません... \r\n 個人チャットから参加操作を行なってください...." }];
        }
    }
    else {
        return [{ "type": "text", "text": "すでにルームに参加しています。接続を解除するには、/jinro discon　と送信してください。ルームを作った人は、connectは必要ありません。" }];
    }


}

