export async function tillTrue(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
): Promise<boolean> {
    let elapsed = 0;
    while (!condition()) {
        if (elapsed >= timeout) return false;
        await new Promise(res => setTimeout(res, interval));
        elapsed += interval;
    }
    return true;
}
