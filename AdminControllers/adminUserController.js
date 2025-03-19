const bcrypt = require('bcrypt');
const db = require('../db/db');
const saltRounds = 10;

module.exports.registerUser = (req, res) => {
    const { username, password } = req.body;  // Pas besoin de récupérer l'email

    // Vérifier s'il s'agit du premier utilisateur
    db.get('SELECT COUNT(*) AS count FROM users', [], (err, row) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de l\'inscription');
        }

        const isAdmin = row.count === 0 ? 1 : 0;  // Premier utilisateur devient admin

        // Hachage du mot de passe avec bcrypt
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Erreur lors du hachage du mot de passe');
            }

            // Insertion de l'utilisateur avec mot de passe haché
            db.run(`
                INSERT INTO users (username, password, isAdmin) 
                VALUES (?, ?, ?)`, [username, hashedPassword, isAdmin], function(err) {
                if (err) {
                    console.log("Erreur lors de l'insertion dans la base de données : ", err.message);
                    return res.status(500).send('Erreur lors de l\'inscription');
                }
                 // Redirection vers la page de connexion après une inscription réussie
                 res.redirect('/login');
            });
        });
    });
};

module.exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    // Rechercher l'utilisateur par son nom d'utilisateur
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de la connexion');
        }

        if (!row) {
            return res.status(400).send('Utilisateur non trouvé');
        }

        // Comparer le mot de passe saisi avec celui stocké
        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Erreur lors de la connexion');
            }

            if (!isMatch) {
                return res.status(400).send('Mot de passe incorrect');
            }

            // Si les informations sont valides, on peut créer une session ou rediriger
            req.session.userId = row.id; // Exemple d'utilisation d'une session pour stocker l'id de l'utilisateur
            req.session.username = row.username; // Stocker également le nom d'utilisateur
            req.session.isAdmin = row.isAdmin; // Stocker les droits administratifs

            // Vérification du statut de l'utilisateur
            if (row.isAdmin) {
                // Redirection vers la page d'administration si l'utilisateur est admin
                res.redirect('/admin');
            } else {
                // Redirection vers la page de sélection de personnage si l'utilisateur n'est pas admin
                res.redirect('/selectCharacter');
            }
        });
    });
};

module.exports.manageUsers = (req, res) => {
    // Récupérer tous les utilisateurs
    db.all('SELECT id, username, isAdmin, created_at FROM users', [], (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de la récupération des utilisateurs');
        }

        // Rendre la page manageUser.ejs avec les données des utilisateurs
        res.render('manageUser', { users: rows });
    });
};

module.exports.deleteUser = (req, res) => {
    const userId = req.params.id;

    // Supprimer l'utilisateur de la base de données
    db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
            console.log("Erreur lors de la suppression de l'utilisateur :", err.message);
            return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
        }

        console.log(`Utilisateur avec l'ID ${userId} supprimé avec succès.`);
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    });
};

module.exports.toggleAdminStatus = (req, res) => {
    const { userId, isAdmin } = req.body;

    // Vérifier si l'utilisateur connecté est "Yan"
    if (req.session.username !== 'Yan') {
        return res.status(403).send('Accès refusé. Vous ne pouvez pas modifier les privilèges administratifs.');
    }

    // Mettre à jour le statut admin de l'utilisateur spécifié
    db.run(
        `UPDATE users SET isAdmin = ? WHERE id = ?`,
        [isAdmin ? 1 : 0, userId],
        function (err) {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Erreur lors de la modification des privilèges administratifs.');
            }

            res.status(200).send('Privilèges administratifs mis à jour avec succès.');
        }
    );
};

