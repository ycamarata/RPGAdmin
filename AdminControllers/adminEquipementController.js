// AdminControllers/adminEquipmentsController.js
const db = require('../db/db');  // Importation de la base de données

// Affichage des équipements
module.exports.getEquipments = (req, res) => {
    db.all('SELECT * FROM equipments', [], (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de la récupération des équipements');
        }
        res.render('adminEquipments', { equipments: rows });
    });
};

// Ajout d'un équipement
module.exports.addEquipment = (req, res) => {
    const { name, type, stats } = req.body;
    db.run(`
        INSERT INTO equipments (name, type, stats) 
        VALUES (?, ?, ?)`, [name, type, stats], function(err) {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Erreur lors de l\'ajout de l\'équipement');
        }
        res.redirect('/admin/equipments');
    });
};
