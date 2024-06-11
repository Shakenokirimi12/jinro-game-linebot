import { ruleFlexBuilder } from "./ruleFlexBuilder.mjs";

export async function ruleListBuilder(data, request, env) {
    var queried_User_Id = data.events[0].source.userId;
    const { results: connectedRoom } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queried_User_Id).all();
    if (connectedRoom.length != 0) {
        const { results: currentRoom } = await env.D1_DATABASE.prepare(
            "SELECT * FROM Rooms WHERE room_Code = ?"
        ).bind(connectedRoom[0].room_Code).all();
        var currentStatus = currentRoom[0].status;
        console.log(currentStatus)
        if (currentStatus == "initialized") {
            const { results: ruleDatas } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rules WHERE Players = ?"
            ).bind(Number(currentRoom[0].connection_Count)).all();
            let n = 0;
            let rulebubblearray = [];
            while (true) {
                try {
                    let ruleName = ruleDatas[n].ruleName;
                    let citizen = ruleDatas[n].citizen;
                    let werewolf = ruleDatas[n].werewolf;
                    let diviner = ruleDatas[n].diviner;
                    let spiritist = ruleDatas[n].spiritist;
                    let knight = ruleDatas[n].knight;
                    let madman = ruleDatas[n].madman;
                    let fox = ruleDatas[n].fox;
                    let ruleId = ruleDatas[n].ruleId;
                    if (ruleName != undefined || ruleName != null || ruleName != "") {
                        let rulebubble = await ruleFlexBuilder(ruleName, citizen, werewolf, diviner, spiritist, knight, madman, fox, ruleId);
                        rulebubblearray.push(rulebubble)
                        n++;
                    }
                }
                catch (error) {
                    break;
                }
            }
            let returnJson;
            if (rulebubblearray.length == 0) {
                returnJson = [{ "type": "text", "text": "この人数で遊ぶことのできるルールがありません。" }]
            }
            else {
                let rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8;
                rule1 = currentRoom[0].connection_Count + '人用ルール①';
                rule2 = currentRoom[0].connection_Count + '人用ルール②';
                rule3 = currentRoom[0].connection_Count + '人用ルール③';
                rule4 = currentRoom[0].connection_Count + '人用ルール④';
                rule5 = currentRoom[0].connection_Count + '人用ルール⑤';
                rule6 = currentRoom[0].connection_Count + '人用ルール⑥';
                rule7 = currentRoom[0].connection_Count + '人用ルール⑦';
                rule8 = currentRoom[0].connection_Count + '人用ルール⑧';
                const orderMap = {
                    [rule1]: 1,
                    [rule2]: 2,
                    [rule3]: 3,
                    [rule4]: 4,
                    [rule5]: 5,
                    [rule6]: 6,
                    [rule7]: 7,
                    [rule8]: 8,
                };
                // ソート関数を定義
                rulebubblearray.sort((a, b) => {
                    let aText = a.body.contents[0].text;
                    let bText = b.body.contents[0].text;
                    return orderMap[aText] - orderMap[bText];
                });
                returnJson = [
                    {
                        "type": "text",
                        "text": "遊びたいルールを選んでください。"
                    },
                    {
                        "type": "flex",
                        "altText": "Rule-Selector",
                        "contents": {
                            "type": "carousel",
                            "contents": rulebubblearray
                        }
                    }
                ];
                console.log(returnJson);
                return returnJson;
            }
        }
    }
    else {
        return [{ "type": "text", "text": "どのルームにも参加していません。" }];
    }

}