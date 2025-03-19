const db = require('../db/db'); // Assurez-vous que la connexion à la base de données est configurée.

exports.getAddCharacterPage = (req, res) => {
    res.render('addCharacter', { success_msg: null, error_msg: null });
};

exports.addCharacter = (req, res) => {
    const { user_id, class_id, name, hp, attack, defense } = req.body;
    db.run(
        `INSERT INTO characters (user_id, class_id, name, hp, attack, defense) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, class_id, name, hp, attack, defense],
        function (err) {
            if (err) {
                console.error(err);
                return res.render('addCharacter', { success_msg: null, error_msg: "Erreur lors de l'ajout du personnage." });
            }
            res.redirect('/admin/characters'); // Retourne à la liste des personnages après ajout.
        }
    );
};

exports.getCharacters = (req, res) => {
    db.all(`SELECT * FROM characters`, [], (err, characters) => {
        if (err) {
            console.error(err);
            return res.render('addCharacter', { characters: [], error_msg: "Erreur lors de la récupération des personnages." });
        }
        res.render('addCharacter', { characters, error_msg: null });
    });
};

exports.deleteCharacter = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM characters WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error(err);
        }
        res.redirect('/admin/characters'); // Reste sur la liste des personnages après suppression.
    });
};

exports.getEditCharacterPage = (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM characters WHERE id = ?`, [id], (err, character) => {
        if (err || !character) {
            console.error(err);
            return res.redirect('/admin/characters');
        }
        res.render('editCharacter', { character });
    });
};

exports.editCharacter = (req, res) => {
    const { id } = req.params;
    const { user_id, class_id, name, hp, attack, defense } = req.body;
    db.run(
        `UPDATE characters SET user_id = ?, class_id = ?, name = ?, hp = ?, attack = ?, defense = ? WHERE id = ?`,
        [user_id, class_id, name, hp, attack, defense, id],
        function (err) {
            if (err) {
                console.error(err);
            }
            res.redirect('/admin/characters'); // Reste sur la liste des personnages après modification.
        }
    );
};

// Afficher la liste des personnages jouables
exports.listCharacters = (req, res) => {
    const query = "SELECT * FROM characters";

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.render('characterList', { characters: [], error_msg: "Erreur lors du chargement des personnages." });
        }
        res.render('characterList', { characters: rows, error_msg: null });
    });
};