export async function startGame(data, request, env) {
    let origintype = data.events[0].source.type;
    if (origintype == "group") {
        let groupId = data.events[0].source.groupId;
    }
    else {
        return [{ "type": "text", "text": "個人チャットからルームを終了することはできません... \r\n グループから終了操作を行なってください...." }];
    }
    let queriedUserId = data.events[0].source.userId;
    try {
        if (currentRoomInfo.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ゲームを開始することができません。" }];
        }
        else {
            const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
                "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
            ).bind(queriedUserId).all();
            const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rooms WHERE room_Code = ?"
            ).bind(queriedUserInfo[0].room_Code).all();
            const { results: currentRoomUsers } = await env.D1_DATABASE.prepare(
                "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
            ).bind(queriedUserInfo[0].room_Code).all();
            let roomRule = currentRoomInfo[0].room_Type_Code;
            let citizen = parseInt(numberStr[0]);
            let werewolf = parseInt(numberStr[1]);
            let diviner = parseInt(numberStr[2]);
            let spiritist = parseInt(numberStr[3]);
            let knight = parseInt(numberStr[4]);
            let madman = parseInt(numberStr[5]);
            let fox = parseInt(numberStr[6]);
            let userCount;
            for (let i = 0; i <= citizen; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                //あとは、役職ごとにforを回して、各ロールをアサイン。アサインした人は、currentRoomUsersから削除する。アサインするごとにDBアクセス。
            }
            return [{ "type": "text", "text": "ゲームを開始します。" }, { "type": "text", "text": "まず、役職を配布します。このBotの個人チャットに行き、下の「役職を見る」ボタンを押してください。" }];
        }
    }
    catch (error) {
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}