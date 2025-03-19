// Middleware/authMiddleware.js
const db = require('../db/db'); // Mise à jour du chemin d'importation

module.exports.checkAdmin = (req, res, next) => {
    const userId = req.session.userId;

    db.get('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de la vérification du rôle');
        }

        if (row && row.isAdmin === 1) {
            return next();
        }

        res.status(403).send('Accès interdit. Vous devez être administrateur.');
    });
};
