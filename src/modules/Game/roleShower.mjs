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
            const roleName = queriedUserInfo[0].role;
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
                returnMessageJson.push(await doNightTurn(data, request, env, roleName));
                return
            }
        }
    }
    catch (error) {
        return [{ "type": "text", "text": `サーバーでエラーが発生しました。${error}` }];
    }
}


async function doNightTurn(data, request, env, roleName) {
    let returnValue;
    if (roleName == "werewolf") {
        returnValue = await killSomeoneByWerewolf(data, request, env);
    }
    else if (roleName == "knight") {
        returnValue = await saveSomeonebyKnight(data, request, env);
    }
    else if (roleName == "diviner") {
        returnValue = await divineSomeoneByDiviner(data, request, env);
    }
    else if (roleName == "spiritist") {
        returnValue = await seeDeadManBySpiritist(data, request, env);
    }
    return returnValue;
}

async function killSomeoneByWerewolf(data, request, env) {
    let queriedUserId = data.events[0].source.userId;
    const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queriedUserId).all();
    const { results: connectedUsers } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE room_Code = ? AND status = ?"
    ).bind(queriedUserInfo[0].room_Code, "alive").all();

    const displayNamesList = await getUserProfilesList(env, connectedUsers);
    const userIdsList = await getUserIdsList(env, connectedUsers);
    // ベースとなるJSONオブジェクト
    const baseJson = {
        "type": "box",
        "layout": "vertical",
        "contents": []
    };

    // displayNamesListのユーザー名に基づいてJSONを生成
    for (let i = 0; i < displayNamesList.length; i++) {
        const userName = displayNamesList[i];
        const userId = userIdsList[i];
        const buttonJson = {
            "type": "button",
            "action": {
                "type": "message",
                "label": userName,
                "text": `/jinro kill ${userId}`
            }
        };

        // baseJsonのcontentsにbuttonJsonを追加
        baseJson.contents.push(buttonJson);
    }

    let returnValue = {
        "type": "flex",
        "altText": "starter",
        "contents": {
            "type": "carousel",
            "contents": [{
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "夜のターンを行います。",
                            "weight": "bold",
                            "size": "sm"
                        },
                        {
                            "type": "text",
                            "text": "あなたは人狼です。誰を殺しますか？",
                            "size": "xs"
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": baseJson,
                    "flex": 0
                }
            }]
        }
    }


}

async function saveSomeonebyKnight(data, request, env) {

}

async function divineSomeoneByDiviner(data, request, env) {

}

async function seeDeadManBySpiritist(data, request, env) {

}


async function getUserProfilesList(env, connectedUsers) {
    let displayNames = [];

    for (const user of connectedUsers) {
        const userId = user.connected_User_Id;
        const userProfile = await getUserProfile(env, userId);
        displayNames.push(userProfile.displayName);
    }

    // displayNameを改行区切りで結合
    return displayNames.join('\n');
}

async function getUserIdsList(env, connectedUsers) {
    let userIds = [];

    for (const user of connectedUsers) {
        const userId = user.connected_User_Id;
        displayNames.push(user.connected_User_Id);
    }

    // displayNameを改行区切りで結合
    return userIds;
}


async function getUserProfile(env, userId) {
    let requestUrl = `https://api.line.me/v2/bot/profile/${userId}`;
    let returnData = await fetch(requestUrl, {
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
