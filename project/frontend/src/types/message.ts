export interface Image {
    /**
     * Image URL.
     * URL of the image.
     */
    url: string;
    /**
     * Image description.
     * Text description of the image.
     */
    altText?: string;
}

export interface Message {
    /**
     * Room ID.
     * ID of the room, where message was sent.
     */
    roomId: number
    /**
     * Sender of the message.
     * The nickname (unique) of the user who sent the message.
     */
    senderNickname: string;
    /**
     * Time.
     * Time when message was sent.
     */
    date: string;
    /**
     * Message content.
     * A string representing the text of the message or Image.
     */
    data: string | Image;
}