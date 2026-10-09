const express = require("express");
const router = express.Router();
const db = require("../database");

// GET - Obtener todas las categorías
router.get("/", (req, res) => {
  db.all("SELECT * FROM categorias", [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        statusCode: 500,
        data: [],
        error: err.message
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: rows
    });
  });
});

// POST - Crear una categoría
router.post("/", (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: "El nombre es obligatorio"
    });
  }

  db.run(
    "INSERT INTO categorias (nombre) VALUES (?)",
    [nombre],
    function (err) {
      if (err) {
        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      res.status(201).json({
        statusCode: 201,
        data: {
          id: this.lastID,
          nombre
        }
      });
    }
  );
});

// DELETE - Eliminar categoría
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM categorias WHERE id = ?",
    [id],
    function (err) {

      if (err) {
        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      // No se encontró ninguna categoría con ese ID
      if (this.changes === 0) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          error: "Categoría no encontrada"
        });
      }

      res.status(200).json({
        statusCode: 200,
        data: {
          message: "Categoría eliminada correctamente"
        }
      });
    }
  );
});

module.exports = router;