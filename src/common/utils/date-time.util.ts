export const formatTime = (value: Date | string): string => {
    const date = value instanceof Date ? value : new Date(value);

    return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};
export const timeToDate = (baseDate: Date, time: string) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
}

export const isFuture = (date: Date | string): boolean => {
    return new Date(date).getTime() > Date.now();
};

export const isPast = (date: Date | string): boolean => {
    return new Date(date).getTime() < Date.now();
};

export const today = new Date()