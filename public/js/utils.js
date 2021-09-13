export function bufferToHex(buffer) {
    return Array.from(buffer).map(x => x.toString(16).padStart(2, '0')).join('');
}
