const express = require("express");
const router = express.Router();
const db = require("../database");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarUsuario(body) {
  const { nombre, email, password, edad } = body;

  if (!nombre || !email || !password || edad === undefined || edad === null) {
    return "Nombre, email, password y edad son obligatorios";
  }

  if (typeof nombre !== "string" || nombre.trim().length < 3) {
    return "El nombre debe contener al menos 3 caracteres";
  }

  if (typeof email !== "string" || !emailRegex.test(email)) {
    return "El correo electrónico no es válido";
  }

  if (typeof password !== "string" || password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  if (!Number.isInteger(edad) || edad <= 0) {
    return "La edad debe ser un número entero mayor a 0";
  }

  if (edad > 120) {
    return "La edad no puede ser mayor a 120";
  }

  return null;
}

// POST - Crear usuario
router.post("/", (req, res) => {
  const errorValidacion = validarUsuario(req.body);

  if (errorValidacion) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: errorValidacion
    });
  }

  const {
    nombre,
    email,
    password,
    edad
  } = req.body;

  const sql = `
    INSERT INTO usuarios
    (nombre, email, password, edad)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [nombre.trim(), email.trim(), password, edad],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({
            statusCode: 409,
            data: [],
            error: "El email ya está registrado"
          });
        }

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
          nombre: nombre.trim(),
          email: email.trim(),
          edad
        }
      });
    }
  );
});

// GET - Obtener todos los usuarios
router.get("/", (req, res) => {
  const sql = `
    SELECT id, nombre, email, edad
    FROM usuarios
    ORDER BY id
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

// GET - Obtener usuario por ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: "El ID debe ser un número entero mayor a 0"
    });
  }

  const sql = `
    SELECT id, nombre, email, edad
    FROM usuarios
    WHERE id = ?
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
        error: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: row
    });
  });
});

// PUT - Actualizar usuario
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: "El ID debe ser un número entero mayor a 0"
    });
  }

  const errorValidacion = validarUsuario(req.body);

  if (errorValidacion) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: errorValidacion
    });
  }

  const {
    nombre,
    email,
    password,
    edad
  } = req.body;

  const sql = `
    UPDATE usuarios
    SET nombre = ?, email = ?, password = ?, edad = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [nombre.trim(), email.trim(), password, edad, id],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({
            statusCode: 409,
            data: [],
            error: "El email ya está registrado"
          });
        }

        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          error: "Usuario no encontrado"
        });
      }

      res.status(200).json({
        statusCode: 200,
        data: {
          id,
          nombre: nombre.trim(),
          email: email.trim(),
          edad
        }
      });
    }
  );
});

// DELETE - Eliminar usuario
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      statusCode: 400,
      data: [],
      error: "El ID debe ser un número entero mayor a 0"
    });
  }

  db.run(
    "DELETE FROM usuarios WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          error: "Usuario no encontrado"
        });
      }

      res.status(200).json({
        statusCode: 200,
        data: {
          message: "Usuario eliminado correctamente"
        }
      });
    }
  );
});

module.exports = router;