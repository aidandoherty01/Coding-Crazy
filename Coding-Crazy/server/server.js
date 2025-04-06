import express from "express";
import cors from "cors";
import {
  exportCollectionToJson,
  exportStudySetToJson,
  exportUniqueSubjectsToJson,
  exportAccountToJson,
  exportSessionToJson,
} from "./getData.mjs";
import { exportJsonToMongo, updateRoom, resetDB } from "./sendData.mjs";
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

const update_to_mongo = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "update_to_mongo.json"
);

const exported_data = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "exported_data.json"
);

const _sessionPath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "session_data.json"
);

function generateRoomCode(numberOfRooms) {
  // Helper function to convert a number to a letter (A = 0, B = 1, ..., Z = 25)
  const numToLetter = (num) => String.fromCharCode(65 + (num % 26)); // 65 is the ASCII code for 'A'

  // First letter based on (numberOfRooms / 26) % 26
  const firstLetter = numToLetter(Math.floor(numberOfRooms / 26));

  // Middle 4 letters: random letters
  const middleLetters = Array.from({ length: 4 }, () =>
    numToLetter(Math.floor(Math.random() * 26))
  ).join("");

  // Last letter based on numberOfRooms % 26
  const lastLetter = numToLetter(numberOfRooms);

  // Combine to form the room code
  return firstLetter + middleLetters + lastLetter;
}

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
const sessions = {};
const roomQueue = {};

function queueRoomTask(roomCode, task) {
  console.log(`⏳ Queued task for ${roomCode}`);
  if (!roomQueue[roomCode]) {
    roomQueue[roomCode] = Promise.resolve();
  }

  // Add task to the chain
  roomQueue[roomCode] = roomQueue[roomCode].then(() =>
    task().catch((err) => {
      console.error(`Error processing task for room ${roomCode}:`, err);
    })
  );

  return roomQueue[roomCode];
}

async function sendRoomToDB(room) {
  const roomData = JSON.stringify([room]);
  console.log(roomData);
  fs.writeFileSync(export_to_mongo, roomData, "utf-8");
  await exportJsonToMongo("Sessions"); // Export data to specified collection
}

async function updateSession(room) {
  const roomData = JSON.stringify([room]);
  console.log("updating session ", roomData);
  fs.writeFileSync(update_to_mongo, roomData, "utf-8");
  await updateRoom("Sessions"); // Export data to specified collection
}

app.post("/create_lobby", async (req, res) => {
  const { numPlayers, difficulty } = req.body;
  console.log(Object.keys(sessions).length);
  const acCode = generateRoomCode(Object.keys(sessions).length);
  sessions[acCode] = new gameSession(acCode, numPlayers, difficulty);
  sendRoomToDB(sessions[acCode]);
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

app.get("/getSession", async (req, res) => {
  const roomCode = req.query.roomCode;
  console.log("RC ", roomCode);
  try {
    await exportSessionToJson(roomCode);
    const fileData = fs.readFileSync(_sessionPath, "utf-8");
    const session = JSON.parse(fileData);
    res.status(200).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    if (!sessions[accessCode]) {
      socket.emit("lobby_not_found", { message: "Lobby doesn't exist" });
      return;
    }

    if (sessions[accessCode].full()) {
      socket.emit("lobby_full", { message: "Lobby is full" });
      return;
    }

    sessions[accessCode].addUser(username);
    socket.join(accessCode);
    updateSession(sessions[accessCode]);
    socket.emit("lobby_good", { message: "Lobby is good to join!" });
    io.to(accessCode).emit("lobby_users", sessions[accessCode].usernames);
    //Check if it's now full
    if (sessions[accessCode].full() && !sessions[accessCode].countingDown()) {
      sessions[accessCode].startCountdown();
      const interval = setInterval(() => {
        io.to(accessCode).emit(
          "countdown_update",
          sessions[accessCode].countdown
        );
        sessions[accessCode].tickCount();
        console.log(sessions[accessCode].countdown);

        if (sessions[accessCode].reachedZero()) {
          clearInterval(interval);
          io.to(accessCode).emit("start_game");
        }
      }, 1000);
    }
  });
  socket.on("leave_lobby", (accessCode) => {
    if (sessions[accessCode]) {
      const username = sessions[accessCode].findUsername(socket.id);
      if (username) {
        sessions[accessCode].deleteUser(username.name);
        io.to(accessCode).emit("lobby_users", sessions[accessCode].usernames);
      }
      if (sessions[accessCode].empty()) {
        delete sessions[accessCode];
      }
    }
    console.log("Left", socket.id);
    socket.leave(accessCode);
    //updateSession(sessions[accessCode]);
  });

  socket.on("join_room", ({ roomCode }) => {
    socket.join(roomCode);
  });

  socket.on("leave_room", ({ roomCode }) => {
    socket.leave(roomCode);
  });

  socket.on("move_player", ({ roomCode, username, path }) => {
    console.log("a movement!", path);
    console.log(roomCode);
    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode);
    console.log(socketsInRoom); // Set of socket IDs
    io.to(roomCode).emit("movement", { movingPlayer: username, path: path });
  });

  socket.on("player_landing", async ({ roomCode, username, loc }) => {
    try {
      queueRoomTask(roomCode, async () => {
        await exportSessionToJson(roomCode);
        const fileData = await fs.promises.readFile(_sessionPath, "utf-8");
        const session = JSON.parse(fileData);
        session.players[username].loc = loc;
        delete session._id;
        updateSession(session);
        io.to(roomCode).emit("new_loc", { movingPlayer: username, loc: loc });
      });
    } catch (err) {}
  });

  socket.on("Aplus_moved", async ({ roomCode, username, loc }) => {
    queueRoomTask(roomCode, async () => {
      await exportSessionToJson(roomCode);
      const fileData = await fs.promises.readFile(_sessionPath, "utf-8");
      const session = JSON.parse(fileData);
      session.APlusLoc = loc;
      session.players[username].numAPlusses += 1;
      console.log("US ", username, session);
      delete session._id;
      updateSession(session);
      io.to(roomCode).emit("APlus_movement", { collector: username, loc: loc });
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* Start The Server */
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
