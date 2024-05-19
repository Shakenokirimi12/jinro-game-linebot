import { ruleListBuilder } from "./ruleListBuilder.mjs";
export async function contToNext(data, request, env) {
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
            return await ruleListBuilder(data, request, env, currentRoom[0].connection_Count);
        }
    }
    else {
        return [{ "type": "text", "text": "どのルームにも参加していません。" }];
    }
}