const { MongoClient } = require('mongodb'); // allows JS to connect to MongoDB
const fs = require('fs');   // enables JS to interact with the filesystem

/*  Input Parameters:
    - uri: Connection String
    - dbName: Name of the Database
    - collectionName: Name of the subset of data
    - filePath: Where the json file will be written
*/
async function exportCollectionToJson(uri, dbName, collectionName, filePath) {  // async requires the function to return a 'promise' [https://www.w3schools.com/js/js_promise.asp]
  const client = new MongoClient(uri, { monitorCommands : true });  // Initialize MongoClient class (with debugging enabled)

  try {
    await client.connect();
    const db = client.db(dbName);
    /*  How an entry in the Collection looks:
        - id (ObjectId): unique identifier for each question/answer set
        - question (string)
        - options (array of strings)
        - answer (string)
    */
    const collection = db.collection(collectionName);
    const data = await collection.find({}, { projection: { _id: 0 } }).toArray(); // Takes all entries from the collection, omitting the 'id' field
    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFileSync(filePath, jsonData);
    console.log(`Data from '${collectionName}' exported to '${filePath}'`);
  } catch (err) {
    console.error('Error exporting data:', err);
  } finally {
    await client.close();
  }
}

/* TODO: FIGURE OUT HOW TO CALL SPECIFIC COLLECTION BASED OFF USER INPUT (E.G., PICK ONLY OS QUESTIONS) */
const uri = 'mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio';
const dbName = 'Database';
const collectionName = 'Collection';
const filePath = './data/exported_data.json';

exportCollectionToJson(uri, dbName, collectionName, filePath);