const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const databaseDir = path.join(__dirname, "..", "database");

if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, {
    recursive: true
  });
}

const dbPath = path.join(databaseDir, "webapp.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err.message);
  } else {
    console.log("Base de datos SQLite conectada correctamente.");
  }
});

db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      categoria_id INTEGER NOT NULL,
      FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      edad INTEGER NOT NULL
    )
  `);

});

module.exports = db;