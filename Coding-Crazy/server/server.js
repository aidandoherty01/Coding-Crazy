import express from "express";
import cors from "cors";
import { exportCollectionToJson, exportStudySetToJson, exportUniqueSubjectsToJson } from "./getData.mjs";
import { resetDB } from "./sendData.mjs"
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
app.get("/collection/:subject?", async (req, res) => {
  try {
    if(req.params.subject) {  // Return study set of specified subject
      await exportStudySetToJson(req.params.subject); // No response is sent since file is directly accessed from hard-coded path in QuestionScene.js
    } else {  // Return entire collection
      await exportCollectionToJson();
      res.sendFile(
        path.join(import.meta.dirname, "..", "src", "data", "exported_data.json")
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

/* Reset and Repopulate the Database (with data from /data/backup.json) */
app.get("/ADMINRESET", async (req, res) => {
  try {
    await resetDB();
  } catch(error) {
    console.error("Error Reseting Database: ", error);
  }
});

/* Start The Server */
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
