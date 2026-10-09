process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../database");

let categoriaId;
let productoId;

beforeAll((done) => {
  db.serialize(() => {
    db.run("DELETE FROM productos");
    db.run("DELETE FROM categorias");

    db.run(
      "DELETE FROM sqlite_sequence WHERE name IN ('productos', 'categorias')"
    );

    db.run(
      "INSERT INTO categorias (nombre) VALUES (?)",
      ["Tecnología"],
      function (err) {
        if (err) {
          return done(err);
        }

        categoriaId = this.lastID;
        done();
      }
    );
  });
});

afterAll((done) => {
  db.close(done);
});

describe("Pruebas - Productos", () => {

  // =====================================================
  // 1. POST correcto
  // =====================================================
  test("1. POST - Debe crear un producto correctamente", async () => {
    const response = await request(app)
      .post("/api/productos")
      .send({
        nombre: "Laptop Lenovo",
        precio: 14500,
        stock: 5,
        categoria_id: categoriaId
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.nombre).toBe("Laptop Lenovo");

    productoId = response.body.data.id;
  });

  // =====================================================
  // 2. GET todos
  // =====================================================
  test("2. GET - Debe obtener todos los productos", async () => {
    const response = await request(app)
      .get("/api/productos");

    expect(response.statusCode).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // =====================================================
  // 3. GET por ID
  // =====================================================
  test("3. GET - Debe obtener un producto por ID", async () => {
    const response = await request(app)
      .get(`/api/productos/${productoId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.id).toBe(productoId);
    expect(response.body.data.nombre).toBe("Laptop Lenovo");
  });

  // =====================================================
  // 4. POST sin nombre
  // =====================================================
  test("4. POST - Debe rechazar producto sin nombre", async () => {
    const response = await request(app)
      .post("/api/productos")
      .send({
        precio: 1000,
        stock: 5,
        categoria_id: categoriaId
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // 5. POST sin precio
  // =====================================================
  test("5. POST - Debe rechazar producto sin precio", async () => {
    const response = await request(app)
      .post("/api/productos")
      .send({
        nombre: "Producto sin precio",
        stock: 5,
        categoria_id: categoriaId
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // 6. POST sin stock
  // =====================================================
  test("6. POST - Debe rechazar producto sin stock", async () => {
    const response = await request(app)
      .post("/api/productos")
      .send({
        nombre: "Producto sin stock",
        precio: 500,
        categoria_id: categoriaId
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // 7. POST sin categoría
  // =====================================================
  test("7. POST - Debe rechazar producto sin categoría", async () => {
    const response = await request(app)
      .post("/api/productos")
      .send({
        nombre: "Producto sin categoría",
        precio: 500,
        stock: 4
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // 8. POST categoría inexistente
  // =====================================================
  test("8. POST - Debe rechazar categoría inexistente", async () => {
    const response = await request(app)
      .post("/api/productos")
      .send({
        nombre: "Producto inválido",
        precio: 500,
        stock: 4,
        categoria_id: 99999
      });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  // =====================================================
  // 9. GET producto inexistente
  // =====================================================
  test("9. GET - Debe regresar 404 para producto inexistente", async () => {
    const response = await request(app)
      .get("/api/productos/99999");

    expect(response.statusCode).toBe(404);
  });

  // =====================================================
  // 10. PUT correcto
  // =====================================================
  test("10. PUT - Debe actualizar producto correctamente", async () => {
    const response = await request(app)
      .put(`/api/productos/${productoId}`)
      .send({
        nombre: "Laptop Lenovo Actualizada",
        precio: 15000,
        stock: 8,
        categoria_id: categoriaId
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.statusCode).toBe(200);
  });

  // =====================================================
  // 11. Comprobar actualización
  // =====================================================
  test("11. GET - Debe mostrar producto actualizado", async () => {
    const response = await request(app)
      .get(`/api/productos/${productoId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.nombre)
      .toBe("Laptop Lenovo Actualizada");
  });

  // =====================================================
  // 12. PUT datos incompletos
  // =====================================================
  test("12. PUT - Debe rechazar datos incompletos", async () => {
    const response = await request(app)
      .put(`/api/productos/${productoId}`)
      .send({
        nombre: "Solo nombre"
      });

    expect(response.statusCode).toBe(400);
  });

  // =====================================================
  // 13. PUT producto inexistente
  // =====================================================
  test("13. PUT - Debe rechazar producto inexistente", async () => {
    const response = await request(app)
      .put("/api/productos/99999")
      .send({
        nombre: "Producto inexistente",
        precio: 1000,
        stock: 3,
        categoria_id: categoriaId
      });

    expect(response.statusCode).toBe(404);
  });

  // =====================================================
  // 14. DELETE correcto
  // =====================================================
  test("14. DELETE - Debe eliminar producto correctamente", async () => {
    const response = await request(app)
      .delete(`/api/productos/${productoId}`);

    expect(response.statusCode).toBe(200);
  });

  // =====================================================
  // 15. Comprobar eliminación
  // =====================================================
  test("15. GET - Producto eliminado debe regresar 404", async () => {
    const response = await request(app)
      .get(`/api/productos/${productoId}`);

    expect(response.statusCode).toBe(404);
  });

  // =====================================================
  // 16. DELETE inexistente
  // =====================================================
  test("16. DELETE - Debe rechazar producto inexistente", async () => {
    const response = await request(app)
      .delete("/api/productos/99999");

    expect(response.statusCode).toBe(404);
  });

});