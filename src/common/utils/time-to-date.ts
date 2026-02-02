export function timeToDate(time: string) {
    return new Date(`1970-01-01T${time}:00.000Z`);
}
