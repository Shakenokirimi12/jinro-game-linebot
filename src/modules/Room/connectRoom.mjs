
export async function connectRoom(data, request, env, BOT_URL) {
    console.log(JSON.stringify(data.events[0]));
    let origintype = data.events[0].source.type;
    let queriedUserId = data.events[0].source.userId;
    let prompt = data.events[0].message.text;
    let userData = await getUserProfile(env, queriedUserId);
    const roomCode = prompt.match(/\/jinro connect (\d{6})/)[1];
    console.log("6桁の数字:", roomCode);
    let currentTime = String(Math.floor((new Date()).getTime() / 1e3));
    const { results: userConnectStatus } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queriedUserId).all();
    if (userData.displayName == undefined) {//友達登録をしていない場合 
        return [{ "type": "text", "text": "ゲームに参加するためには、このアカウントとの友達登録が必要です。" }, { "type": "text", "text": BOT_URL }];
    }
    else {
        if (userConnectStatus.length == 0) {
            await env.D1_DATABASE.prepare(
                "INSERT INTO ConnectedUsers VALUES ( ? , ? , ?, ? , ? )"
            ).bind(roomCode, queriedUserId, currentTime, "connected", null).run();

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
                return [{ "type": "text", "text": userData.displayName + "さんがルーム" + roomCode + "に参加しました。" }];
            }
            else {
                return [{ "type": "text", "text": "ルームに接続できませんでした。ゲームが始まっています。" }];
            }
        }
        else {
            return [{ "type": "text", "text": userData.displayName + "さんはすでにルームに参加しています。接続を解除するには、/jinro discon　と送信してください。ルームを作った人は、connectは必要ありません。" }];
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