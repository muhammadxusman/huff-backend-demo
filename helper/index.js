export function GenerateOTP() {
    // Generates a random number between 1000 and 9999 (inclusive)
    return Math.floor(1000 + Math.random() * 9000);
}
