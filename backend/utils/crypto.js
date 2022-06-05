const CryptoJS = require('crypto-js');

const AES = (req) => {
    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_IV);
    const encryptedEmail = CryptoJS.AES.encrypt(req.body.email, key, { iv : iv })

    return encryptedEmail;
}

module.exports = { AES }