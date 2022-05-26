const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'gksskwpfpaldpffldjtaortm');
        const userId = decodedToken.userId;
        req.auth = { userId };
        if (req.body.userId && req.body.userId !== userId) {
        throw "L'identifiant invalide ! ";
        } else {
        next();
        }
    } catch {
        res.status(401).json({
        error: new Error(' requête invalide !')
        });
    }
    };