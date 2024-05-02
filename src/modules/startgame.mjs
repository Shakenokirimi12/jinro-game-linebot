
export async function startGame(request, env, BOT_URL) {
    //ルームコード生成
    var S = "0123456789"
    var N = 6
    var room_Code = Array.from(Array(N)).map(() => S[Math.floor(Math.random() * S.length)]).join('')
    console.log(room_Code);
    //ルームコード生成
    var host_user_id = request.events[0].source.userId;
    var currentTime = String(Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3));
    //Roomsテーブルのカラムは、順に　ルームコード、作った人のユーザーId、ルームタイプコード、開始時刻、議論開始時刻、参加者数、設定状態
    await env.D1_DATABASE.prepare(
        "INSERT INTO Rooms VALUES ( ? , ? , ? , ? , ? , ? , ?)"
    ).bind(room_Code, host_user_id, null , currentTime, null , 0 , "initialized").run();
    var resultjson = [
        {
            "type": "text",
            "text": "ゲームを開始します。"
        },
        {
            "type": "text",
            "text": "あなたのルームコードは"
        },
        {
            "type": "text",
            "text": room_Code
        },
        {
            "type": "text",
            "text": "です。"
        },
        {
            "type": "text",
            "text": "参加する方は、このアカウントと友達になり、ルームコードを送信してください。"
        },
        {
            "type": "text",
            "text": BOT_URL
        },
        {
            "type": "text",
            "text": "全員の参加が完了したら、このグループで、 /jinro next を送ってください。"
        }
    ]
}