import { bytesToBase64 } from '/js/lib/base64.js';

export async function hashPassphrase(passphrase) {
    // Hash the passphrase using SHA-256
    const encoded = new TextEncoder().encode(passphrase.normalize("NFKC"));
    const hash = await crypto.subtle.digest('SHA-256', encoded);
    return new Uint8Array(hash);
}

export async function checksum(data) {
    // Checksum the data using SHA-512
    const encoded = new TextEncoder().encode(data.normalize("NFKC"));
    const hash = await crypto.subtle.digest('SHA-512', encoded);
    return new Uint8Array(hash);
}

export function generateSalt() {
    // Generate a 64bit random salt using crypto API
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return array;
}

export async function generateKey(hash, salt) {
    // Encrypt the hash with salt using scrypt
    return await scrypt.scrypt(hash, salt, 16, 16, 1, 32);
}

export function encrypt(key, content) {
    // Encode the data within encryption key using AES-256
    const data = new TextEncoder().encode(content.normalize("NFKC"));
    const aes = new aesjs.ModeOfOperation.ctr(key);
    return aes.encrypt(data);
}

export function decrypt(key, bytes) {
    // Decode the bytes data within encryption key using AES-256
    const aes = new aesjs.ModeOfOperation.ctr(key);
    const data = aes.decrypt(bytes);
    return new TextDecoder().decode(data);
}

export function encode(encryptedData) {
    // Encode encrypted data to Base64
    return bytesToBase64(encryptedData);
}

// async function test() {
//     const passphrase = "my-secure-passphrase";

//     console.log("Testing...");
//     console.log("Passphrase: ", passphrase);

//     const hashedPassphrase = await hashPassphrase(passphrase);
//     const hexedHashedPassphrase = Array.from(hashedPassphrase).map(x => x.toString(16).padStart(2, '0')).join('');
//     console.log("Hash Passphrase: ", hashedPassphrase);
//     console.log("Hash Passphrase (Hex): ", hexedHashedPassphrase);

//     const salt = generateSalt();
//     console.log("Generated Salt: ", salt);
//     console.log("Generated Salt (Base64): ", bytesToBase64(salt));
//     console.log("Generated Salt (Hex): ", Array.from(salt).map(x => x.toString(16).padStart(2, '0')).join(''));

//     console.log("Generating locker key...");

//     {
//         const lockerKey = await generateKey(hashedPassphrase, salt);
//         console.log("Locker Key: ", lockerKey);
//         console.log("Locker Key (hex): ", Array.from(lockerKey).map(x => x.toString(16).padStart(2, '0')).join(''));
//     }

//     const lockerKey = await generateKey(hashedPassphrase, salt);
//     console.log("Locker Key: ", lockerKey);
//     console.log("Locker Key (hex): ", Array.from(lockerKey).map(x => x.toString(16).padStart(2, '0')).join(''));
// }
