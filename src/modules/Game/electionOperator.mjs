export async function startElection(data, request, env) {
    let queriedUserId = data.events[0].source.userId;
    let origintype = data.events[0].source.type;
    if (origintype == "group") {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queriedUserId).all();
        const { results: connectedUsers } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE room_Code = ? AND status = ?"
        ).bind(currentRoom[0].room_Code, "alive").all();

        const displayNamesList = await getUserProfilesList(env, connectedUsers);
        console.log(displayNamesList); // 結果をコンソールに出力

        //userのlistを取得するコード
        return [
            { "type": "text", "text": "タイムアップです。議論を止めてください。" },
            { "type": "text", "text": "生きている以下のユーザーから、人狼だと思うユーザーをメンションしてください。" },
            { "type": "text", "text": displayNamesList }
        ];
    }
    else {
        return [{ "type": "text", "text": "個人チャットから投票を開始することはできません... \r\n グループから開始操作を行なってください...." }];
    }

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

export async function handleMention(data, request, env) {
    try {
        let mentionees = data.events[0].message.mention.mentionees;
    }
    catch (error) {
        console.log(error)
        return 0;
    }
    let prompt = data.events[0].message.text;
    let queriedUserId = data.events[0].source.userId;
    console.log(JSON.stringify(mentionees))
    let mentionType = mentionees[0].type;
    if (mentionees.length != 1 && mentionType != "user") {
        return 0;
    }
    else {
        // メンションの正規表現パターン
        const mentionPattern = /^@(\w+)\s$/;

        // メッセージがメンションのみかをチェック
        if (mentionPattern.test(prompt)) {
            let userData = await getUserProfile(env, queriedUserId);
            let mentioneduserData = await getUserProfile(env, mentionees[0].userId);
            return [
                { "type": "text", "text": userData.displayName + "さんが" + mentioneduserData.displayName + "さんに投票しました。" },
            ];
        } else {
            return 0;
        }

    }
}