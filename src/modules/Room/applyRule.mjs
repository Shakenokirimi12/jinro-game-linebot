export async function applyRule(data, request, env) {
    let origintype = data.events[0].source.type;
    let queriedUserId = data.events[0].source.userId;
    let prompt = data.events[0].message.text;
    const ruleId = prompt.match(/\/jinro rule (\d{7})/)[1];

    if (origintype == "group") {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queriedUserId).all();
        await env.D1_DATABASE.prepare(
            //ルームの接続数を1増やす=接続処理
            "UPDATE Rooms SET room_Type_Code = ? WHERE room_Code = ?"
        ).bind(Number(connectDestination[0].connection_Count) + 1, currentRoom[0].room_Code).run();
    }
    else {
        return [{ "type": "text", "text": "個人チャットからルームを操作することはできません... \r\n グループから操作を行なってください...." }];
    }
    //処理完了後、ゲームを開始。ゲームを開始しますか？と聞き、開始。
}