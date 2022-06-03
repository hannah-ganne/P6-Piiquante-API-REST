const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

/**
 * user sign up
 */
exports.signup = (req, res, next) => {
    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_IV);
    const encryptedEmail = CryptoJS.AES.encrypt(req.body.email, key, { iv : iv })

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
        email: encryptedEmail,
        password: hash
        });
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

/**
 * user log in
 */
exports.login = (req, res, next) => {

    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTOJS_IV);
    const encryptedEmail = CryptoJS.AES.encrypt(req.body.email, key, { iv : iv })

    User.findOne({ email: encryptedEmail.toString() })
        .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
            if (!valid) {
                return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '24h' }
                    ) 
            });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};