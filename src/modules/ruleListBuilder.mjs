import { buildRulesJson } from "./buildRulesJson.mjs";

export async function ruleListBuilder(data, request, env, playercount) {
    const { results: ruleDatas } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rules WHERE Players = ?"
    ).bind(Number(playercount)).all();
    let n = 0;
    let rulebubblearray = [];
    while (true) {
        try {
            let ruleName = ruleDatas[n].ruleName;
            let citizen = ruleDatas[n].citizen;
            let werewolf = ruleDatas[n].werewolf;
            let diviner = ruleDatas[n].diviner;
            let spiritist = ruleDatas[n].knight;
            let knight = ruleDatas[n].knight;
            let madman = ruleDatas[n].madman;
            let fox = ruleDatas[n].fox;
            let ruleId = ruleDatas[n].ruleId;
            if (ruleName != undefined || ruleName != null || ruleName != "") {
                let rulebubble = await buildRulesJson(ruleName, citizen, werewolf, diviner, spiritist, knight, madman, fox, ruleId);
                rulebubblearray = rulebubblearray.push(rulebubble)
                n++;
            }
        }
        catch (error) {
            break;
        }
    }
    let returnJson =
    {
        "type": "carousel",
        "contents": rulebubblearray
    }
    console.log(returnJson)
    return returnJson;
}
