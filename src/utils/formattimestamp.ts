export function formatTimestamp(timestamp: number): string {
    const now = new Date();
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    if (date >= today) {
        // If the date is today, return the time
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    } else if (date >= yesterday && date < today) {
        // If the date is yesterday
        return 'Yesterday';
    } else if (date >= oneWeekAgo && date < yesterday) {
        // If the date is within the last week, return the day of the week
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        // Otherwise, return the date in MM/DD/YY format
        return date.toLocaleDateString('en-US');
    }
}
