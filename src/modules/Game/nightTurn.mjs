
export async function doNightTurn(data, request, env, roleName, status) {
    let returnValue;
    console.log(status)
    console.log(roleName)
    if (roleName == "werewolf") {
        console.log("このユーザーは人狼です。夜のターンを行います。")
        returnValue = await selectSomeoneByWerewolf(data, request, env, status);
    }
    else if (roleName == "knight") {
        console.log("このユーザーは騎士です。夜のターンを行います。")
        returnValue = await selectSomeonebyKnight(data, request, env, status);
    }
    else if (roleName == "diviner") {
        console.log("このユーザーは占い師です。夜のターンを行います。")
        returnValue = await selectSomeoneByDiviner(data, request, env, status);
    }
    else if (roleName == "spiritist") {
        console.log("このユーザーは霊媒師です。夜のターンを行います。")
        returnValue = await selectSomeoneBySpiritist(data, request, env, status);
    }
    else {
        returnValue = {
            "type": "text", "text": "あなたは夜のターンに行うことはありません。グループトークに戻ってください。"
        }
    }
    return returnValue;
}

async function selectSomeoneByWerewolf(data, request, env, status) {
    let returnValue;
    if (!(status == "day1night") && status.includes("night")) {
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
        let baseJson = [];
        for (let i = 0; i < displayNamesList.length; i++) {
            const userName = displayNamesList[i];
            const userId = userIdsList[i];
            console.log(userName, userId)
            const buttonJson = {
                "type": "button",
                "action": {
                    "type": "message",
                    "label": userName,
                    "text": `/jinro kill ${userId}`
                }
            };

            // baseJsonのcontentsにbuttonJsonを追加
            baseJson.push(buttonJson);
        }

        returnValue = {
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
    else {
        console.log("一夜目。殺せない。");
        returnValue = {
            "type": "text", "text": "現在は第一夜のため、誰かを殺すことはできません。グループトークに戻ってください。"
        }
    }
    return returnValue;
}

async function selectSomeonebyKnight(data, request, env, status) {
    let returnValue;
    if (!(status == "day1night") && status.includes("night")) {
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
        let baseJson = [];
        for (let i = 0; i < displayNamesList.length; i++) {
            const userName = displayNamesList[i];
            const userId = userIdsList[i];
            console.log(userName, userId)
            const buttonJson = {
                "type": "button",
                "action": {
                    "type": "message",
                    "label": userName,
                    "text": `/jinro save ${userId}`
                }
            };

            // baseJsonのcontentsにbuttonJsonを追加
            baseJson.push(buttonJson);
        }

        returnValue = {
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
                                "text": "あなたは騎士です。誰を守りますか？",
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
    else {
        console.log("一夜目。殺せない。");
        returnValue = {
            "type": "text", "text": "現在は第一夜のため、夜のターンはありません。グループトークに戻ってください。"
        }
    }
    return returnValue;

}

async function selectSomeoneByDiviner(data, request, env, status) {
    let returnValue;
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
    let baseJson = [];
    for (let i = 0; i < displayNamesList.length; i++) {
        const userName = displayNamesList[i];
        const userId = userIdsList[i];
        console.log(userName, userId)
        const buttonJson = {
            "type": "button",
            "action": {
                "type": "message",
                "label": userName,
                "text": `/jinro divine ${userId}`
            }
        };

        // baseJsonのcontentsにbuttonJsonを追加
        baseJson.push(buttonJson);
    }

    returnValue = {
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
                            "text": "あなたは占い師です。誰を占いますか？",
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
    return returnValue;
}

async function selectSomeoneBySpiritist(data, request, env, status) {
    let returnValue;
    if (!(status == "day1night") && status.includes("night")) {
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
        let baseJson = [];
        for (let i = 0; i < displayNamesList.length; i++) {
            const userName = displayNamesList[i];
            const userId = userIdsList[i];
            console.log(userName, userId)
            const buttonJson = {
                "type": "button",
                "action": {
                    "type": "message",
                    "label": userName,
                    "text": `/jinro see ${userId}`
                }
            };

            // baseJsonのcontentsにbuttonJsonを追加
            baseJson.push(buttonJson);
        }

        returnValue = {
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
                                "text": "あなたは霊媒師です。誰を調べますか？",
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
    else {
        console.log("一夜目。殺せない。");
        returnValue = {
            "type": "text", "text": "現在は第一夜のため、誰かを調べることはできません。グループトークに戻ってください。"
        }
    }
    return returnValue;

}


export async function killSomeoneByWerewolf(data, request, env) {
    let returnValue;
    let queriedUserId = data.events[0].source.userId;

    const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queriedUserId).all();
    const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rooms WHERE room_Code = ?"
    ).bind(queriedUserInfo[0].room_Code).all();

    let prompt = data.events[0].message.text;
    const targetUserId = prompt.match(/\/jinro divine (U[0-9a-f]{32})/)[1];
    let status = currentRoomInfo[0].status;

    if (status.includes("night")) {
        const { results: targetUserInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(targetUserId).all();
        let targetUserStatus = targetUserInfo[0].status;
        if (targetUserStatus == "alive") {
            await env.D1_DATABASE.prepare(
                "UPDATE ConnectedUsers SET status = ? WHERE connected_User_Id = ?"
            ).bind("died-0", targetUserId).all();
            let targetUserProfile = await getUserProfile(env, targetUserId);
            returnValue = [
                { "type": "text", "text": `${targetUserProfile.displayName}さんを殺しました。` },
            ];
        }
        else {
            let targetUserProfile = await getUserProfile(env, targetUserId);
            returnValue = [
                { "type": "text", "text": `${targetUserProfile.displayName}さんを殺すことはできません。` },
                { "type": "text", "text": `再度選択してください。` }
            ];
            returnValue.push(await selectSomeoneByWerewolf(data, request, env, status))
        }
    }
    console.log("返信の内容", returnValue);
    return returnValue;

}

export async function saveSomeonebyKnight(data, request, env) {

}

export async function divineSomeoneByDiviner(data, request, env) {
    let returnValue;
    let queriedUserId = data.events[0].source.userId;

    const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queriedUserId).all();
    const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rooms WHERE room_Code = ?"
    ).bind(queriedUserInfo[0].room_Code).all();

    let prompt = data.events[0].message.text;
    const targetUserId = prompt.match(/\/jinro divine (U[0-9a-f]{32})/)[1];
    console.log(targetUserId)
    let status = currentRoomInfo[0].status;

    if (status.includes("night")) {
        const { results: targetUserInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(targetUserId).all();
        let targetUserStatus = targetUserInfo[0].status;
        console.log(targetUserStatus);
        if (targetUserStatus == "alive") {
            let targetUserProfile = await getUserProfile(env, targetUserId);
            const roleName = targetUserInfo[0].role;
            console.log(targetUserProfile.displayName);
            console.log(roleName);
            returnValue = [
                {
                    "type": "text", "text": `${targetUserProfile.displayName}さんの役職は以下の通りです。`
                },
                {
                    "type": "image",
                    "originalContentUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`,
                    "previewImageUrl": `https://jinro-resources.pages.dev/${roleName}.PNG`
                }
            ];
        }
        else {
            let targetUserProfile = await getUserProfile(env, targetUserId);
            returnValue = [
                { "type": "text", "text": `${targetUserProfile.displayName}さんを占うことはできません。` },
                { "type": "text", "text": `再度選択してください。` }
            ];
            returnValue.push(await selectSomeoneByDiviner(data, request, env, status))
        }
    }
    console.log("返信の内容", returnValue);
    return returnValue;
}

export async function seeSomeoneBySpiritist(data, request, env) {

}

async function getUserProfilesList(env, connectedUsers) {
    let displayNames = [];

    for (const user of connectedUsers) {
        const userId = user.connected_User_Id;
        const userProfile = await getUserProfile(env, userId);
        displayNames.push(userProfile.displayName);
    }

    // displayNameを改行区切りで結合
    console.log(displayNames);
    return displayNames;
}

async function getUserIdsList(env, connectedUsers) {
    let userIds = [];

    for (const user of connectedUsers) {
        const userId = user.connected_User_Id;
        userIds.push(user.connected_User_Id);
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