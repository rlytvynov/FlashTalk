export const formatTimestamp = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    })
    const dateFormatted = date.toLocaleDateString("en-GB", { month: "short", day: "2-digit" }).replace(/\//g, ".");
    return isToday ? time : dateFormatted.slice(0, 5) + " " + time;
};
