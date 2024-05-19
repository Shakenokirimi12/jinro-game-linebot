export async function buildRulesJson(ruleName, citizen, werewolf, diviner, spiritist, knight, madman, fox, ruleId) {
  let actiontext = "/jinro rule " + ruleId;
  let DefaultRule = {
    "type": "bubble",
    "size": "deca",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": ruleName,
          "weight": "bold",
          "size": "xl"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "市民",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": citizen + "人",
                }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "人狼",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": werewolf + "人",
                }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "占い師",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": diviner + "人",
                }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "霊媒師",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": spiritist + "人",
                }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4,
                  "text": "騎士"
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": knight + "人",
                }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "狂人",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": madman + "人",
                }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "妖狐",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 4
                },
                {
                  "type": "text",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 5,
                  "text": fox + "人",
                }
              ]
            }
          ]
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
            "type": "message",
            "label": "これにする",
            "text": actiontext
          }
        }
      ],
      "flex": 0
    }
  };
  return DefaultRule;
}
