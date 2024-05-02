
export async function startGame(data, request, env, BOT_URL) {
    //ルームコード生成
    var S = "0123456789"
    var N = 6
    var room_Code = Array.from(Array(N)).map(() => S[Math.floor(Math.random() * S.length)]).join('')
    console.log("Room code is :" + room_Code);
    //ルームコード生成
    var host_user_id = data.events[0].source.userId;
    var currentTime = String(Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3));
    //Roomsテーブルのカラムは、順に　ルームコード、作った人のユーザーId、ルームタイプコード、開始時刻、議論開始時刻、参加者数、設定状態
    try {
        await env.D1_DATABASE.prepare(
            "INSERT INTO Rooms VALUES ( ? , ? , ? , ? , ? , ? , ?)"
        ).bind(room_Code, host_user_id, null, currentTime, null, 1, "initialized").run();
        await env.D1_DATABASE.prepare(
            "INSERT INTO ConnectedUsers VALUES ( ? , ? , ? )"
        ).bind(room_Code, host_user_id, currentTime).run();
        return [{ "type": "text", "text": "ゲームを開始します。" + "\r\n" + "あなたのルームコードは" }, { "type": "text", "text": room_Code }, { "type": "text", "text": "です。" }, { "type": "text", "text": "参加する方は、このアカウントと友達になり、ルームコードを送信してください。" + "\r\n" + "全員の参加が完了したら、このグループで、 /jinro next を送ってください。" + "\r\n" + BOT_URL },];
    }
    catch (error) {
        console.log(error);
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE created_User_Id = ?"
        ).bind(host_user_id).all();
        return [{ "type": "text", "text": "すでにゲームを開始しています。" + "\r\n" + "あなたのルームコードは" }, { "type": "text", "text": currentRoom[0].room_Code }, { "type": "text", "text": "です。" }, { "type": "text", "text": "新しいゲームを開始したい場合は、現在のゲームを終了させる必要があります。" + "\r\n" + "終了するには、/jinro endと送信してください。" },];
    }
}