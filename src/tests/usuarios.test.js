process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../database");

let usuarioId;
let segundoUsuarioId;

beforeAll((done) => {
  db.serialize(() => {
    db.run("DELETE FROM usuarios");

    db.run(
      "DELETE FROM sqlite_sequence WHERE name = 'usuarios'",
      done
    );
  });
});

afterAll((done) => {
  db.close(done);
});

describe("Pruebas unitarias - CRUD de usuarios", () => {

  // =====================================================
  // CASOS CORRECTOS
  // =====================================================

  test("1. POST - Debe crear un usuario correctamente", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Gael Jimenez",
        email: "gael@test.com",
        password: "Gael1234",
        edad: 22
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.nombre).toBe("Gael Jimenez");
    expect(response.body.data.email).toBe("gael@test.com");
    expect(response.body.data.edad).toBe(22);

    usuarioId = response.body.data.id;
  });

  test("2. GET - Debe obtener todos los usuarios", async () => {
    const response = await request(app)
      .get("/api/usuarios");

    expect(response.statusCode).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("3. GET - Debe obtener usuario por ID", async () => {
    const response = await request(app)
      .get(`/api/usuarios/${usuarioId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.id).toBe(usuarioId);
    expect(response.body.data.nombre).toBe("Gael Jimenez");
  });

  test("4. GET - No debe mostrar la contraseña", async () => {
    const response = await request(app)
      .get(`/api/usuarios/${usuarioId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).not.toHaveProperty("password");
  });

  test("5. PUT - Debe actualizar un usuario correctamente", async () => {
    const response = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .send({
        nombre: "Gael Jimenez Actualizado",
        email: "gael.actualizado@test.com",
        password: "Nueva1234",
        edad: 23
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.nombre)
      .toBe("Gael Jimenez Actualizado");
    expect(response.body.data.edad).toBe(23);
  });

  test("6. GET - Debe mostrar los datos actualizados", async () => {
    const response = await request(app)
      .get(`/api/usuarios/${usuarioId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.nombre)
      .toBe("Gael Jimenez Actualizado");
    expect(response.body.data.edad).toBe(23);
  });

  // =====================================================
  // ERRORES DE DATOS OBLIGATORIOS
  // =====================================================

  test("7. POST - Debe rechazar body vacío", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.statusCode).toBe(400);
  });

  test("8. POST - Debe rechazar usuario sin nombre", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        email: "nonombre@test.com",
        password: "Password123",
        edad: 20
      });

    expect(response.statusCode).toBe(400);
  });

  test("9. POST - Debe rechazar usuario sin email", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Sin Email",
        password: "Password123",
        edad: 20
      });

    expect(response.statusCode).toBe(400);
  });

  test("10. POST - Debe rechazar usuario sin contraseña", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Sin Password",
        email: "sinpassword@test.com",
        edad: 20
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe(
      "Nombre, email, password y edad son obligatorios"
    );
  });

  test("11. POST - Debe rechazar usuario sin edad", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Sin Edad",
        email: "sinedad@test.com",
        password: "Password123"
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // ERRORES DE EMAIL
  // =====================================================

  test("12. POST - Debe rechazar email sin arroba", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Correo Incorrecto",
        email: "correotest.com",
        password: "Password123",
        edad: 22
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe(
      "El correo electrónico no es válido"
    );
  });

  test("13. POST - Debe rechazar email sin dominio", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Correo Incorrecto",
        email: "usuario@",
        password: "Password123",
        edad: 22
      });

    expect(response.statusCode).toBe(400);
  });

  test("14. POST - Debe rechazar email sin extensión", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Correo Incorrecto",
        email: "usuario@gmail",
        password: "Password123",
        edad: 22
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // ERRORES DE CONTRASEÑA
  // =====================================================

  test("15. POST - Debe rechazar contraseña demasiado corta", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Password Corto",
        email: "password@test.com",
        password: "123",
        edad: 22
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe(
      "La contraseña debe tener al menos 8 caracteres"
    );
  });

  // =====================================================
  // ERRORES DE EDAD
  // =====================================================

  test("16. POST - Debe rechazar edad negativa", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Edad Negativa",
        email: "edadnegativa@test.com",
        password: "Password123",
        edad: -5
      });

    expect(response.statusCode).toBe(400);
  });

  test("17. POST - Debe rechazar edad cero", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Edad Cero",
        email: "edadcero@test.com",
        password: "Password123",
        edad: 0
      });

    expect(response.statusCode).toBe(400);
  });

  test("18. POST - Debe rechazar edad enviada como texto", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Edad Texto",
        email: "edadtexto@test.com",
        password: "Password123",
        edad: "veintidós"
      });

    expect(response.statusCode).toBe(400);
  });

  test("19. POST - Debe rechazar edad mayor a 120", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Edad Invalida",
        email: "edadinvalida@test.com",
        password: "Password123",
        edad: 150
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // DUPLICADOS
  // =====================================================

  test("20. POST - Debe crear segundo usuario", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Usuario Segundo",
        email: "segundo@test.com",
        password: "Password123",
        edad: 25
      });

    expect(response.statusCode).toBe(201);

    segundoUsuarioId = response.body.data.id;
  });

  test("21. POST - Debe rechazar email duplicado", async () => {
    const response = await request(app)
      .post("/api/usuarios")
      .send({
        nombre: "Usuario Repetido",
        email: "segundo@test.com",
        password: "Password456",
        edad: 30
      });

    expect(response.statusCode).toBe(409);

    expect(response.body.error).toBe(
      "El email ya está registrado"
    );
  });

  // =====================================================
  // USUARIOS INEXISTENTES / IDs INCORRECTOS
  // =====================================================

  test("22. GET - Debe regresar 404 para usuario inexistente", async () => {
    const response = await request(app)
      .get("/api/usuarios/99999");

    expect(response.statusCode).toBe(404);

    expect(response.body.error).toBe(
      "Usuario no encontrado"
    );
  });

  test("23. GET - Debe rechazar ID no numérico", async () => {
    const response = await request(app)
      .get("/api/usuarios/abc");

    expect(response.statusCode).toBe(400);
  });

  test("24. PUT - Debe rechazar usuario inexistente", async () => {
    const response = await request(app)
      .put("/api/usuarios/99999")
      .send({
        nombre: "No Existe",
        email: "noexiste@test.com",
        password: "Password123",
        edad: 40
      });

    expect(response.statusCode).toBe(404);
  });

  test("25. PUT - Debe rechazar datos incompletos", async () => {
    const response = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .send({
        nombre: "Solo Nombre"
      });

    expect(response.statusCode).toBe(400);
  });

  test("26. PUT - Debe rechazar correo incorrecto", async () => {
    const response = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .send({
        nombre: "Usuario",
        email: "correo-sin-arroba.com",
        password: "Password123",
        edad: 25
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // DELETE
  // =====================================================

  test("27. DELETE - Debe eliminar usuario correctamente", async () => {
    const response = await request(app)
      .delete(`/api/usuarios/${usuarioId}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.data.message).toBe(
      "Usuario eliminado correctamente"
    );
  });

  test("28. GET - Usuario eliminado debe regresar 404", async () => {
    const response = await request(app)
      .get(`/api/usuarios/${usuarioId}`);

    expect(response.statusCode).toBe(404);
  });

  test("29. DELETE - Debe rechazar usuario inexistente", async () => {
    const response = await request(app)
      .delete("/api/usuarios/99999");

    expect(response.statusCode).toBe(404);
  });

  test("30. DELETE - Debe rechazar ID no numérico", async () => {
    const response = await request(app)
      .delete("/api/usuarios/abc");

    expect(response.statusCode).toBe(400);
  });

});