// AdminControllers/adminClassesController.js
const db = require('../db/db');  // Importation de la base de données

// Affichage des classes
module.exports.getClasses = (req, res) => {
    db.all('SELECT * FROM classes', [], (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de la récupération des classes');
        }
        res.render('adminClasses', { classes: rows });
    });
};

// Ajout d'une nouvelle classe
module.exports.addClass = (req, res) => {
    const { name, description } = req.body;
    db.run(`
        INSERT INTO classes (name, description) 
        VALUES (?, ?)`, [name, description], function(err) {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de l\'ajout de la classe');
        }
        res.redirect('/admin/classes');
    });
};
