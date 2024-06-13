
export async function connectRoom(data, request, env, BOT_URL) {
    console.log(JSON.stringify(data.events[0]));
    var origintype = data.events[0].source.type;
    var queried_User_Id = data.events[0].source.userId;
    var prompt = data.events[0].message.text;
    var userData = await getUserProfile(env, queried_User_Id);
    const room_Code = prompt.match(/\/jinro connect (\d{6})/)[1];
    console.log("6桁の数字:", room_Code);
    var currentTime = String(Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3));
    const { results: userConnectStatus } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queried_User_Id).all();
    if (userConnectStatus.length == 0) {
        await env.D1_DATABASE.prepare(
            "INSERT INTO ConnectedUsers VALUES ( ? , ? , ?, ? , ? )"
        ).bind(room_Code, queried_User_Id, currentTime, "connected", null).run();

        const { results: connectDestination } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE room_Code = ?"
        ).bind(room_Code).all();

        if (connectDestination.length == 0) {
            return [{ "type": "text", "text": "指定したルームが存在しません。" }];
        }

        if (connectDestination[0].status == "initialized") {
            await env.D1_DATABASE.prepare(
                //ルームの接続数を1増やす=接続処理
                "UPDATE Rooms SET connection_Count = ? WHERE room_Code = ?"
            ).bind(Number(connectDestination[0].connection_Count) + 1, room_Code).run();

            if (userData.displayName == undefined) {
                return [{ "type": "text", "text": "ゲストさんがルーム" + room_Code + "に参加しました。" }, { "type": "text", "text": "ゲームを続行するためには、このアカウントとの友達登録が必要です。" }, { "type": "text", "text": BOT_URL }];
            }
            else {
                return [{ "type": "text", "text": userData.displayName + "さんがルーム" + room_Code + "に参加しました。" }];
            }
        }
        else {
            return [{ "type": "text", "text": "ルームに接続できませんでした。ゲームが始まっています。" }];
        }
    }
    else {
        if (userData.displayName == undefined) {
            return [{ "type": "text", "text": "ゲストさんはすでにルームに参加しています。接続を解除するには、/jinro discon　と送信してください。ルームを作った人は、connectは必要ありません。" }, { "type": "text", "text": "ゲームを続行するためには、このアカウントとの友達登録が必要です。" }, { "type": "text", "text": BOT_URL }];
        }
        else {
            return [{ "type": "text", "text": userData.displayName + "さんはすでにルームに参加しています。接続を解除するには、/jinro discon　と送信してください。ルームを作った人は、connectは必要ありません。" }];
        }
    }


}




async function getUserProfile(env, userId) {
    let request_url = `https://api.line.me/v2/bot/profile/${userId}`;
    let returnData = await fetch(request_url, {
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