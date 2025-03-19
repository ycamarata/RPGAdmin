const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./db/db');  // Importation de la base de données
const authMiddleware = require('./Middleware/authMiddleware');  // Importation du middleware
const flash = require('connect-flash');
const app = express();
const router = express.Router();
const Monster = require('./Models/monsterModel'); 
const userRoutes = require('./Routes/userRoutes');

// Utiliser les routes définies dans userRoutes.js
app.use(userRoutes);

// Configurer EJS et express-ejs-layouts
app.set('view engine', 'ejs');
app.set('views', __dirname + '/Views');

// Middleware pour gérer les fichiers statiques (CSS, JS, images, etc.)
app.use(express.static(__dirname + '/public'));

// Configuration de la session
app.use(session({
    secret: 'mySecret', // Utilise un secret pour signer les cookies de session
    resave: false,
    saveUninitialized: true
}));

// Configuration de connect-flash
app.use(flash());

// Middleware pour rendre les messages flash accessibles dans toutes les vues
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

app.use((req, res, next) => {
    res.locals.user = req.session.user; // Si tu utilises des sessions pour l'authentification
    next();
});

// Importation des contrôleurs
const adminClassesController = require('./AdminControllers/adminClassController');
const adminCharacterController = require('./AdminControllers/adminCharacterController');
const adminEquipmentsController = require('./AdminControllers/adminEquipementController');
const adminUserController = require('./AdminControllers/adminUserController');
const adminMonsterController = require('./AdminControllers/adminMonsterController');

// Middleware pour le parsing des corps de requête
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes publiques
// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.render('index');
});

// Route pour l'inscription des utilisateurs (accessible par tout le monde)
app.get('/register', (req, res) => {
    res.render('register'); // Page d'inscription
});
app.post('/register', adminUserController.registerUser); // Traitement du formulaire d'inscription

// Route pour afficher la page de connexion
app.get('/login', (req, res) => {
    res.render('login');
});
// Route pour gérer la connexion (POST)
app.post('/login', adminUserController.loginUser);

// Route pour afficher la page de sélection de personnage
app.get('/selectCharacter', (req, res) => {
    if (!req.session.userId) {
        // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
        return res.redirect('/login');
    }
    
    // Si l'utilisateur est connecté, afficher la page de sélection de personnage
    res.render('selectCharacter'); // Créez le fichier selectCharacter.ejs pour cette page
});

// Route pour afficher la page d'administration
app.get('/admin', (req, res) => {
    if (!req.session.userId || req.session.isAdmin === 0) {
        // Si l'utilisateur n'est pas admin, redirigez-le vers la page d'accueil ou autre
        return res.redirect('/');
    }
    // Si l'utilisateur est admin, afficher la page d'administration
    res.render('admin'); 
});

// Route pour afficher la page de gestion des utilisateurs
app.get('/manageUsers', (req, res) => {
    if (!req.session.userId || req.session.isAdmin === 0) {
        // Si l'utilisateur n'est pas admin, le rediriger vers l'accueil
        return res.redirect('/');
    }

    // Appeler la fonction de gestion des utilisateurs
    adminUserController.manageUsers(req, res);
});

// Route pour supprimer un utilisateur
app.delete('/admin/deleteUser/:id', adminUserController.deleteUser);

//Route pour modifier le statut d'un utilisateur
app.post('/toggleAdminStatus', adminUserController.toggleAdminStatus);

// Routes administrateur - Protection avec middleware
app.use('/admin', authMiddleware.checkAdmin);

// Route pour afficher la page d'administration des monstres
app.get('/admin/monsters', adminMonsterController.getMonsters); // Affiche les monstres existants

// Route pour afficher la liste des monstres dans la page "addMonster.ejs"
app.get('/admin/monsters/add', (req, res) => {
    // Récupérer les monstres de la base de données
    db.all('SELECT * FROM monsters', (err, rows) => {
        if (err) {
            console.log('Erreur lors de la récupération des monstres:', err);
            req.flash('error_msg', 'Erreur lors de la récupération des monstres.');
            return res.redirect('/admin/monsters'); // Redirection vers la page des monstres si erreur
        }
        // Passer les monstres à la vue addMonster.ejs
        res.render('addMonster', { monsters: rows });
    });
});

// Route pour ajouter un monstre
app.post('/admin/monsters', (req, res) => {
    const { name, hp, attack, defense } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!name || !hp || !attack || !defense) {
        req.flash('error_msg', 'Tous les champs sont requis.');
        return res.redirect('/admin/monsters');
    }

    // Insérer le monstre dans la base de données
    db.run('INSERT INTO monsters (name, hp, attack, defense) VALUES (?, ?, ?, ?)', 
        [name, hp, attack, defense], function(err) {
            if (err) {
                console.log("Erreur lors de l'insertion du monstre : ", err.message);
                req.flash('error_msg', 'Erreur lors de l\'ajout du monstre.');
                return res.redirect('/admin/monsters');
            }

            // Si l'ajout est réussi, afficher un message de succès
            req.flash('success_msg', 'Monstre ajouté avec succès !');
            res.redirect('/admin/monsters'); // Redirection vers la page de gestion des monstres
        });
});

// Route pour supprimer un monstre
app.post('/admin/monsters/delete/:id', (req, res) => {
    const monsterId = req.params.id;

    // Suppression du monstre de la base de données
    db.run('DELETE FROM monsters WHERE id = ?', [monsterId], function(err) {
        if (err) {
            console.log("Erreur lors de la suppression du monstre : ", err.message);
            req.flash('error_msg', 'Erreur lors de la suppression du monstre.');
            return res.redirect('/admin/monsters');
        }

        // Si tout se passe bien, afficher un message de succès et rediriger vers la liste des monstres
        req.flash('success_msg', 'Monstre supprimé avec succès !');
        res.redirect('/admin/monsters');
    });
});

// Route pour afficher le formulaire de modification d'un monstre
app.get('/admin/monsters/edit/:id', (req, res) => {
    const monsterId = req.params.id;

    db.get('SELECT * FROM monsters WHERE id = ?', [monsterId], (err, monster) => {
        if (err || !monster) {
            req.flash('error_msg', 'Monstre introuvable.');
            return res.redirect('/admin/monsters');
        }

        res.render('editMonster', { monster });
    });
});

// Route pour mettre à jour les informations d'un monstre
app.post('/admin/monsters/edit/:id', (req, res) => {
    const monsterId = req.params.id;
    const { name, hp, attack, defense } = req.body;

    db.run('UPDATE monsters SET name = ?, hp = ?, attack = ?, defense = ? WHERE id = ?',
        [name, hp, attack, defense, monsterId], function(err) {
            if (err) {
                req.flash('error_msg', 'Erreur lors de la mise à jour du monstre.');
                return res.redirect(`/admin/monsters/edit/${monsterId}`);
            }

            req.flash('success_msg', 'Monstre mis à jour avec succès !');
            res.redirect('/admin/monsters');
        });
});

// Route pour afficher la page d'ajout de personnage
app.get('/admin/characters/add', (req, res) => {
    res.render('addCharacter');  // Affiche la vue addCharacter.ejs
});

// Route pour afficher la liste des personnages jouables
app.get('/admin/characters', (req, res) => {
    // Requête SQL pour récupérer tous les personnages
    db.all('SELECT * FROM characters', (err, characters) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur lors de la récupération des personnages');
        }
        // Rendu de la vue avec les personnages récupérés
        res.render('characterList', { characters });
    });
});

// Route pour ajouter un personnage jouable
app.post('/admin/characters/add', adminCharacterController.addCharacter);

// Route pour supprimer un personnage
app.post('/admin/characters/delete/:id', (req, res) => {
    const characterId = req.params.id;

    db.run("DELETE FROM characters WHERE id = ?", [characterId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la suppression du personnage");
        }
        // Redirection vers la page de la liste des personnages après la suppression
        res.redirect('/admin/characters');
    });
});

// Route pour afficher le formulaire de modification d'un personnage
app.get('/admin/characters/edit/:id', (req, res) => {
    const characterId = req.params.id;

    db.get("SELECT * FROM characters WHERE id = ?", [characterId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la récupération du personnage");
        }
        if (!row) {
            return res.status(404).send("Personnage non trouvé");
        }
        res.render('editCharacter', { character: row });
    });
});

// Route pour traiter la modification d'un personnage
app.post('/admin/characters/edit/:id', (req, res) => {
    const characterId = req.params.id;
    const { name, class_id, hp, attack, defense } = req.body;

    db.run(`
        UPDATE characters 
        SET name = ?, class_id = ?, hp = ?, attack = ?, defense = ? 
        WHERE id = ?`,
        [name, class_id, hp, attack, defense, characterId], function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors de la modification du personnage");
            }
            // Redirection vers la liste des personnages après la modification
            res.redirect('/admin/characters');
    });
});

// Lancer le serveur
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
