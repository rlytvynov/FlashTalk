import { Request, Response } from "express";
interface Message {
    channelId: string
    senderNickname: string;
    date: string;
    data: string;
}
interface Channel {
    id: string;
    name: string
    userNicknames: string[];
    messages: Message[];
}
const channels = new Map<string, Channel>([
    [
        "0x234",
        {
            id: "0x234",
            name: "General",
            userNicknames: ["Alice", "Bob", "Charlie", "Dave"],
            messages: [
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 0 * 60000).toISOString(), data: "Привет всем!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 1 * 60000).toISOString(), data: "Привет, как дела?" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 2 * 60000).toISOString(), data: "Всё отлично, спасибо. А ты как?" },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 3 * 60000).toISOString(), data: "Ребят, вы уже видели обновление?" },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 4 * 60000).toISOString(), data: "Да, очень классное!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 5 * 60000).toISOString(), data: "Особенно новая панель управления." },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 6 * 60000).toISOString(), data: "Мне понравился тёмный режим." },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 7 * 60000).toISOString(), data: "Кстати, когда следующая встреча?" },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 8 * 60000).toISOString(), data: "В пятницу в 15:00." },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 9 * 60000).toISOString(), data: "Успею, буду чуть раньше." },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 10 * 60000).toISOString(), data: "Я, может, опоздаю немного." },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 11 * 60000).toISOString(), data: "Главное — быть!" },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 12 * 60000).toISOString(), data: "А кто будет презентовать?" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 13 * 60000).toISOString(), data: "Я взялся за эту часть." },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 14 * 60000).toISOString(), data: "Если что — помогу." },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 15 * 60000).toISOString(), data: "Я подготовлю визуал." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 16 * 60000).toISOString(), data: "Всем спасибо за помощь!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 17 * 60000).toISOString(), data: "Кто-нибудь хочет кофе?" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 18 * 60000).toISOString(), data: "Мне — двойной, пожалуйста 😄" },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 19 * 60000).toISOString(), data: "Я за чай, спасибо." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 20 * 60000).toISOString(), data: "Сегодня кто-нибудь работает из офиса?" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 21 * 60000).toISOString(), data: "Я — да. Надо забрать документы." },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 22 * 60000).toISOString(), data: "Я из дома сегодня." },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 23 * 60000).toISOString(), data: "Тоже дома. С интернетом всё ок, к счастью." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 24 * 60000).toISOString(), data: "Хорошо, тогда в Zoom увидимся." },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 25 * 60000).toISOString(), data: "Ссылка на Zoom та же?" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 26 * 60000).toISOString(), data: "Да, я проверял — всё работает." },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 27 * 60000).toISOString(), data: "Добавьте, пожалуйста, в календарь." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 28 * 60000).toISOString(), data: "Уже в общем календаре." },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 29 * 60000).toISOString(), data: "Спасибо, удобно." },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 30 * 60000).toISOString(), data: "У нас что-то с GitHub Actions, заметили?" },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 31 * 60000).toISOString(), data: "Да, один пайплайн упал." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 32 * 60000).toISOString(), data: "Я гляну позже." },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 33 * 60000).toISOString(), data: "Отлично, спасибо!" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 34 * 60000).toISOString(), data: "У кого-нибудь есть шаблон отчёта?" },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 35 * 60000).toISOString(), data: "Сейчас скину." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 36 * 60000).toISOString(), data: "Спасибо, Дэйв!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 37 * 60000).toISOString(), data: "Есть новости по новому клиенту?" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 38 * 60000).toISOString(), data: "Пока молчат, жду ответа." },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 39 * 60000).toISOString(), data: "Хорошо, давай апдейт, как появится." },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 40 * 60000).toISOString(), data: "Обязательно!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 41 * 60000).toISOString(), data: "У нас отличная динамика, так держать!" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 42 * 60000).toISOString(), data: "Да, команда супер 💪" },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 43 * 60000).toISOString(), data: "До встречи на звонке!" },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 44 * 60000).toISOString(), data: "Пока-пока!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 45 * 60000).toISOString(), data: "Удачного дня!" },
                { channelId: "0x234", senderNickname: "Charlie", date: new Date(Date.now() - 46 * 60000).toISOString(), data: "До скорого!" },
                { channelId: "0x234", senderNickname: "Dave", date: new Date(Date.now() - 47 * 60000).toISOString(), data: "✌️" },
                { channelId: "0x234", senderNickname: "Alice", date: new Date(Date.now() - 48 * 60000).toISOString(), data: "P.S. не забудьте обновить таски!" },
                { channelId: "0x234", senderNickname: "Bob", date: new Date(Date.now() - 49 * 60000).toISOString(), data: "Сделаю сегодня вечером." },
            ]
        }
    ]
]);



export const getSearchedMessages = async (req: Request, res: Response): Promise<any> => {
    try {
        const query = (req.query.query as string || "").toLowerCase();
        const channel = req.query.channel as string || "0x234";
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const filtered = channels.get(channel)?.messages.filter((msg) => {
            return msg.data.toLowerCase().includes(query);
        }) || [];
        console.log("Filtered messages:", filtered.slice(offset, offset + limit));
        const paginated = filtered.slice(offset, offset + limit);
        return res.status(200).sendJson(paginated, "User retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}