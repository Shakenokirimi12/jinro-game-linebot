import { e } from "vitest/dist/reporters-QGe8gs4b.js";

export async function startGame(data, request, env) {
    let origintype = data.events[0].source.type;
    if (origintype == "group") {
        let groupId = data.events[0].source.groupId;
    }
    else {
        return [{ "type": "text", "text": "個人チャットからルームを終了することはできません... \r\n グループから終了操作を行なってください...." }];
    }
    let queriedUserId = data.events[0].source.userId;
    try {
        if (currentRoomInfo.length == 0) {
            return [{ "type": "text", "text": "どのルームにも参加していません。ルームに参加していないと、ゲームを開始することができません。" }];
        }
        else {
            const { results: queriedUserInfo } = await env.D1_DATABASE.prepare(
                "SELECT * FROM ConnectedUsers WHERE connected_User_Id = ?"
            ).bind(queriedUserId).all();
            const { results: currentRoomInfo } = await env.D1_DATABASE.prepare(
                "SELECT * FROM Rooms WHERE room_Code = ?"
            ).bind(queriedUserInfo[0].room_Code).all();
            const { results: currentRoomUsers } = await env.D1_DATABASE.prepare(
                "SELECT * FROM ConnectedUsers WHERE room_Code = ?"
            ).bind(queriedUserInfo[0].room_Code).all();
            let roomRule = currentRoomInfo[0].room_Type_Code;
            let citizen = parseInt(numberStr[0]);
            let werewolf = parseInt(numberStr[1]);
            let diviner = parseInt(numberStr[2]);
            let spiritist = parseInt(numberStr[3]);
            let knight = parseInt(numberStr[4]);
            let madman = parseInt(numberStr[5]);
            let fox = parseInt(numberStr[6]);
            let userCount;
            for (let i = 0; i <= citizen; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("citizen", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            for (let i = 0; i <= werewolf; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("werewolf", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            for (let i = 0; i <= diviner; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("diviner", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            for (let i = 0; i <= spiritist; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("spiritist", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            for (let i = 0; i <= knight; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("knight", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            for (let i = 0; i <= madman; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("madman", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            for (let i = 0; i <= fox; i++) {
                userCount = currentRoomUsers.length;
                let pointer = Math.floor(Math.random() * (userCount + 1))
                var destinationUserId = currentRoomUsers[pointer].connected_User_Id;
                await env.D1_DATABASE.prepare(
                    "UPDATE ConnectedUsers SET role = ? WHERE connected_User_Id = ?"
                ).bind("fox", destinationUserId).run();
                currentRoomUsers.splice(pointer - 1, 1);
            }
            console.log("ロールアサインが完了しました。", JSON.stringify(currentRoomUsers))
            return [{ "type": "text", "text": "ゲームを開始します。" }, { "type": "text", "text": "まず、役職を配布します。このBotの個人チャットに行き、下の「役職を見る」ボタンを押してください。" }];
        }
    }
    catch (error) {
        return [{ "type": "text", "text": "サーバーでエラーが発生しました。" + error }];
    }
}