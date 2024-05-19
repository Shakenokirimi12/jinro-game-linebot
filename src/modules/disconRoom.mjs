
export async function disconRoom(data, request, env) {
    var queried_User_Id = data.events[0].source.userId;
    var prompt = data.events[0].message.text;
    var currentTime = String(Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3));
    try {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queried_User_Id).all();
        await env.D1_DATABASE.prepare(
            "DELETE FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queried_User_Id).run();
        await env.D1_DATABASE.prepare(
            //ルームの接続数を1減らす=切断処理
            "UPDATE Rooms SET connection_Count = ? WHERE room_Code = ?"
        ).bind(Number(currentRoom[0].connection_Count) - 1, currentRoom[0].room_Code).run();
        return [{ "type": "text", "text": "ルーム" + currentRoom[0].room_Code + "から切断しました。" }];
    }
    catch (error) {
        console.log(error);
        if(String(error).includes("consistraint")){
            return [{ "type": "text", "text": "どのルームにも接続されていません。" }];
        }
        else{
            return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
        }
    }

}