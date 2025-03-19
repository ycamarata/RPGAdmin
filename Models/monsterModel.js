const db = require('../db/db'); // Assure-toi que tu as bien configuré ta connexion à la base de données

// Fonction pour récupérer tous les monstres
const getAllMonsters = (callback) => {
    db.all('SELECT * FROM monsters', [], (err, rows) => {
        if (err) {
            console.error("Erreur lors de la récupération des monstres :", err);
            return callback(err, null);
        }
        return callback(null, rows);
    });
};

// Fonction pour ajouter un monstre
const addMonster = (name, hp, attack, defense, callback) => {
    db.run('INSERT INTO monsters (name, hp, attack, defense) VALUES (?, ?, ?, ?)', [name, hp, attack, defense], function(err) {
        if (err) {
            console.error("Erreur lors de l'ajout du monstre :", err);
            return callback(err);
        }
        return callback(null);
    });
};

module.exports = {
    getAllMonsters,
    addMonster
};
