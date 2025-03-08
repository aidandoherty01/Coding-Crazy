import express from "express";
import cors from "cors";
import { exportCollectionToJson, exportSubjectsToJson } from "./getData.mjs";
import path from "path";
import { Server } from "socket.io";
import http from "http";

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS (to allow React to communicate with this server)

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow frontend to connect
    methods: ["GET", "POST"],
  },
});

// Store lobby users
const lobbies = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_lobby", ({ accessCode, username }) => {
    if (!lobbies[accessCode]) {
      lobbies[accessCode] = [];
    }
    const user = { id: socket.id, name: username };
    lobbies[accessCode].push(user);

    socket.join(accessCode);
    io.to(accessCode).emit("lobby_users", lobbies[accessCode]);
    socket.emit("lobby_users", lobbies[accessCode]);
  });

  socket.on("leave_lobby", (accessCode) => {
    if (lobbies[accessCode]) {
      lobbies[accessCode] = lobbies[accessCode].filter(
        (id) => id !== socket.id
      );
      io.to(accessCode).emit("lobby_users", lobbies[accessCode]);
    }
  });

  socket.on("disconnect", () => {
    for (const accessCode in lobbies) {
      lobbies[accessCode] = lobbies[accessCode].filter(
        (id) => id !== socket.id
      );
      io.to(accessCode).emit("lobby_users", lobbies[accessCode]);
    }
    console.log("User disconnected:", socket.id);
  });
});

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

/* Start The Server */
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
