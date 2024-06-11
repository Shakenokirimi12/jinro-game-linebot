
export async function closeRoom(data, request, env) {
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
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ルームを終了することができません。" }];
        }
        else {
            await env.D1_DATABASE.prepare(
                //接続済みリストから削除
                "DELETE FROM Rooms WHERE created_User_Id = ?"
            ).bind(host_user_id).run();
            await env.D1_DATABASE.prepare(
                //接続済みリストから削除
                "DELETE FROM ConnectedUsers WHERE room_Code = ?"
            ).bind(currentRoom[0].room_Code).run();
            console.log(currentRoom)
            return [{ "type": "text", "text": "ゲームを終了しました。" }];
        }
    }
    catch (error) {
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}