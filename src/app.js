const express = require("express");

const categoriasRoutes = require("./routes/categorias.routes");
const productosRoutes = require("./routes/productos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    data: {
      status: "ok",
      message: "Api funcionando prueba1"
    }
  });
});

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    data: {
      message: "WebApp API CI/CD funcionando correctamente"
    }
  });
});

// Rutas
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);

// No iniciar servidor cuando Supertest importa app
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
  });
}

module.exports = app;