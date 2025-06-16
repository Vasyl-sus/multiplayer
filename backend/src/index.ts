// Colyseus + Express
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { createServer } from "http";
import basicAuth from "express-basic-auth";
import cors from 'cors';
import express from "express";
import {GameRoom} from "./rooms/GameRoom";
import path from "path";
const port = Number(process.env.port) || 3000;

const app = express();
app.use(cors());
app.use(express.json());
const basicAuthMiddleware = basicAuth({
  // list of users and passwords
  users: {
    "admin": "Coolmath123!@#",
  },
  // sends WWW-Authenticate header, which will prompt the user to fill
  // credentials in
  challenge: true
});

app.use("/colyseus", basicAuthMiddleware, monitor());
const publicPathForSingle = path.join(__dirname, "frontend", "Multiplayer");
app.use(express.static(publicPathForSingle));
// const publicPathForNew = path.join(__dirname, "frontend", "New", "build");
// app.use(express.static(publicPathForNew));
// app.get([
//   "/home",
//   "/lobby/:id/:session",
//   "/private-lobby/:id/:session",
//   "/game/:id/:session",
//   "/play/:id/:session",
//   "/test",
// ], (req, res) => {
//   res.sendFile(path.join(publicPathForNew, "index.html"));
// });
app.get("/single", (req, res) => {
  res.sendFile(path.join(publicPathForSingle, "index.html"));
});
const gameServer = new Server({
  server: createServer(app)
});

// Define "chat" room
gameServer.define("Multiplayer", GameRoom).filterBy(['mode', 'maxClients']);

gameServer.listen(port).then(() => {
  console.log(`successfully running on ${port}`);
});