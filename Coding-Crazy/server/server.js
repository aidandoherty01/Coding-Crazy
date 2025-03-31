import express from "express";
import cors from "cors";
import {
  exportCollectionToJson,
  exportStudySetToJson,
  exportUniqueSubjectsToJson,
  exportAccountToJson,
} from "./getData.mjs";
import { exportJsonToMongo, resetDB } from "./sendData.mjs";
import path from "path";
import { gameSession } from "./gameSessionClass.js";
import { Server } from "socket.io";
import http from "http";
import fs from "fs";

const export_to_mongo = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "export_to_mongo.json"
);
const exported_data = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "exported_data.json"
);

const app = express();
const PORT = 5000;

const server = http.createServer(app); // Wraps express and socket.io into http

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors()); // Enable CORS (to allow React to communicate with this server)
app.use(express.json()); // Enables json operations

// Store lobby users
const lobbies = {};
const rooms = {};

app.post("/create_lobby", async (req, res) => {
  const { numPlayers, difficulty } = req.body;
  console.log(Object.keys(lobbies).length);
  const acCode = 100000 + Object.keys(lobbies).length;
  lobbies[acCode] = new gameSession(acCode, numPlayers, difficulty);
  res.status(200).json(acCode);
});

/*Get Collection*/
app.get("/collection/:subject?", async (req, res) => {
  try {
    if (req.params.subject) {
      // Return study set of specified subject
      await exportStudySetToJson(req.params.subject);
      res.sendFile(
        path.join(import.meta.dirname, "..", "src", "data", "questions.json")
      );
    } else {
      // Return entire collection
      await exportCollectionToJson();
      res.sendFile(
        path.join(
          import.meta.dirname,
          "..",
          "src",
          "data",
          "exported_data.json"
        )
      );
    }
  } catch (error) {
    console.error("Fetching Collection Failed: ", error);
  }
});

/*Get Subjects*/
app.get("/subjects", async (req, res) => {
  try {
    await exportUniqueSubjectsToJson();
    res.sendFile(
      path.join(import.meta.dirname, "..", "src", "data", "exported_data.json")
    );
  } catch (error) {
    console.error("Fetching Subjects Failed: ", error);
  }
});

/* Send Json to Mongo */
app.post("/send/:collection?", async (req, res) => {
  try {
    /* Store parameters */
    const collection = req.params.collection;
    const jsonData = JSON.stringify(req.body, null, 2);

    /* Write to json and request export */
    if (collection && ["Collection", "Accounts"].includes(collection)) {
      // Check valid collection name
      fs.writeFileSync(export_to_mongo, jsonData, "utf-8");
      await exportJsonToMongo(collection); // Export data to specified collection
      res.sendFile(export_to_mongo); // Send valid response
    } else {
      throw new Error("Please specify a valid Collection name.");
    }
  } catch (err) {
    console.error("Sending Data Failed: ", err);
    res.status(400).json({ error: err.message }); // Send error message to client
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    await exportAccountToJson(username, password);
    res.sendFile(exported_data);
  } catch (err) {
    console.error("Sending Data Failed: ", err);
    res.status(400).json({ error: err.message }); // Send error message to client
  }
});

/* Reset and Repopulate the Database (with data from /data/backup.json) */
app.get("/ADMINRESET", async (req, res) => {
  try {
    await resetDB();
  } catch (error) {
    console.error("Error Reseting Database: ", error);
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_lobby", ({ accessCode, username }) => {
    if (!lobbies[accessCode]) {
      socket.emit("lobby_not_found", { message: "Lobby doesn't exist" });
      return;
    }

    if (lobbies[accessCode].full()) {
      socket.emit("lobby_full", { message: "Lobby is full" });
      return;
    }
    lobbies[accessCode].addUser(username);
    socket.join(accessCode);
    socket.emit("lobby_good", { message: "Lobby is good to join!" });
    io.to(accessCode).emit("lobby_users", lobbies[accessCode].usernames);
    //Check if it's now full
    if (lobbies[accessCode].full() && !lobbies[accessCode].countingDown()) {
      lobbies[accessCode].startCountdown();
      const interval = setInterval(() => {
        io.to(accessCode).emit(
          "countdown_update",
          lobbies[accessCode].countdown
        );
        lobbies[accessCode].tickCount();
        console.log(lobbies[accessCode].countdown);

        if (lobbies[accessCode].reachedZero()) {
          clearInterval(interval);
          io.to(accessCode).emit("start_game", lobbies[accessCode]);
        }
      }, 1000);
    }
  });
  socket.on("leave_lobby", (accessCode) => {
    if (lobbies[accessCode]) {
      const username = lobbies[accessCode].findUsername(socket.id);
      if (username) {
        lobbies[accessCode].deleteUser(username.name);
        io.to(accessCode).emit("lobby_users", lobbies[accessCode].usernames);
      }
      if (lobbies[accessCode].empty()) {
        delete lobbies[accessCode];
      }
    }
    console.log("Left", socket.id);
    socket.leave(accessCode);
  });

  socket.on("join_room", ({ roomCode, username }) => {
    console.log(roomCode, "  ", username);
    if (!rooms[roomCode]) {
      rooms[roomCode] = [];
    }
    rooms[roomCode].push({ id: socket.id, name: username });
    socket.join(roomCode);
    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode);
    console.log("j socket", socketsInRoom); // Set of socket IDs
  });

  socket.on("move_player", ({ roomCode, username, path }) => {
    console.log("a movement!", path);
    console.log(roomCode);
    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode);
    console.log(socketsInRoom); // Set of socket IDs
    io.to(roomCode).emit("movement", { movingPlayer: username, path: path });
  });

  socket.on("Aplus_moved", ({ roomCode, username, loc }) => {
    io.to(roomCode).emit("APlus_movement", { collector: username, loc: loc });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* Start The Server */
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
