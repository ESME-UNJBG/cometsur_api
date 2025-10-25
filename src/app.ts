// app.ts

// 1️⃣ Importaciones necesarias
import "dotenv/config"; // Carga las variables de entorno del archivo .env
import express from "express"; // Framework para crear el servidor web (rutas HTTP)
import cors from "cors"; // Middleware que permite peticiones desde otros dominios
import http from "http"; // Módulo nativo de Node.js para crear servidores HTTP
import { Server as SocketServer } from "socket.io"; // Clase de Socket.IO (la usamos para crear el servidor de sockets)
import { router } from "./routes"; // Tus rutas tradicionales (usuarios, listas, etc.)
import db from "./config/mongo"; // Conexión a tu base de datos MongoDB

// 2️⃣ Configuración básica
const PORT = process.env.PORT || 3001; // Puerto donde correrá el servidor
const app = express(); // Crea la aplicación Express

// 3️⃣ Crear un servidor HTTP a partir de Express
// Esto es necesario porque Socket.IO no trabaja directamente sobre 'app', sino sobre el servidor HTTP.
const server = http.createServer(app);

// 4️⃣ Crear instancia de Socket.IO
// Aquí conectamos Socket.IO al mismo servidor que Express usa.
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173/", // 🔓 Permite conexiones desde cualquier frontend (React, móvil, etc.)
    methods: ["GET", "POST"], // Métodos HTTP permitidos (por seguridad)
  },
});

// 5️⃣ Middlewares de Express (funciones que procesan las peticiones antes de llegar a las rutas)
app.use(cors()); // Permite peticiones entre diferentes dominios
app.use(express.json()); // Permite leer cuerpos JSON en las peticiones
app.use(router); // Carga tus rutas (por ejemplo, /api/user, /api/lista, etc.)

// 6️⃣ Conexión a la base de datos MongoDB
db().then(() => console.log("✅ Conexión a MongoDB lista"));

// 7️⃣ Configuración del servidor de sockets
io.on("connection", (socket) => {
  // 🔹 Se ejecuta cada vez que un cliente se conecta
  console.log("🟢 Cliente conectado:", socket.id);

  // 📩 Escuchar un evento llamado 'mensaje' enviado desde el cliente
  socket.on("mensaje", (data) => {
    console.log("💬 Mensaje recibido:", data);

    // 🔁 Reenviar ese mensaje a todos los clientes conectados
    io.emit("mensaje", data);
  });

  // 🔴 Detectar cuando un cliente se desconecta
  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// 8️⃣ Iniciar servidor (Express + Socket.IO juntos)
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
