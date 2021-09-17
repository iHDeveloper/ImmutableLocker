export function bufferToHex(buffer) {
    return Array.from(buffer).map(x => x.toString(16).padStart(2, '0')).join('');
}

export function hexToBuffer(hex) {
    return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    }));
}
