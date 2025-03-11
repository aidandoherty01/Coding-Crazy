import express from "express";
import cors from "cors";
import { exportCollectionToJson, exportSubjectsToJson } from "./getData.mjs";
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

/*Get Collection*/
app.get("/collection", async (req, res) => {
  try {
    await exportCollectionToJson();
    res.sendFile(
      path.join(import.meta.dirname, "..", "src", "data", "exported_data.json")
    );
  } catch (error) {
    console.error("Fetching Collection Failed: ", error);
  }
});

/*Get Subjects*/
app.get("/subjects", async (req, res) => {
  try {
    await exportSubjectsToJson();
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
    console.log(accessCode, username);
    if (!lobbies[accessCode]) {
      lobbies[accessCode] = new Lobby(accessCode);
    }

    if (lobbies[accessCode].full()) {
      socket.emit("lobby_full", { message: "Lobby is full" });
      return;
    }

    const user = { id: socket.id, name: username };
    lobbies[accessCode].addUser(user);
    socket.join(accessCode);
    console.log(lobbies[accessCode]);
    io.to(accessCode).emit("lobby_users", lobbies[accessCode].users);
  });
  socket.on("leave_lobby", (accessCode) => {
    console.log("Stupid person id is ", socket.id);
    if (lobbies[accessCode]) {
      const username = lobbies[accessCode].findUsername(socket.id);
      console.log(username);
      if (username) {
        lobbies[accessCode].deleteUser(username.name);
        io.to(accessCode).emit("lobby_users", lobbies[accessCode].users);
      }
    }
    socket.leave(accessCode);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* Start The Server */
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
