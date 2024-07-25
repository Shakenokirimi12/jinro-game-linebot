import { doNightTurn } from "./nightTurn.mjs";

export async function showRole(data, request, env) {
    let origintype = data.events[0].source.type;
    let queriedUserId = data.events[0].source.userId;
    if (origintype == "group") {
        return [{ "type": "text", "text": "グループチャットからロールを見ることはできません... \r\n 個人チャットから終了操作を行なってください...." }];
    }
    let userId = data.events[0].source.userId;
    try {
        const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queriedUserId).all();
        const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE room_Code = ?"
        ).bind(queriedUserInfo[0].room_Code).all();
        if (queriedUserInfo.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ゲームを開始することができません。" }];
        }
        else {
            const roleName = queriedUserInfo[0].role;
            let returnMessageJson = [
                {
                    "type": "text", "text": "あなたの役職は以下です。"
                },
                {
                    "type": "image",
                    "originalContentUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`,
                    "previewImageUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`
                }
            ];
            returnMessageJson.push(await doNightTurn(data, request, env, roleName, currentRoomInfo[0].status));
            return returnMessageJson;
        }
    }
    catch (error) {
        return [{ "type": "text", "text": `サーバーでエラーが発生しました。${error}` }];
    }
}


