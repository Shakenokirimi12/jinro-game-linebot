export async function continueToNext(){
    var queried_User_Id = data.events[0].source.userId;
    var prompt = data.events[0].message.text;
    const { results: connectedRoom } = await env.D1_DATABASE.prepare(
        "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
    ).bind(queried_User_Id).all();
    const { results: currentRoom } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Rooms WHERE room_Code = ?"
    ).bind(connectedRoom[0].room_Code).all();
    var currentStatus = currentRoom[0].status;
    if(currentStatus == "initialized"){
        
    }
}