import { MongoClient } from "mongodb"; // allows JS to connect to MongoDB
import fs from "fs"; // enables JS to interact with the filesystem
import path from "path";

const uri =
  "mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio";
const dbName = "Database";
const _studySetCollection = "Collection";
const _accountCollection = "Accounts";
const _sessionCollection = "Sessions";
/* Depending on where you run Node will determine the current workign directory.
To work around this, use the file path relative to the script!
Can't use __dirname because this is a module file, and vite prefers to work with these */
const _exportPath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "exported_data.json"
); // Standard export operations
const _questionsPath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "questions.json"
); // Load questions for game
const _sessionPath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "session_data.json"
);
/*  Input Parameters:
- uri: Connection String
- dbName: Name of the Database
- collectionName: Name of the subset of data
- filePath: Where the json file will be written
*/
export async function exportCollectionToJson(
  collectionName = _studySetCollection,
  filePath = _exportPath
) {
  // async requires the function to return a 'promise' [https://www.w3schools.com/js/js_promise.asp]
  const client = new MongoClient(uri, { monitorCommands: true }); // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray(); // Takes all entries from the collection, omitting the 'id' field

    const jsonData = JSON.stringify(data, null, 2);
    /* COULD POTENTIALLY USE 'AWAIT' IF FILE WRITING IS SLOW
    - if so, consider limiting the number of requests */
    fs.writeFileSync(filePath, jsonData);

    console.log(`'${collectionName}' exported to '${filePath}'`);
  } catch (err) {
    console.error("Error importing data: ", err);
  } finally {
    await client.close();
  }
}

export async function exportUniqueSubjectsToJson(filePath = _exportPath) {
  const client = new MongoClient(uri, { monitorCommands: true }); // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(_studySetCollection);

    const data = await collection.distinct("subject"); // Only returns unique subjects in the db

    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);

    console.log(
      `Subjects from '${_studySetCollection}' exported to '${filePath}'`
    );
  } catch (err) {
    console.error("Error importing data: ", err);
  } finally {
    await client.close();
  }
}

/* Exports specified study set to questions.json */
export async function exportStudySetToJson(
  _subject,
  filePath = _questionsPath
) {
  const client = new MongoClient(uri, { monitorCommands: true }); // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(_studySetCollection);

    /* Check if the subject exists in the collection */
    const exists = await collection.findOne({ subject: _subject });
    if (!exists) {
      throw new Error(`No questions found for subject: ${_subject}`);
    }

    /* Return questions with matching subject */
    const data = await collection
      .find({ subject: _subject }, { projection: { _id: 0, subject: 0 } }) // Match on specified subject, omitting id and subject in returned data
      .toArray();
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);

    console.log(
      `${_subject} questions from '${_studySetCollection}' exported to '${filePath}'`
    );
  } catch (err) {
    console.error("Error importing data: ", err);
  } finally {
    await client.close();
  }
}

export async function exportAccountToJson(
  _username,
  _password,
  filePath = _exportPath
) {
  const client = new MongoClient(uri, { monitorCommands: true }); // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(_accountCollection);

    /* Check if username and password combination exists */
    const user = await collection.findOne({
      username: _username,
      password: _password,
    });
    if (!user) {
      throw new Error(`Incorrect username or password.`);
    }

    /* Return questions with matching subject */
    const jsonData = JSON.stringify(user, null, 2);
    fs.writeFileSync(filePath, jsonData);

    console.log(`Account exported to '${filePath}'`);
  } catch (err) {
    console.error('Error importing data: ', err);
    throw new Error(err); // Throw an error to server so it can be relayed to the client
  } finally {
    await client.close();
  }
}

export async function exportSessionToJson(_roomCode, filePath = _sessionPath) {
  const client = new MongoClient(uri, { monitorCommands: true }); // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(_sessionCollection);
    console.log("_RC", _roomCode);

    /* Check if username and password combination exists */
    const session = await collection.findOne({ roomCode: _roomCode });
    if (!session) {
      throw new Error(`Game doesn't exist`);
    }

    /* Return questions with matching subject */
    const jsonData = JSON.stringify(session, null, 2);
    fs.writeFileSync(filePath, jsonData);

    console.log(`Session exported to '${filePath}'`);
  } catch (err) {
    console.error("Error importing data: ", err);
    throw new Error(err); // Relay error to server
  } finally {
    await client.close();
  }
}
