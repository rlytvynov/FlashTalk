import pool from '@config/databaseConfig'

async function addUserToChannel(userId: string, channelId: string) {
    return await pool.query('SELECT * FROM add_user_to_channel($1, $2);', [parseInt(userId), parseInt(channelId)]);
}

async function getUserById(userId: string): Promise<{ id: string, username: string, displayname: string }> {
    const result = await pool.query('SELECT id, username, displayname FROM users WHERE id = $1;', [parseInt(userId)]);
    
    // I haven't looked through the details but just to be save I call to string on everything that needs to be a string.
    const userInfo = {
        id: result.rows[0].id.toString(),
        username: result.rows[0].username.toString(),
        displayname: result.rows[0].displayname.toString()
    }
    return userInfo;
}

async function removeUserFromChannel(userId: string, channelId: string) {
    await pool.query('DELETE FROM users_to_channel WHERE userId = $1 AND channelId = $2;', [parseInt(userId), parseInt(channelId)]);
}

export default { addUserToChannel, getUserById, removeUserFromChannel };