export const DAYS = ['Fredag', 'Lördag', 'Söndag'];

/** What something ending exactly at the festival's end (00:00 after the last day) is said to end on. */
export const AFTER_FESTIVAL = 'Måndag';

const MINUTES_PER_DAY = 24 * 60;

/** Time of day ("HH:MM") for an offset. */
export function formatClock(minutes: number): string {
    const t = minutes % MINUTES_PER_DAY;
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Minutes since midnight for an "HH:MM" string, or null if invalid. */
export function parseClockTime(value: string): number | null {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function formatOffset(minutes: number): string {
    const dayIndex = Math.floor(minutes / (24 * 60));
    const dayName = dayIndex >= DAYS.length ? AFTER_FESTIVAL : DAYS[dayIndex];
    
    const hour = Math.floor((minutes % (24 * 60)) / 60);
    const minute = minutes % 60;
    
    const hStr = hour.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    
    return `${dayName} ${hStr}:${mStr}`;
}

export function parseOffset(dayIndex: number, clockMinutes: number): number {
    return dayIndex * MINUTES_PER_DAY + clockMinutes;
}

export function getDuration(startOffset: number, endOffset: number): string {
    const diff = endOffset - startOffset;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0 && minutes > 0) return `${hours} h ${minutes} min`;
    if (hours > 0) return `${hours} h`;
    return `${minutes} min`;
}

export function formatShiftTime(start: number, end: number): string {
    const startStr = formatOffset(start);
    const endStr = formatOffset(end);
    const duration = getDuration(start, end);
    
    const startDay = startStr.split(' ')[0];
    const endDay = endStr.split(' ')[0];
    
    if (startDay === endDay) {
        const startTime = startStr.split(' ')[1];
        const endTime = endStr.split(' ')[1];
        return `${startDay} ${startTime} - ${endTime} (${duration})`;
    }
    
    return `${startStr} - ${endStr} (${duration})`;
}

/** Groups items by the festival day they start on. Days without items are left out. */
export function groupByStartDay<T extends { startOffset: number }>(items: T[]) {
    return DAYS.map((name, dayIndex) => ({
        name,
        items: items.filter((item) => Math.floor(item.startOffset / MINUTES_PER_DAY) === dayIndex)
    })).filter((day) => day.items.length > 0);
}
