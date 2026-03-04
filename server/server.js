require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("audioData", (data) => {
        io.emit("audioData", data); // reenviar a todos
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
    });
});

server.listen(PORT, HOST, () => {
    console.log("Servidor corriendo en:");
    console.log(`http://localhost:${PORT}`);
    console.log("Usa la IP LAN actual de tu laptop para acceder desde el celular.");
});
