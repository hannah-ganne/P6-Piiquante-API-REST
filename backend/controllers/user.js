const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const rateLimit = require('express-rate-limit');
const app = express();

/**
 * validate if password conditions are met
 */
const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.has().uppercase()
.has().lowercase()
.has().digits(3)

/**
 * 
 * limit signup and login attempts per IP
 */
const createAccountLimiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 5,
        message: 'Trop de comptes créés à partir de cette IP, veuillez réessayer dans 10 minutes.'
})



/**
 * user sign up
 */
exports.signup = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
            email: req.body.email,
            password: hash
            });
            user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ error: 'Mot de passe invalide !' })
    }
};

/**
 * user log in
 */
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
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
                    'gksskwpfpaldpffldjtaortm',
                    { expiresIn: '24h' }
                    ) 
            });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};