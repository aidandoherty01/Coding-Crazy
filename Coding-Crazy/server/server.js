import express from "express";
import cors from "cors";
import {
  exportCollectionToJson,
  exportStudySetToJson,
  exportUniqueSubjectsToJson,
  exportAccountToJson,
  exportSessionToJson,
  getPublicLobbies,
  directQuestionData,
} from "./getData.mjs";
import {
  exportJsonToMongo,
  updateRoom,
  resetDB,
  removeEntryFromDB,
} from "./sendData.mjs";
import path from "path";
import { gameSession } from "./gameSessionClass.js";
import { Server } from "socket.io";
import {
  addPlayerToDB,
  getAllPlayerData,
  getPlayerData,
  updatePlayerInfo,
  removePlayerFromDB,
} from "./updatePlayerCollection.js";
import http from "http";
import fs, { access, accessSync } from "fs";

/* Defining Paths */
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

/*
Server Configuration
*/
const app = express();
const PORT = 5000;

const server = http.createServer(app); // Wraps express and socket.io into http

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors()); // Enable CORS (to allow React to communicate with this server)
app.use(express.json()); // Enables json operations

/*
Study Set / Account Management
*/

/*Get Database Collection*/
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
      res.sendFile(exported_data);
    }
  } catch (error) {
    console.error("Fetching Collection Failed: ", error);
  }
});

/*Get Unique Subjects*/
app.get("/subjects", async (req, res) => {
  try {
    await exportUniqueSubjectsToJson();
    res.sendFile(exported_data);
  } catch (error) {
    console.error("Fetching Subjects Failed: ", error);
  }
});

/* Send Json to Mongo */
app.post("/send/:collection", async (req, res) => {
  try {
    /* Store parameters */
    const collection = req.params.collection;
    const jsonData = JSON.stringify(req.body, null, 2);

    /* Write to json and request export */
    if (["Collection", "Accounts"].includes(collection)) {
      // Check valid collection name
      fs.writeFileSync(export_to_mongo, jsonData, "utf-8");
      await exportJsonToMongo(collection); // Export data to specified collection
      res.sendFile(export_to_mongo); // Send valid response
    } else {
      throw new Error(
        `Please specify a valid Collection name. ${collection} is invalid.`
      );
    }
  } catch (err) {
    console.error("Sending Data Failed: ", err);
    res.status(400).json({ error: err.message }); // Send error message to client
  }
});

/* Remove Entries from Database */
app.post("/remove/:collection", async (req, res) => {
  try {
    /* Store Parameters */
    const collection = req.params.collection;
    const jsonData = JSON.stringify(req.body, null, 2);

    /* INCLUDE SESSIONS?? */

    if (["Collection", "Accounts"].includes(collection)) {
      // Check valid collection name
      console.log("Hooray!");
      fs.writeFileSync(export_to_mongo, jsonData, "utf-8");
      await removeEntryFromDB(collection);
      res.sendFile(export_to_mongo);
    } else {
      throw new Error(
        `Please specify a valid collection name. ${collection} is invalid.`
      );
    }
  } catch (err) {
    console.error("Error removing entry from Database: ", err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/get_questions", async (req, res) => {
  const subject = req.query.subject;
  console.log(subject);
  // Validate the subject
  if (!subject || typeof subject !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid subject parameter." });
  }

  try {
    const questions = await directQuestionData(subject);
    console.log(questions);
    res.json(questions);
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions from database." });
  }
});

/* Login to Account */
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

/* Reset and Repopulate the Study Set Collection (with data from /data/backup.json) */
app.get("/ADMINRESET", async (req, res) => {
  try {
    await resetDB();
  } catch (error) {
    console.error("Error Reseting Database: ", error);
  }
});

/* 
Game / Session Management 
*/

// Store lobby users
const sessions = {};
const roomQueue = {};

/* Generate unique room code */
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

/* Queue room tasks to avoid out of order processing of requests */
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

/* Create current room in database */
async function sendRoomToDB(room) {
  const roomData = JSON.stringify([room]);
  console.log(roomData);
  fs.writeFileSync(export_to_mongo, roomData, "utf-8");
  await exportJsonToMongo("Sessions"); // Export data to specified collection
}

/* Update current room in database */
async function updateSession(room) {
  const roomData = JSON.stringify([room]);
  console.log("updating session ", roomData);
  fs.writeFileSync(update_to_mongo, roomData, "utf-8");
  await updateRoom("Sessions"); // Export data to specified collection
}

/* Called after confirming settings in HostPage.jsx */
app.post("/create_lobby", async (req, res) => {
  const { numPlayers, difficulty, isPublic, numTurns } = req.body;
  console.log(Object.keys(sessions).length);
  const acCode = generateRoomCode(Object.keys(sessions).length);
  sessions[acCode] = new gameSession(
    acCode,
    numPlayers,
    difficulty,
    isPublic,
    numTurns
  );
  sendRoomToDB(sessions[acCode]);
  res.status(200).json(acCode);
});

/* Called on page load in GamePage.jsx */
app.get("/getSession", async (req, res) => {
  const roomCode = req.query.roomCode;
  console.log("In getSession\nRC: ", roomCode);
  try {
    await exportSessionToJson(roomCode); // Writes sesion to _sessionPath
    const fileData = fs.readFileSync(_sessionPath, "utf-8");
    const session = JSON.parse(fileData);
    res.status(200).json(session); // On successful read, returns session to client
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Pull public lobbies for people finding lobbies
app.get("/public_lobbies", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    await getPublicLobbies(offset, limit);
    res.sendFile(
      path.join(
        import.meta.dirname,
        "..",
        "src",
        "data",
        "public_lobby_data.json"
      )
    );
  } catch (err) {
    console.error("Error fetching public lobbies:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Add player stats into database
app.post("/add-player", async (req, res) => {
  try {
    const { id, loc, x, y, numAPlusses } = req.body;
    const player = await addPlayerToDB(
      "Player",
      "Collection",
      id,
      loc,
      x,
      y,
      numAPlusses
    );
    res.json(player);
  } catch (error) {
    console.log("Error adding player (server).", error);
  }
});

//Update a players information in the collection
app.patch("/update-player-info", async (req, res) => {
  try {
    const { id, loc, x, y, numAPlusses } = req.body;
    const player = await updatePlayerInfo(
      "Player",
      "Collection",
      id,
      loc,
      x,
      y,
      numAPlusses
    );
    res.status(200).json({ success: true, player });
  } catch (error) {
    console.log("Error updating player information (server)", error);
  }
});

//Removes player from the collection (specifically for game completions)
app.delete("/remove-player/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Player ID to be removed: " + id);

  try {
    const playerRemoval = await removePlayerFromDB("Player", "Collection", id);

    if (!playerRemoval || playerRemoval.deletedCount === 0) {
      console.log("Player not found or already removed.");
      return res.status(404).json({ message: "Player not found." });
    }
    console.log("Sucessfully removed player");
    res.status(200).json(playerRemoval);
  } catch (err) {
    console.error("Error removing player data (server)", err);
    res.status(500).json({ message: "Server error while removing player." });
  }
});

//Retrives a players information from the collection based off their ID
app.get("/get-player-data/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const playerData = await getPlayerData("Player", "Collection", id);
    res.json(playerData);

    if (!id) {
      console.log("PLAYER NOT FOUND.");
    }
  } catch {
    console.log("Error getting player data (server)");
  }
});

//Retrieves all players information from the collection
app.get("/get-all-players", async (req, res) => {
  try {
    const players = await getAllPlayerData("Player", "Collection");
    res.json(players);
  } catch {
    console.log("Error from get-all-players");
  }
});

/* Socket Manager */
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_lobby", ({ accessCode, username }) => {
    console.log(`In Join_Lobby\nUser: ${username}\nAccess: ${accessCode}`);

    if (!sessions[accessCode]) {
      socket.emit("lobby_not_found", { message: "Lobby doesn't exist" });
      return;
    }

    /* Attempting to rejoin lobby if disconnected */
    if (sessions[accessCode].findUsername(username)) {
      console.log(`${username} is reconnecting to ${accessCode}`);

      socket.join(accessCode); // reconnect socket to room
      io.to(accessCode).emit(
        "lobby_users",
        sessions[accessCode].getUsernames()
      );

      if (sessions[accessCode].gameStarted) {
        socket.emit("start_game");
      } else {
        socket.emit("lobby_good", { message: "Reconnected to Lobby." });
      }
      return;
    }

    if (sessions[accessCode].full()) {
      socket.emit("lobby_full", { message: "Lobby is full" });
      return;
    }

    socket.join(accessCode); // add user to socket room
    sessions[accessCode].addUser(username);
    updateSession(sessions[accessCode]); // update all users in the session
    socket.emit("lobby_good", { message: "Lobby is good to join!" });
    io.to(accessCode).emit("lobby_users", sessions[accessCode].getUsernames()); // broadcast full list of names

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
          sessions[accessCode].gameStarted = true;
          updateSession(sessions[accessCode]);
          io.to(accessCode).emit("start_game");
        }
      }, 1000);
    }
  });

  socket.on("leave_lobby", async ({ accessCode, username }) => {
    if (sessions[accessCode]) {
      // const username = sessions[accessCode].findUsername(socket.id);
      // if (username) {
      sessions[accessCode].deleteUser(username);
      io.to(accessCode).emit(
        "lobby_users",
        sessions[accessCode].getUsernames()
      );
      // }
      if (sessions[accessCode].empty()) {
        delete sessions[accessCode]; // remove the global session
        const roomData = JSON.stringify([{ roomCode: accessCode }]);
        fs.writeFileSync(export_to_mongo, roomData, "utf-8");
        await removeEntryFromDB("Sessions");
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
    if (roomCode == "AA") {
      return;
    }
    console.log("a movement!", path);
    console.log(roomCode);
    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode);
    console.log(socketsInRoom); // Set of socket IDs
    io.to(roomCode).emit("movement", { movingPlayer: username, path: path });
  });

  socket.on("SpinnerResult", ({ spinRes, username, roomCode }) => {
    if (roomCode == "AA") {
      return;
    }
    io.to(roomCode).emit("spin_move", {
      movingPlayer: username,
      spinRes: spinRes,
    });
  });

  socket.on("player_landing", async ({ roomCode, username, loc }) => {
    try {
      if (roomCode === "AA") {
        io.to(roomCode).emit("singleplayer_move", {
          movingPlayer: username,
        });
        return;
      }
      queueRoomTask(roomCode, async () => {
        await exportSessionToJson(roomCode);
        const fileData = await fs.promises.readFile(_sessionPath, "utf-8");
        const session = JSON.parse(fileData);
        const keys = Object.keys(session.players);
        if (keys[session.currPlayer] !== username) {
          throw new Error("Player ending turn is not sequentially ordered");
        }
        session.players[username].loc = loc;
        if (session.currPlayer === keys.length - 1) {
          session.currPlayer = 0;
          session.currTurn++;
          delete session._id;
          updateSession(session);
          //Do items for turn changing
          if (session.currTurn === session.numTurns) {
            //end game conditions
            io.to(roomCode).emit("game_complete", {
              movingPlayer: username,
              loc: loc,
              nextPlayer: keys[session.currPlayer],
            });
            const roomData = JSON.stringify([session]);
            await fs.writeFileSync(export_to_mongo, roomData, "utf-8");
            await removeEntryFromDB("Sessions");
            delete sessions[roomCode];
          } else {
            //end turn conditions
            io.to(roomCode).emit("full_turn", {
              movingPlayer: username,
              loc: loc,
              nextPlayer: keys[session.currPlayer],
            });
          }
        } else {
          session.currPlayer++;
          //Do what happens when turn doesn't change
          delete session._id;
          updateSession(session);
          io.to(roomCode).emit("next_turn", {
            movingPlayer: username,
            loc: loc,
            nextPlayer: keys[session.currPlayer],
          });
        }
      });
    } catch (err) {}
  });

  socket.on("Aplus_moved", async ({ roomCode, username, loc }) => {
    if (roomCode == "AA") {
      io.to(roomCode).emit("singleplayer_APlus", { collector: username });
      return;
    }
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
