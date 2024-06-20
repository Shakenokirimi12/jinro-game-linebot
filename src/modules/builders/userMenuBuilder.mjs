export async function userMenuBuilder(userIdList, modeName, env) {
    const { results: richMenus } = await env.D1_DATABASE.prepare(
        "SELECT * FROM Menus WHERE modeName = ?"
    ).bind(modeName).all();
    const richMenuId = richMenus[0].richMenuId;
    for (const userId of userIdList) {
        const init = {
            method: "POST",
            headers: {
                Authorization: "Bearer " + env.ACCESS_TOKEN,
            }
        }
        try {
            const res = await fetch('https://api.line.me/v2/bot/user/' + userId + '/richmenu/' + richMenuId, init)
            if (!res.ok) {
                console.error(`Failed to associate rich menu with user ${userId}:`, res.status, res.statusText);
            } else {
                console.log(`Successfully associated rich menu with user ${userId}`);
            }
        } catch (error) {
            console.error(`Error associating rich menu with user ${userId}:`, error);
        }
    }
}

//役職確認などのコマンドをチャットに表示する。
