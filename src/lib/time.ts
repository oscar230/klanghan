export const DAYS = ['Fredag', 'Lördag', 'Söndag', 'Måndag'];

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
