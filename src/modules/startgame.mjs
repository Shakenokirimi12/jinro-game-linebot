
export async function startGame(data, request, env, BOT_URL) {
    var origintype = data.events[0].source.type;
    //ルームコード生成
    var S = "0123456789"
    var N = 6
    var room_Code = Array.from(Array(N)).map(() => S[Math.floor(Math.random() * S.length)]).join('')
    console.log("Room code is :" + room_Code);
    //ルームコード生成
    var queried_User_Id = data.events[0].source.userId;
    var currentTime = String(Math.floor((new Date()).getTime() / 1e3)); //unixtime
    try {
        if (origintype == "group") {
            var groupId = data.events[0].source.groupId;
            const { results: searchByUserId } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rooms WHERE created_User_Id = ?"
            ).bind(queried_User_Id).run();
            if (searchByUserId.length == 0) {
                const { results: searchByGroupId } = await env.D1_DATABASE.prepare(
                    "SELECT * FROM Rooms WHERE groupId = ?"
                ).bind(groupId).all();
                if (searchByGroupId.length == 0) {
                    await env.D1_DATABASE.prepare(
                        "INSERT INTO Rooms VALUES ( ? , ? , ? , ? , ? , ? , ?, ?)"
                    ).bind(room_Code, queried_User_Id, null, currentTime, null, 1, "initialized", groupId).run();

                    await env.D1_DATABASE.prepare(
                        "INSERT INTO ConnectedUsers VALUES ( ? , ? , ?, ? , ? )"
                    ).bind(room_Code, queried_User_Id, currentTime, "connected", null).run();
                    return [{ "type": "text", "text": "ゲームを開始します。" + "\r\n" + "あなたのルームコードは" }, { "type": "text", "text": room_Code }, { "type": "text", "text": "です。" }, { "type": "text", "text": "参加する方は、このアカウントと友達になり、ルームコードを送信してください。" + "\r\n" + "全員の参加が完了したら、このグループで、 /jinro next を送ってください。" + "\r\n" + BOT_URL },];
                }
                else {
                    return [{ "type": "text", "text": "グループ内の誰かがゲームをすでに始めています。\r\n ルームコードは" }, { "type": "text", "text": searchByGroupId[0].room_Code }, { "type": "text", "text": "です。" }];
                }
            }
            else {
                return [{ "type": "text", "text": "すでにゲームを開始しています。 \r\n あなたのルームコードは" }, { "type": "text", "text": searchByUserId[0].room_Code }, { "type": "text", "text": "です。" }, { "type": "text", "text": "新しいゲームを開始したい場合は、現在のゲームを終了させる必要があります。  \r\n 終了するには、/jinro endと送信してください。" }]
            }
        }
        else {
            return [{ "type": "text", "text": "個人チャットからルームを開始することはできません... \r\n グループから開始操作を行なってください...."}];
        }
    }
    catch (error) {
        console.log(error);
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}
