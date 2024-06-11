export async function startGame(data, request, env) {
    var origintype = data.events[0].source.type;
    if (origintype == "group") {
        var groupId = data.events[0].source.groupId;
    }
    else {
        return [{ "type": "text", "text": "個人チャットからルームを終了することはできません... \r\n グループから終了操作を行なってください...." }];
    }
    var host_user_id = data.events[0].source.userId;
    try {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE created_User_Id = ?"
        ).bind(host_user_id).all();
        if (currentRoom.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ゲームを開始することができません。" }];
        }
        else {
            return [{ "type": "text", "text": "ゲームを開始します。" },{ "type": "text", "text": "まず、役職を配布します。このBotの個人チャットに行き、下の「役職を見る」ボタンを押してください。" }];
        }
    }
    catch (error) {
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}