import { MongoClient } from 'mongodb'; // allows JS to connect to MongoDB
import fs from 'fs';   // enables JS to interact with the filesystem
import path from 'path';

/* TODO: FIGURE OUT HOW TO CALL SPECIFIC COLLECTION BASED OFF USER INPUT (E.G., PICK ONLY OS QUESTIONS) */
const uri = 'mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio';
const _dbName = 'Database';
const _collectionName = 'Collection';
/* Depending on where you run Node will determine the current workign directory.
To work around this, use the file path relative to the script!
Can't use __dirname because this is a module file, and vite prefers to work with these */
const _filePath = path.join(import.meta.dirname, '..', 'src', 'data', 'exported_data.json');
/*  Input Parameters:
- uri: Connection String
- dbName: Name of the Database
- collectionName: Name of the subset of data
- filePath: Where the json file will be written
*/
export async function exportCollectionToJson(dbName = _dbName, collectionName = _collectionName, filePath = _filePath) {  // async requires the function to return a 'promise' [https://www.w3schools.com/js/js_promise.asp]
  const client = new MongoClient(uri, { monitorCommands : true });  // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const data = await collection.find({}, { projection: { _id: 0 } }).toArray(); // Takes all entries from the collection, omitting the 'id' field
    
    const jsonData = JSON.stringify(data, null, 2);
    /* COULD POTENTIALLY USE 'AWAIT' IF FILE WRITING IS SLOW
    - if so, consider limiting the number of requests */
    fs.writeFileSync(filePath, jsonData);
    
    console.log(`'${collectionName}' exported to '${filePath}'`);
  } catch (err) {
    console.error('Error importing data: ', err);
  } finally {
    await client.close();
  }
}

export async function exportSubjectsToJson(dbName = _dbName, collectionName = _collectionName, filePath = _filePath) {  // async requires the function to return a 'promise' [https://www.w3schools.com/js/js_promise.asp]
  const client = new MongoClient(uri, { monitorCommands : true });  // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const data = await collection.distinct("Subject"); // Only returns unique subjects in the db
    
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);

    console.log(`Subjects from '${collectionName}' exported to '${filePath}'`);
  } catch (err) {
    console.error('Error importing data: ', err);
  } finally {
    await client.close();
  }
}