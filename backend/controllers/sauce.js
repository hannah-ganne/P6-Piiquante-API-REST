const Sauce = require('../models/Sauce');
const fs = require('fs');

    /**
 * Load all the sauces
 */
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

/**
 * Load one specific sauce
 */
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

/**
 * Upload a new sauce
 */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.token.userId,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
    };

/**
 * Modify one specific sauce
 */
exports.modifySauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        // Verification
        if (!sauce) {
            return res.status(404).json({
                error: new Error('Sauce non trouvée !')
            })
        }
        if (sauce.userId !== req.token.userId) {
            return res.status(403).json({
                error: new Error('Requête non autorisée !')
            })
        }

        // Modification
        let sauceObject;
        if(req.file) {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlinkSync(`images/${filename}`);

            sauceObject = {
                ...JSON.parse(req.body.sauce),
                userId: req.token.userId,
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
        } else {
            sauceObject = { ...req.body, userId: req.token.userId}
        }

        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(sauce => res.status(200).json({ message: 'Sauce modifié !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

/**
 * Delete one specific sauce
 */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        if (!sauce) {
            return res.status(404).json({
                error: new Error('Sauce non trouvée !')
            })
        }
        if (sauce.userId !== req.token.userId) {
            return res.status(403).json({
                error: new Error('Requête non autorisée !')
            })
        }
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
};

/**
 * Like/dislike, or undo like/dislike a sauce
 */
exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const usersLiked = sauce.usersLiked;
        const usersDisliked = sauce.usersDisliked;
        const userId = req.token.userId;

        switch (req.body.like) {
            case 1:
                if (!usersLiked.includes(userId) && !usersDisliked.includes(userId)) {
                    usersLiked.push(userId);
                }
                break;
            case -1:
                if (!usersDisliked.includes(userId) && !usersLiked.includes(userId)) {
                    usersDisliked.push(userId);
                }
                break;
            case 0:
                if (usersLiked.includes(userId)) {
                    usersLiked.remove(userId)}
                    else if (usersDisliked.includes(userId)){
                        usersDisliked.remove(userId)
                    }
                break;
        }
        sauce.likes = sauce.usersLiked.length;
        sauce.dislikes = sauce.usersDisliked.length;
        sauce.save()
            .then(() => res.status(201).json({ message: 'Sauce notée !'}))
            .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
}