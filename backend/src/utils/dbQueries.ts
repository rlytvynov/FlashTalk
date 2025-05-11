import pool from '@config/databaseConfig'
import except from '../exceptions/exceptions'
import { Channel, Message } from '../types/channel'
import { User } from '../types/user'

async function addUserToChannel(userId: number, channelId: number) {
    return await pool.query('SELECT * FROM add_user_to_channel($1, $2);', [userId, channelId]);
}

async function createMessage(channelId: number, authorId: number, authorname: string, messageData: string): Promise<Message> {
    const result = await pool.query('SELECT * FROM create_message($1, $2, $3);', [channelId, authorId, messageData]);
    const message: Message = result.rows[0];
   
    message.authorname = authorname;

    return message;
}

async function removeUserFromChannel(userId: number, channelId: number) {
    await pool.query('DELETE FROM users_to_channel WHERE userId = $1 AND channelId = $2;', [userId, channelId]);
}

async function channelExists(channelId: number): Promise<boolean> {
    const result = await pool.query('SELECT id FROM channels WHERE id = $1;', [channelId]);
    return result.rows.length !== 0;
}

// Throws an error if:
//  - 'channelId' does not exist
//  - 'userId' is not admin
async function checkAdmin(userId: number, channelId: number) {
    const result = await pool.query('SELECT adminId FROM channels WHERE id = $1', [channelId]);  // Get the adminId of the channel.
            
    if (result.rows.length === 0)
        throw new except.ResourceDoesNotExistError('Error! The channel does not exist.');
    
    if (userId !== result.rows[0].adminid)
        throw new except.PermissionError('You cannot add or remove users because you are not an admin of this channel!');
}

async function getChannel(channelId: number): Promise<Channel> {
    const channel: Channel = (await pool.query('SELECT * FROM get_channel($1);', [channelId])).rows[0];
    channel.members.forEach(member => member.online = false);
    if (!channel.messages) channel.messages = [];
    return channel;
}

async function getUserById(userId: number): Promise<User> {
    return (await pool.query('SELECT id, username, displayname FROM users WHERE id = $1;', [userId])).rows[0];
}

// Expects valid 'channelId'.
async function isAdmin(userId: number, channelId: number): Promise<boolean> {
    const result = await pool.query('SELECT adminid FROM channels WHERE id = $1;', [channelId]);
    return userId === result.rows[0].adminid;
}

export default { addUserToChannel, createMessage, removeUserFromChannel, channelExists, checkAdmin, getChannel, getUserById, isAdmin };