process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../database");

let categoriaId;

beforeAll((done) => {
  db.serialize(() => {
    db.run("DELETE FROM productos");

    db.run("DELETE FROM categorias");

    db.run(
      "DELETE FROM sqlite_sequence WHERE name IN ('productos', 'categorias')",
      done
    );
  });
});

afterAll((done) => {
  db.close(done);
});

describe("Pruebas - Categorías", () => {

  test("1. POST - Debe crear una categoría correctamente", async () => {
    const response = await request(app)
      .post("/api/categorias")
      .send({
        nombre: "Tecnología"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.nombre).toBe("Tecnología");

    categoriaId = response.body.data.id;
  });

  test("2. GET - Debe obtener todas las categorías", async () => {
    const response = await request(app)
      .get("/api/categorias");

    expect(response.statusCode).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("3. POST - Debe rechazar una categoría sin nombre", async () => {
    const response = await request(app)
      .post("/api/categorias")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("4. POST - Debe rechazar una categoría con nombre vacío", async () => {
    const response = await request(app)
      .post("/api/categorias")
      .send({
        nombre: ""
      });

    expect(response.statusCode).toBe(400);
  });

  test("5. POST - Debe rechazar una categoría duplicada", async () => {
    const response = await request(app)
      .post("/api/categorias")
      .send({
        nombre: "Tecnología"
      });

    expect(
      [400, 409, 500]
    ).toContain(response.statusCode);
  });

  test("6. DELETE - Debe eliminar una categoría correctamente", async () => {
    const response = await request(app)
      .delete(`/api/categorias/${categoriaId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.statusCode).toBe(200);
  });

  test("7. DELETE - Debe rechazar categoría inexistente", async () => {
    const response = await request(app)
      .delete("/api/categorias/99999");

    expect(response.statusCode).toBe(404);
  });

});