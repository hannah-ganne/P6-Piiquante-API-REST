const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Trop de tentatives de connexion ont été effectuées à partir de cette IP, veuillez réessayer dans une heure"
})

module.exports = { loginLimiter }