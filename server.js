const express = require("express");

const app = express();
const http = require("http");
const server = http.createServer(app);
const colors = require("colors");
const cors = require("cors");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use(express.json());

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  },
});

const GameSetup = require("./game/GameSetup");
const GameLobby = require("./game/GameLobby");
const GamePlay = require("./game/GamePlay");
const GameScores = require("./game/GameScores");
const GameResults = require("./game/GameResults");
const GameWaitingArena = require("./game/GameWaitingArena");

const onConnection = socket => {
  GameSetup(io, socket);
  GameLobby(io, socket);
  GamePlay(io, socket);
  GameScores(io, socket);
  GameResults(io, socket);
  GameWaitingArena(io, socket);
};

io.on("connection", onConnection);

app.get("/", (req, res) => {
  res.send("Hello World from the server!");
});

const PORT = process.env.PORT || 5000;

const MODE = process.env.NODE_ENV || "development";

server.listen(
  PORT,
  console.log(
    `Server running on port ${PORT} in ${MODE.blue.bold + " mode".yellow.bold} `
      .yellow.bold
  )
);
