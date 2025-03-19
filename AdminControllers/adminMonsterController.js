const db = require('../db/db');
const Monster = require('../Models/monsterModel');  // Assurez-vous que ce modèle existe et est bien configuré

// Fonction pour afficher les monstres
exports.getMonsters = (req, res) => {
    db.all('SELECT * FROM monsters', (err, rows) => {
        if (err) {
            console.log('Erreur lors de la récupération des monstres:', err);
            req.flash('error_msg', 'Erreur lors de la récupération des monstres.');
            return res.redirect('/admin/monsters');
        }

        res.render('adminMonster', { monsters: rows }); // Passer les monstres à la vue adminMonster.ejs
    });
};


// Route pour afficher la page adminMonster
module.exports.getMonsters = (req, res) => {
    db.all('SELECT * FROM monsters', [], (err, rows) => {
        if (err) {
            console.log("Erreur lors de la récupération des monstres :", err.message);
            return res.status(500).send('Erreur lors de la récupération des monstres');
        }

        // Passer les données des monstres à la vue
        res.render('adminMonster', { monsters: rows });
    });
};

module.exports.addMonster = (req, res) => {
    const { name, hp, attack, defense } = req.body;

    db.run(`
        INSERT INTO monsters (name, hp, attack, defense) 
        VALUES (?, ?, ?, ?)`, [name, hp, attack, defense], function(err) {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de l\'ajout du monstre');
        }
        res.redirect('/admin/monsters');
    });
};