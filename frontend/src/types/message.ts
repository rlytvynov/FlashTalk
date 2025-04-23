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
     * Channel ID.
     * ID of the channel, where message was sent.
     */
    channelId: string
    /**
     * Sender of the message.
     * The name and id of the user who sent the message.
     */
    authorId: string;
    authorName: string;
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