import { MongoClient } from "mongodb"; // allows JS to connect to MongoDB
import fs from "fs"; // enables JS to interact with the filesystem
import path from "path";

const uri =
  "mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio";
const dbName = "Database";
const _collectionName = "Collection";
const _accountName = "Accounts";
const _sessionName = "Sessions";

const _defaultExportPath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "export_to_mongo.json"
); // file being read from
const _defaultUpdatePath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "update_to_mongo.json"
);
const _backupExportPath = path.join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "backup.json"
);

/* Send a json document to a specified collection (correct fomatting is checked in calling program) */
export async function exportJsonToMongo(
  collectionName = _collectionName,
  jsonFilePath = _defaultExportPath
) {
  const client = new MongoClient(uri, { monitorCommands: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const jsonData = fs.readFileSync(jsonFilePath); // read from json
    const data = JSON.parse(jsonData); // parse into objects

    const result = await collection.insertMany(data); // Insert all the data into the db

    console.log(
      `${result.insertedCount} documents were inserted into ${collectionName}`
    );
  } catch (err) {
    console.error("Error exporting data to MongoDB:", err);
    throw new Error(`${err.message}`);
  } finally {
    await client.close();
  }
}

export async function updateRoom(
  collectionName,
  jsonFilePath = _defaultUpdatePath
) {
  const client = new MongoClient(uri, { monitorCommands: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const jsonData = fs.readFileSync(jsonFilePath);
    const data = JSON.parse(jsonData);

    // console.log("Parsed ", data);

    if (!Array.isArray(data)) {
      throw new Error("JSON data must be an array of objects");
    }

    let updatedCount = 0;

    for (const item of data) {
      if (!item.roomCode) {
        console.warn("Skipping item without roomCode:", item);
        continue;
      }

      const result = await collection.replaceOne(
        { roomCode: item.roomCode }, // Match by roomCode
        item, // Replace with new data
        { upsert: true } // Insert if not found
      );

      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        updatedCount++;
      }
    }

    console.log(
      `${updatedCount} documents were updated or inserted in ${collectionName}`
    );
  } catch (err) {
    console.error("Error updating MongoDB:", err);
    throw new Error(err.message);
  } finally {
    await client.close();
  }
}

export async function resetDB(
  collectionName = _collectionName,
  jsonFilePath = _backupExportPath
) {
  const client = new MongoClient(uri, { monitorCommands: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    collection.deleteMany({});
    console.log(`Deleted all entries from ${collectionName}`);

    const jsonData = fs.readFileSync(jsonFilePath); // read from json
    const data = JSON.parse(jsonData); // parse into objects
    const result = await collection.insertMany(data); // Insert all the data into the db

    console.log(
      `${result.insertedCount} document(s) were inserted into ${collectionName}`
    );
  } catch (err) {
    console.error("Error exporting data to MongoDB:", err);
  } finally {
    await client.close();
  }
}

/* Remove specified item from DB */
export async function removeEntryFromDB(
  collectionName,
  jsonFilePath = _defaultExportPath
) {
  const client = new MongoClient(uri, { monitorCommands: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const jsonData = fs.readFileSync(jsonFilePath); // read from json
    const data = JSON.parse(jsonData); // parse into objects

    /* Collection */
    if(collectionName == _collectionName) {
      console.log("collection");
      // removing questions from study sets
    }
    /* Accounts */
    else if (collectionName == _accountName) {
      console.log("account");
      await collection.deleteMany({
        username : { $in : data.username } // 'in' modifier checks if value matches in array of items (usernames)
      });
    }
    /* Sessions */
    else if (collectionName == _sessionName) {
      console.log("session");
      // removing game lobbies
      
    }
    
    else { throw new Error(`Invalid collection name: ${collectionName}`); }

    console.log(`Removed entries from ${collectionName}.`);

  } catch (err) {
    console.error("Error removing entry from MongoDB:", err);
    throw new Error(`${err.message}`);
  } finally {
    await client.close();
  }
}