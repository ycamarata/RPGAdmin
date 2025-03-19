// routes/userRoutes.js
const express = require('express');
const db = require('../db/db');
const router = express.Router();

// Route pour afficher les informations de l'utilisateur
router.get('/account', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const userId = req.session.userId;
    
    db.get('SELECT id, username, email FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            req.flash('error_msg', 'Utilisateur introuvable.');
            return res.redirect('/');
        }

        res.render('account', { user });
    });
});

// Route pour afficher le formulaire de modification du mot de passe
router.get('/account/editPassword', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    res.render('editPassword');
});

// Route pour modifier le mot de passe
router.post('/account/editPassword', (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash('error_msg', 'Tous les champs sont requis.');
        return res.redirect('/account/editPassword');
    }

    if (newPassword !== confirmPassword) {
        req.flash('error_msg', 'Les nouveaux mots de passe ne correspondent pas.');
        return res.redirect('/account/editPassword');
    }

    const userId = req.session.userId;

    // Récupérer le mot de passe actuel de l'utilisateur
    db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            req.flash('error_msg', 'Utilisateur introuvable.');
            return res.redirect('/');
        }

        // Vérifier le mot de passe actuel (ajoutez ici la comparaison avec le mot de passe hashé)
        if (user.password !== currentPassword) { // Utilisez un mécanisme de hachage pour les mots de passe en production
            req.flash('error_msg', 'Mot de passe actuel incorrect.');
            return res.redirect('/account/editPassword');
        }

        // Mettre à jour le mot de passe
        db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId], function(err) {
            if (err) {
                req.flash('error_msg', 'Erreur lors de la modification du mot de passe.');
                return res.redirect('/account/editPassword');
            }

            req.flash('success_msg', 'Mot de passe modifié avec succès.');
            res.redirect('/account');
        });
    });
});

module.exports = router;
