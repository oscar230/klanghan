export const DAYS = ['Fredag', 'Lördag', 'Söndag'];

export const HOURS = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'));
export const QUARTERS = ['00', '15', '30', '45'];

export function formatOffset(minutes: number): string {
    const dayIndex = Math.floor(minutes / (24 * 60));
    const dayName = DAYS[Math.min(dayIndex, DAYS.length - 1)];
    
    const hour = Math.floor((minutes % (24 * 60)) / 60);
    const minute = minutes % 60;
    
    const hStr = hour.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    
    return `${dayName} ${hStr}:${mStr}`;
}

export function parseOffset(dayIndex: number, timeString: string): number {
    const [h, m] = timeString.split(':').map(Number);
    return (dayIndex * 24 * 60) + (h * 60) + (m || 0);
}

export function getDuration(startOffset: number, endOffset: number): string {
    const diff = endOffset - startOffset;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
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
