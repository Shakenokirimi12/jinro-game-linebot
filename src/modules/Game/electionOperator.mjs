export async function startElection(data, request, env) {
    let queriedUserId = data.events[0].source.userId;
    let origintype = data.events[0].source.type;
    if (origintype == "group") {
        const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
        ).bind(queriedUserId).all();
        const { results: connectedUsers } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE room_Code = ? AND status = ?"
        ).bind(queriedUserInfo[0].room_Code, "alive").all();

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
            try {
                let userData = await getUserProfile(env, queriedUserId);
                let mentioneduserData = await getUserProfile(env, mentionees[0].userId);

                const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
                    "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
                ).bind(queriedUserId).all();

                const { results: votedUserInfo } = await env.D1_DATABASE.prepare(
                    "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
                ).bind(mentionees[0].userId).all();

                if (queriedUserInfo[0].status == "voted") {
                    return [
                        { "type": "text", "text": `${userData.displayName}さんは投票済みです。` },
                    ];
                }
                else {
                    await env.D1_DATABASE.prepare(
                        "UPDATE ConnectedUsers SET votes = ? WHERE connected_User_Id = ?"
                    ).bind(Number(votedUserInfo[0].votes + 1), mentionees[0].userId).all();
                    await env.D1_DATABASE.prepare(
                        "UPDATE ConnectedUsers SET status = ? WHERE connected_User_Id = ?"
                    ).bind("voted", queriedUserInfo[0].connected_User_Id).all();
                }

                const { results: currentRoomConnectedUsersInfo } = await env.D1_DATABASE.prepare(
                    "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
                ).bind(queriedUserInfo[0].room_Code).all();

                if (allUsersVoted(currentRoomConnectedUsersInfo)) {
                    return [
                        { "type": "text", "text": `${userData.displayName}さんが${mentioneduserData.displayName}さんに投票しました。` },
                        { "type": "text", "text": "全ユーザーが投票を完了しました。追放者をみるには、以下のボタンを押してください。" },
                        {
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
                                                "text": "追放者を見る",
                                                "weight": "bold",
                                                "size": "xl"
                                            }
                                        ]
                                    },
                                    "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "button",
                                                        "action": {
                                                            "type": "message",
                                                            "label": "ボタンを押して閲覧",
                                                            "text": "/jinro check result"
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        "flex": 0
                                    }
                                }]
                            }
                        }
                    ];

                } else {
                    return [
                        { "type": "text", "text": `${userData.displayName}さんが${mentioneduserData.displayName}さんに投票しました。` },
                    ];
                }
            }
            catch (error) {
                console.log(error);
                return 0;
            }
        }
    }
    catch (error) {
        console.log(error);
        return -1;
    }
}


function allUsersVoted(usersInfo) {
    return usersInfo.every(user => user.status === 'voted');
}


export async function checkResult(data, request, env) {
    let queriedUserId = data.events[0].source.userId;
    const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queriedUserId).all();

    const { results: currentRoomConnectedUsersInfo } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
    ).bind(queriedUserInfo[0].room_Code).all();

    const topVotedUsers = getTopVotedUsers(currentRoomConnectedUsersInfo);
    console.log(topVotedUsers.length)
    if (String(topVotedUsers.length) == "1") {
        // 配列でない場合（同数投票でない場合）
        const topUserId = topVotedUsers[0];
        let topUserName = await getUserProfile(env, topUserId);


        //勝利判定

        const { results: resultRoomConnectedUsersInfo } = await env.D1_DATABASE.prepare(
            "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
        ).bind(queriedUserInfo[0].room_Code).all();


        const aliveUsers = resultRoomConnectedUsersInfo.filter(user => user.status === "alive");
        const aliveWerewolves = aliveUsers.filter(user => user.role === "werewolf");
        const aliveNonWerewolves = aliveUsers.filter(user => user.role !== "werewolf");

        const aliveWerewolvesCount = aliveWerewolves.length;
        const aliveNonWerewolvesCount = aliveNonWerewolves.length;

        console.log("生存している人狼の数:", aliveWerewolvesCount);
        console.log("生存している非人狼の数:", aliveNonWerewolvesCount);
        let messages;
        if (await isJinroWin(aliveWerewolvesCount, aliveNonWerewolvesCount)) {
            console.log("人狼の勝ち。");
            messages = [
                { "type": "text", "text": "今回追放されたのは...." },
                { "type": "text", "text": `${topUserName.displayName}さんです。${topUserName.displayName}さんは今後、このゲームに参加することはできません。` },
                { "type": "text", "text": "ここで、市民の数が人狼の数と同数になりました。人狼側の勝利です。ゲームを終了しますか？" },
                { "type": "text", "text": "ゲームを終了しますか？" },
                {
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
                                        "text": "続行しますか？",
                                        "weight": "bold",
                                        "size": "xl"
                                    }
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "button",
                                                        "action": {
                                                            "type": "message",
                                                            "label": "終わる",
                                                            "text": "/jinro close"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "button",
                                                        "action": {
                                                            "type": "message",
                                                            "label": "ルールを変えずもう一度",
                                                            "text": "/jinro game start"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "button",
                                                        "action": {
                                                            "type": "message",
                                                            "label": "ルールを変えてもう一度",
                                                            "text": "/jinro rule select"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "flex": 0
                            }
                        }]
                    }
                }
            ];
        }
        else {
            if (aliveWerewolvesCount == 0) {
                console.log("市民の勝ち。");
                messages = [
                    { "type": "text", "text": "今回追放されたのは...." },
                    { "type": "text", "text": `${topUserName.displayName}さんです。${topUserName.displayName}さんは今後、このゲームに参加することはできません。` },
                    { "type": "text", "text": "ここで、人狼の数が0になりました。市民側の勝利です。" },
                    { "type": "text", "text": "ゲームを終了しますか？" },
                    {
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
                                            "text": "続行しますか？",
                                            "weight": "bold",
                                            "size": "xl"
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "button",
                                                            "action": {
                                                                "type": "message",
                                                                "label": "終わる",
                                                                "text": "/jinro close"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "button",
                                                            "action": {
                                                                "type": "message",
                                                                "label": "ルールを変えずもう一度",
                                                                "text": "/jinro game start"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "button",
                                                            "action": {
                                                                "type": "message",
                                                                "label": "ルールを変えてもう一度",
                                                                "text": "/jinro rule select"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "flex": 0
                                }
                            }]
                        }
                    }
                ];
            }
            else {
                console.log("勝敗決まらず。");
                messages = [
                    { "type": "text", "text": "今回追放されたのは...." },
                    { "type": "text", "text": `${topUserName.displayName}さんです。` },
                    { "type": "text", "text": `${topUserName.displayName}さんは今後、このゲームに参加することはできません。` },
                    { "type": "text", "text": "まだゲームは続きます。" },
                    {
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
                                            "text": "議論を開始しますか？",
                                            "weight": "bold",
                                            "size": "xl"
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "button",
                                            "style": "link",
                                            "height": "sm",
                                            "action": {
                                                "type": "uri",
                                                "label": "議論開始！",
                                                "uri": `https://liff.line.me/2005594448-4jkJQ872?time=600`
                                            }
                                        }
                                    ],
                                    "flex": 0
                                }
                            }]
                        }
                    }
                ];
            }
        }
        console.log("メッセージ:", messages);
        //ステータスアップデート
        await env.D1_DATABASE.prepare(
            "UPDATE ConnectedUsers SET status = ? WHERE connected_User_Id = ?"
        ).bind("dead", topUserId).all();

        await env.D1_DATABASE.prepare(
            "UPDATE ConnectedUsers SET status = ? WHERE room_Code = ? AND status != 'dead'"
        ).bind("alive", queriedUserInfo[0].room_Code).all();

        await env.D1_DATABASE.prepare(
            "UPDATE ConnectedUsers SET votes = ? WHERE room_Code = ?"
        ).bind(0, queriedUserInfo[0].room_Code).all();
        return messages;
        // ここに処理を続行するコードを書く
    } else {
        // 配列の場合（同数投票の場合）
        const userProfiles = await Promise.all(
            topVotedUsers.map(userId => getUserProfile(env, userId))
        );
        const displayNames = userProfiles.map(profile => profile.displayName);
        const messages = [
            { "type": "text", "text": "今回、同数の投票がありました。同数投票があったのは、" },
            ...displayNames.map(name => ({ "type": "text", "text": `${name}さんです。` })),
            { "type": "text", "text": `${displayNames.join('さん、')}さんは今後、このゲームに参加することはできません。` }
        ];

        console.log("メッセージ:", messages);
        return messages;
    }
}

function getTopVotedUsers(usersInfo) {
    if (usersInfo.length === 0) return [];
    console.log(usersInfo);

    // 最も多いvote数を見つける
    let maxVotes = Math.max(...usersInfo.map(user => user.votes));

    // maxVotesを持つユーザーを配列で取得
    let topVotedUsers = usersInfo.filter(user => user.votes === maxVotes)
        .map(user => user.connected_User_Id);
    console.log(topVotedUsers)
    return topVotedUsers;
}

function isJinroWin(aliveWerewolvesCount, aliveNonWerewolvesCount) {
    if (aliveWerewolvesCount >= aliveNonWerewolvesCount) {
        return true;
    } else {
        return false;
    }
}
