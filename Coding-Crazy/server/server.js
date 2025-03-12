import express from "express";
import cors from "cors";
import { exportCollectionToJson, exportSubjectsToJson } from "./getData.mjs";
import path from "path";
import { Lobby } from "./lobbyClass.js";

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS (to allow React to communicate with this server)
app.use(express.json());

// Store lobby users
const lobbies = {};

app.post("/join-lobby", (req, res) => {
  const { accessCode, username } = req.body;
  if (!lobbies[accessCode]) {
    lobbies[accessCode] = new Lobby(accessCode);
    //In the future, we'll add other data here like max players as well
  }

  if (lobbies[accessCode].full()) {
    return res.status(400).json({ message: "Lobby is full" }); // Reject if full
  } else {
    const user = { id: Date.now(), name: username };
    lobbies[accessCode].addUser(user);
    res.status(200).json(lobbies[accessCode] ? lobbies[accessCode].users : []);
  }
});

app.post("/leave-lobby", (req, res) => {
  const { accessCode, username } = req.body;

  if (lobbies[accessCode]) {
    lobbies[accessCode].deleteUser(username);
  }

  res.status(200).json(lobbies[accessCode] ? lobbies[accessCode].users : []);
});

app.get("/lobby/:accessCode", (req, res) => {
  const { accessCode } = req.params;
  res.status(200).json(lobbies[accessCode] ? lobbies[accessCode].users : []);
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
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
