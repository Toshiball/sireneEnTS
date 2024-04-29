export const convertMsToMinutesSeconds = (ms : number) => {
    // Convert milliseconds to seconds
    const seconds = Math.floor(ms / 1000);

    // Calculate the number of minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return { minutes: minutes, seconds: remainingSeconds };
}