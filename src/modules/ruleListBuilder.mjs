import { buildRulesJson } from "./buildRulesJson.mjs";

export async function ruleListBuilder(data, request, env, playercount) {
    playercount = 4;
    const { results: rules } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rules WHERE Players = ?"
    ).bind(playercount).all();
    let rulebubbles = await buildRulesJson(rules);
    /*
    let returnJson = [
        {
            "type": "carousel",
            "contents": rulebubbles
        }
    ]
    */
    let returnJson = [{
        "type": "carousel",
        "contents": [
            {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": []
                }
            },
            {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": []
                }
            }
        ]
    }]
    console.log(returnJson)
    return returnJson;
}