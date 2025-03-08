import express from "express";
import cors from "cors";
import { exportCollectionToJson, exportSubjectsToJson } from "./getData.mjs";
import path from "path";

import http from "http";

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS (to allow React to communicate with this server)
app.use(express.json());

//const server = http.createServer(app);

// Store lobby users
const lobbies = {};

app.post("/join-lobby", (req, res) => {
  const { accessCode, username } = req.body;
  if (!lobbies[accessCode]) {
    lobbies[accessCode] = [];
  }
  const user = { id: Date.now(), name: username };
  lobbies[accessCode].push(user);

  res.status(200).json(lobbies[accessCode]);
});

app.post("/leave-lobby", (req, res) => {
  const { accessCode, username } = req.body;

  if (lobbies[accessCode]) {
    lobbies[accessCode] = lobbies[accessCode].filter(
      (user) => user.name !== username
    );
  }

  res.status(200).json(lobbies[accessCode]);
});

app.get("/lobby/:accessCode", (req, res) => {
  const { accessCode } = req.params;
  res.status(200).json(lobbies[accessCode] || []);
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
