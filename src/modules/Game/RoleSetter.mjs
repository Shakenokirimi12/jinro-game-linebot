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
            "SELECT * FROM Rooms WHERE created_User_Id = ?"
        ).bind(queriedUserId).all();
        let owner;
        if (currentRoomInfo.length != 0) {
            owner = true;
        }
        else {
            owner = false;
        }
        if (queriedUserInfo.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ゲームを開始することができません。" }];
        }
        else {
            var roleName = queriedUserInfo[0].role;
            if (owner == false) {
                return [
                    {
                        "type": "text", "text": "あなたの役職は以下です。"
                    },
                    {
                        "type": "image",
                        "originalContentUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`,
                        "previewImageUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`
                    },
                    {
                        "type": "text", "text": "グループチャットに戻ってください。"
                    }
                ];
            }
            else {
                return [
                    {
                        "type": "text", "text": "あなたの役職は以下です。"
                    },
                    {
                        "type": "image",
                        "originalContentUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`,
                        "previewImageUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`
                    },
                    {
                        "type": "text", "text": "グループチャットに戻り、全員のロール確認が終わったことを確認してから、"
                    },
                    {
                        "type": "text", "text": "/jinro discuss start"
                    },
                    {
                        "type": "text", "text": "と送信してください。"
                    },
                ];
            }
        }
    }
    catch (error) {
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}