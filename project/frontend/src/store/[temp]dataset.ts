import {Message, Image} from "../types/message.ts";
import {Room} from "../types/room.ts";

const generateRandomMessage = (roomId: number, senderNickname: string): Message => {
    const isImageMessage = Math.random() < 0.2;

    // Получаем текущую дату
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    const formattedDate = `${day}.${month}.${year}`;

    if (isImageMessage) {
        const image: Image = {
            url: `https://www.pinkbus.ru/im/600x600/1767973/146/6442628/51.jpg?ts=v2_1668582550`,
            altText: `Image in room ${roomId}`
        };
        return {
            roomId,
            senderNickname,
            data: image,
            date: formattedDate
        };
    } else {
        return {
            roomId,
            senderNickname,
            data: `This is a message from ${senderNickname} in room ${roomId} kdsmcmds sdmds pmfds fos`,
            date: formattedDate
        };
    }
};



const generateRoomMessages = (roomId: string, participants: string[], messageCount: number): Message[] => {
    const messages: Message[] = [];
    for (let i = 0; i < messageCount; i++) {
        const sender = participants[Math.floor(Math.random() * participants.length)];
        messages.push(generateRandomMessage(parseInt(roomId), sender));
    }
    return messages;
};

const rooms: Room[] = [];

for (let i = 0; i < 5; i++) {
    const roomId = (i + 1).toString();
    const participants = [`user${i + 1}`, `user${i + 2}`];
    const messages = generateRoomMessages(roomId, participants, 50);
    rooms.push({
        id: roomId,
        name: `Room ${i + 1}`,
        userNicknames: participants,
        messages
    });
}

export default rooms