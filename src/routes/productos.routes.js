const express = require("express");
const router = express.Router();
const db = require("../database");

// PUT - Actualizar producto
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    precio,
    stock,
    categoria_id
  } = req.body;

  // Validar datos obligatorios
  if (
    !nombre ||
    precio == null ||
    stock == null ||
    !categoria_id
  ) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: "Nombre, precio, stock y categoria_id son obligatorios"
    });
  }

  const sql = `
    UPDATE productos
    SET
      nombre = ?,
      precio = ?,
      stock = ?,
      categoria_id = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      nombre,
      precio,
      stock,
      categoria_id,
      id
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      // El producto no existe
      if (this.changes === 0) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          error: "Producto no encontrado"
        });
      }

      res.status(200).json({
        statusCode: 200,
        data: {
          id: Number(id),
          nombre,
          precio,
          stock,
          categoria_id
        }
      });
    }
  );
});

// GET - Obtener todos los productos
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      productos.id,
      productos.nombre,
      productos.precio,
      productos.stock,
      productos.categoria_id,
      categorias.nombre AS categoria
    FROM productos
    INNER JOIN categorias
      ON productos.categoria_id = categorias.id
  `;

  db.all(sql, [], (err, rows) => {
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

// GET - Obtener producto por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      productos.id,
      productos.nombre,
      productos.precio,
      productos.stock,
      productos.categoria_id,
      categorias.nombre AS categoria
    FROM productos
    INNER JOIN categorias
      ON productos.categoria_id = categorias.id
    WHERE productos.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        statusCode: 500,
        data: [],
        error: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        statusCode: 404,
        data: [],
        error: "Producto no encontrado"
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: row
    });
  });
});

// POST - Crear producto
router.post("/", (req, res) => {
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre || precio === undefined || stock === undefined || !categoria_id) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: "Todos los campos son obligatorios"
    });
  }

  const sql = `
    INSERT INTO productos
    (nombre, precio, stock, categoria_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [nombre, precio, stock, categoria_id],
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
          nombre,
          precio,
          stock,
          categoria_id
        }
      });
    }
  );
});

// DELETE - Eliminar producto
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM productos WHERE id = ?",
    [id],
    function (err) {

      if (err) {
        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      // No se eliminó ninguna fila
      if (this.changes === 0) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          error: "Producto no encontrado"
        });
      }

      res.status(200).json({
        statusCode: 200,
        data: {
          message: "Producto eliminado correctamente"
        }
      });
    }
  );
});


module.exports = router;