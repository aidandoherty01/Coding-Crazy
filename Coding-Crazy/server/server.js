import express from "express";
import cors from "cors";
import {
  exportCollectionToJson,
  exportStudySetToJson,
  exportUniqueSubjectsToJson,
} from "./getData.mjs";
import { resetDB } from "./sendData.mjs";
import path from "path";
import { Lobby } from "./lobbyClass.js";
import { Server } from "socket.io";
import http from "http";

const app = express();
const PORT = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors()); // Enable CORS (to allow React to communicate with this server)
app.use(express.json());

// Store lobby users
const lobbies = {};

app.post("/create_lobby", async (req, res) => {
  const { numPlayers, difficulty } = req.body;
  console.log(Object.keys(lobbies).length);
  const acCode = 100000 + Object.keys(lobbies).length;
  lobbies[acCode] = new Lobby(acCode, numPlayers, difficulty);
  res.status(200).json(acCode);
});

/*Get Collection*/
app.get("/collection/:subject?", async (req, res) => {
  try {
    if (req.params.subject) {
      // Return study set of specified subject
      await exportStudySetToJson(req.params.subject); // No response is sent since file is directly accessed from hard-coded path in QuestionScene.js
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

    const user = { id: socket.id, name: username };
    lobbies[accessCode].addUser(user);
    socket.join(accessCode);
    socket.emit("lobby_good", { message: "Lobby is good to join!" });
    io.to(accessCode).emit("lobby_users", lobbies[accessCode].users);
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
          io.to(accessCode).emit("start_game", lobbies[accessCode].users);
        }
      }, 1000);
    }
  });
  socket.on("leave_lobby", (accessCode) => {
    if (lobbies[accessCode]) {
      const username = lobbies[accessCode].findUsername(socket.id);
      if (username) {
        lobbies[accessCode].deleteUser(username.name);
        io.to(accessCode).emit("lobby_users", lobbies[accessCode].users);
      }
      if (lobbies[accessCode].empty()) {
        delete lobbies[accessCode];
      }
    }
    socket.leave(accessCode);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
/* Reset and Repopulate the Database (with data from /data/backup.json) */
app.get("/ADMINRESET", async (req, res) => {
  try {
    await resetDB();
  } catch (error) {
    console.error("Error Reseting Database: ", error);
  }
});

/* Start The Server */
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
