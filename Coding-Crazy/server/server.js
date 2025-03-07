import express from "express";
import cors from "cors";
import { exportCollectionToJson, exportSubjectsToJson } from "./getData.mjs"
import path from "path";

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS (to allow React to communicate with this server)

/*Get Collection*/
app.get("/collection", async (req, res) => {
    try {
        await exportCollectionToJson();
        res.sendFile(path.join(import.meta.dirname, '..', 'src', 'data', 'exported_data.json'))
    } catch(error) {
        console.error("Fetching Collection Failed: ", error);
    }
});

/*Get Subjects*/
app.get("/subjects", async (req, res) => {
    try {
        await exportSubjectsToJson();
        res.sendFile(path.join(import.meta.dirname, '..', 'src', 'data', 'exported_data.json'))
    } catch(error) {
        console.error("Fetching Subjects Failed: ", error);
    }
});

/* Start The Server */
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
