
export async function disconRoom(data, request, env) {
    var queried_User_Id = data.events[0].source.userId;
    var prompt = data.events[0].message.text;
    var userData = await getUserProfile(env, queried_User_Id);
    var currentTime = String(Math.floor((new Date()).getTime() / 1e3));
    try {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queried_User_Id).all();
        const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE room_Code = ?"
        ).bind(currentRoom[0].room_Code).all();
        await env.D1_DATABASE.prepare(
            "DELETE FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queried_User_Id).run();
        await env.D1_DATABASE.prepare(
            //ルームの接続数を1減らす=切断処理
            "UPDATE Rooms SET connection_Count = ? WHERE room_Code = ?"
        ).bind(Number(currentRoomInfo[0].connection_Count) - 1, currentRoom[0].room_Code).run();
        if (userData.displayName == undefined) {
            return [{ "type": "text", "text": "ゲストさんがルーム" + currentRoom[0].room_Code + "から切断しました。" }];
        }
        else {
            return [{ "type": "text", "text": userData.displayName + "さんがルーム" + currentRoom[0].room_Code + "から切断しました。" }];
        }
    }
    catch (error) {
        console.log(error);
        if (String(error).includes("consistraint")) {
            return [{ "type": "text", "text": "どのルームにも接続されていません。" }];
        }
        else {
            return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
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