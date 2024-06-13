
export async function closeRoom(data, request, env) {
    let origintype = data.events[0].source.type;
    if (origintype == "group") {
        let groupId = data.events[0].source.groupId;
    }
    else {
        return [{ "type": "text", "text": "個人チャットからルームを終了することはできません... \r\n グループから終了操作を行なってください...." }];
    }
    let hostUserId = data.events[0].source.userId;
    try {
        const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE created_User_Id = ?"
        ).bind(hostUserId).all();
        if (currentRoomInfo.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ルームを終了することができません。" }];
        }
        else {
            await env.D1_DATABASE.prepare(
                "DELETE FROM Rooms WHERE created_User_Id = ?"
            ).bind(hostUserId).run();
            await env.D1_DATABASE.prepare(
                "DELETE FROM ConnectedUsers WHERE room_Code = ?"
            ).bind(currentRoomInfo[0].room_Code).run();
            return [{ "type": "text", "text": "ゲームを終了しました。" }];
        }
    }
    catch (error) {
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}