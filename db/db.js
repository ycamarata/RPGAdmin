const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

// Création des tables
db.serialize(() => {
    // Table utilisateurs
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            isAdmin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table monstres
    db.run(`
        CREATE TABLE IF NOT EXISTS monsters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hp INTEGER NOT NULL,
            attack INTEGER NOT NULL,
            defense INTEGER NOT NULL,
            image_url TEXT
        )
    `);
    // Pour insérer ou mettre à jour un monstre avec une image
const updateMonsterWithImage = (id, imageUrl) => {
    db.run(`
        UPDATE monsters
        SET image_url = ?
        WHERE id = ?
    `, [imageUrl, id], (err) => {
        if (err) {
            console.log("Erreur lors de la mise à jour de l'image :", err.message);
        } else {
            console.log("Image mise à jour avec succès.");
        }
    });
};

    // Table classes
    db.run(`
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    `);

    // Table personnages
    db.run(`
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            class_id INTEGER,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            hp INTEGER NOT NULL,
            attack INTEGER NOT NULL,
            defense INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (class_id) REFERENCES classes(id)
        )
    `);

    // Table équipements
    db.run(`
        CREATE TABLE IF NOT EXISTS equipments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            attack_bonus INTEGER DEFAULT 0,
            defense_bonus INTEGER DEFAULT 0
        )
    `);
});

module.exports = db;
