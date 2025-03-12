import { MongoClient } from 'mongodb'; // allows JS to connect to MongoDB
import fs from 'fs';   // enables JS to interact with the filesystem
import path from 'path';

const uri = 'mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio';
const _dbName = 'Database';
const _collectionName = 'Collection';
const _defaultExportPath = path.join(import.meta.dirname, '..', 'src', 'data', 'export_to_mongo.json'); // file being read from
const _backupExportPath = path.join(import.meta.dirname, '..', 'src', 'data', 'backup.json');

export async function exportJsonToMongo(dbName = _dbName, collectionName = _collectionName, jsonFilePath = _defaultExportPath) {
    const client = new MongoClient(uri, { monitorCommands : true });
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const jsonData = fs.readFileSync(jsonFilePath); // read from json
        const data = JSON.parse(jsonData);  // parse into objects
        const result = await collection.insertMany(data);   // Insert all the data into the db
        
        console.log(`${result.insertedCount} documents were inserted into ${collectionName}`);
    } catch (err) {
        console.error("Error exporting data to MongoDB:", err);
    } finally {
        await client.close();
    }
}

export async function resetDB(dbName = _dbName, collectionName = _collectionName, jsonFilePath = _backupExportPath) {
    const client = new MongoClient(uri, { monitorCommands : true });
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        collection.deleteMany({});
        console.log(`Deleted all entries from ${collectionName}`);

        const jsonData = fs.readFileSync(jsonFilePath); // read from json
        const data = JSON.parse(jsonData);  // parse into objects
        const result = await collection.insertMany(data);   // Insert all the data into the db

        console.log(`${result.insertedCount} documents were inserted into ${collectionName}`);
    } catch (err) {
        console.error("Error exporting data to MongoDB:", err);
    } finally {
        await client.close();
    }
}