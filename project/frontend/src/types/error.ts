export interface Error {
    message: string;
    type: 'auth/login' | 'auth/register' | 'auth/validateToken' | 'channels/createChannel' | 'channels/getChannels' | 'channels/getMessages' | 'channels/sendMessage';
}