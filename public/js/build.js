import { bytesToBase64, base64encode } from '/js/lib/base64.js';

async function hashPassphrase(passphrase) {
    // Hash the passphrase using SHA-256
    const encoded = new TextEncoder().encode(passphrase.normalize("NFKC"));
    const hash = await crypto.subtle.digest('SHA-256', encoded);
    return new Uint8Array(hash);
}

async function checksum(data) {
    // Checksum the data using SHA-512
    const encoded = new TextEncoder().encode(data.normalize("NFKC"));
    const hash = await crypto.subtle.digest('SHA-512', encoded);
    return new Uint8Array(hash);
}

function generateSalt() {
    // Generate a 64bit random salt using crypto API
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return array;
}

async function generateKey(hash, salt) {
    // Encrypt the hash with salt using scrypt
    return await scrypt.scrypt(hash, salt, 16, 16, 1, 32);
}

function encrypt(key, content) {
    // Encode the data within private key using AES-256
    const data = new TextEncoder().encode(content.normalize("NFKC"));
    const aes = new aesjs.ModeOfOperation.ctr(key);
    return aes.encrypt(data);
}

function encode(encryptedData) {
    // Encode encrypted data to Base64
    return bytesToBase64(encryptedData);
}

function bufferToHex(buffer) {
    return Array.from(buffer).map(x => x.toString(16).padStart(2, '0')).join('');
}

async function onBuild(metadata, content, passphrase, hint) {
    // Generate locker key
    const hash = await hashPassphrase(passphrase);
    const salt = generateSalt();
    const lockerKey = await generateKey(hash, salt);
    const encryptedData = encrypt(lockerKey, content);
    const encodedData = encode(encryptedData);
    document.getElementById("encrypted-content-preview").innerText = encodedData;

    var locker = {
        version: 'v1',
        metadata,
        security: {
            salt: bytesToBase64(salt),
            hint: base64encode(hint)
        },
        content: encodedData
    };

    const nonEncodedLocker = JSON.stringify(locker);
    const encodedLocker = base64encode(nonEncodedLocker);
    const lockerChecksum = await checksum(encodedLocker);
    document.getElementById("non-encoded-locker-preview").innerText = nonEncodedLocker;
    document.getElementById("encoded-locker-preview").innerText = encodedLocker;
    document.getElementById("checksum-preview").innerText = bufferToHex(lockerChecksum);
}

document.getElementById("build-form").onsubmit = (e) => {
    e.preventDefault();

    // Metadata
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const description = document.getElementById("description").value;

    // Content
    const content = document.getElementById("content").value;

    // Security
    const passphrase = document.getElementById("passphrase").value;
    const passphraseHint = document.getElementById("passphrase-hint").value;

    onBuild({title, author, description, date: new Date().toString()}, content, passphrase, passphraseHint);
};

async function test() {
    const passphrase = "my-secure-passphrase";

    console.log("Testing...");
    console.log("Passphrase: ", passphrase);

    const hashedPassphrase = await hashPassphrase(passphrase);
    const hexedHashedPassphrase = Array.from(hashedPassphrase).map(x => x.toString(16).padStart(2, '0')).join('');
    console.log("Hash Passphrase: ", hashedPassphrase);
    console.log("Hash Passphrase (Hex): ", hexedHashedPassphrase);

    const salt = generateSalt();
    console.log("Generated Salt: ", salt);
    console.log("Generated Salt (Base64): ", bytesToBase64(salt));
    console.log("Generated Salt (Hex): ", Array.from(salt).map(x => x.toString(16).padStart(2, '0')).join(''));

    console.log("Generating locker key...");

    {
        const lockerKey = await generateKey(hashedPassphrase, salt);
        console.log("Locker Key: ", lockerKey);
        console.log("Locker Key (hex): ", Array.from(lockerKey).map(x => x.toString(16).padStart(2, '0')).join(''));
    }

    const lockerKey = await generateKey(hashedPassphrase, salt);
    console.log("Locker Key: ", lockerKey);
    console.log("Locker Key (hex): ", Array.from(lockerKey).map(x => x.toString(16).padStart(2, '0')).join(''));
}
test();
