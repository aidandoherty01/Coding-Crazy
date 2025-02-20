const { MongoClient } = require('mongodb'); // connect to mongodb
const fs = require('fs');   // filesystem

const uri = 'mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio';
const dbName = 'Database';
const collectionName = 'Collection';
const jsonFilePath = './data/export_to_mongo.json'; // file being read from

async function exportJsonToMongo() {
    const client = new MongoClient(uri, { monitorCommands : true });
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const jsonData = fs.readFileSync(jsonFilePath); // read from json
        const data = JSON.parse(jsonData);  // parse into objects

        const result = await collection.insertMany(data);   // Insert all the data into the db
        console.log(`${result.insertedCount} documents were inserted into the collection`);
    } catch (err) {
        console.error("Error exporting data to MongoDB:", err);
    } finally {
        await client.close();
    }
}

exportJsonToMongo();