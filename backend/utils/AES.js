const CryptoJS = require('crypto-js');

const encrypt = (input) => {
    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_IV);
    const encryptedInput = CryptoJS.AES.encrypt(input, key, { iv : iv });

    return encryptedInput.toString();
}

const decrypt = (input) => {
    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_IV);
    const decryptedInput = CryptoJS.AES.decrypt(input, key, { iv : iv });

    return decryptedInput.toString();
}

module.exports = { encrypt }