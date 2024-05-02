
export async function endGame(data, request, env) {
    var host_user_id = data.events[0].source.userId;
    try {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            //生徒の答え一覧を取得
            "SELECT * FROM Rooms WHERE created_User_Id = ?"
        ).bind(host_user_id).all();
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
    catch (error) {
        return [{ "type": "text", "text": "開始しているゲームがありません。ゲームを開いていないとゲームを削除することはできません。"}];
    }
}