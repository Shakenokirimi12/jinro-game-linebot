
export async function connectRoom(data, request, env) {
    var connected_User_Id = data.events[0].source.userId;
    var prompt = data.events[0].message.text;
    const regexPattern = /\/jinro connect (\d{6})/;
    // 正規表現にマッチする部分を取り出す
    const match = prompt.match(regexPattern);
    const room_Code = match[1];
    console.log("6桁の数字:", room_Code);
    var currentTime = String(Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3));
    try {
        await env.D1_DATABASE.prepare(
            "INSERT INTO ConnectedUsers VALUES ( ? , ? , ? )"
        ).bind(room_Code, connected_User_Id, currentTime).run();
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            //生徒の答え一覧を取得
            "SELECT * FROM Rooms WHERE room_Code = ?"
        ).bind(room_Code).all();
        await env.D1_DATABASE.prepare(
            //ルームの接続数を1増やす=接続処理
            "UPDATE Rooms SET connection_Count = ? WHERE room_Code = ?"
        ).bind(Number(currentRoom[0].connection_Count) + 1, room_Code).run();
        return [{ "type": "text", "text": "ルーム" + room_Code + "に参加しました。" }];
    }
    catch (error) {
        console.log(error);
        return [{ "type": "text", "text": "すでにルームに参加しています。接続を解除するには、/jinro discon　と送信してください。" }];
    }

}