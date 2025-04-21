/*
Functions called from Server to modify the Player Collections.
*/
import { MongoClient } from "mongodb";

const uri = 'mongodb+srv://Admin:Password@study-studio.htgro.mongodb.net/?retryWrites=true&w=majority&appName=Study-Studio';
const _dbName = 'Player';
const _collectionName = 'Collection';


export async function removePlayerFromDB(dbName = _dbName, collectionName, id) {

    const client = new MongoClient(uri, { monitorCommands : true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        if(!collection) {
            console.log("Collection does not exist");
            return collection;
        }

        const result = await collection.deleteOne({id: id});
        console.log("Removed player from player collection: ", id);
        return result;
    }
    catch(err) {
        console.error("Failed to remove player from collection.");
    }
    finally {
        await client.close();
    }
}

export async function clearCollection(dbName = _dbName, collectionName) {

    const client = new MongoClient(uri, { monitorCommands : true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        if(!collection) {
            console.log("Collection does not exist");
            return collection;
        }

        const result = await collection.deleteMany({});

    }
    finally {
        await client.close();
    }

}

export async function addPlayerToDB(dbName = _dbName, collectionName = _collectionName, id, loc, x, y, numAPlusses) {
    
    const client = new MongoClient(uri, { monitorCommands : true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.updateOne(
            { id }, 
            {$setOnInsert: { id, loc, x, y, numAPlusses }}, 
            { upsert: true } 
        );
        
        //Ensures a player is added to collection once.
        //Async functions can run twice at the same time, resulting in possible duplicates.
        if (result.upsertedCount > 0) {
            console.log("New player added: ", id);
            return { success: true, player: { id, loc, x, y, numAPlusses } };
        } else {
            console.log("Player ID already exists.");
            return { success: false };
        }


    } catch (err) {
        console.error("ERROR ADDING PLAYER TO DATABASE",  err);
    } finally {
        await client.close();
    }
}

export async function updatePlayerInfo(dbName = _dbName, collectionName = _collectionName, id, loc, x, y, numAPlusses) {
    
    const client = new MongoClient(uri, { monitorCommands : true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const existingPlayer = await collection.updateOne(
            {id: id },
            {$set: {loc, x, y, numAPlusses} },
            {upsert: false }
        );

        if(!existingPlayer) {
            console.log("Player does not exist in database.");
        }
        else {
            console.log("Updated player information");
        }
    }
    catch (err) {
        console.log("ERROR UPDATING PLAYER INFORMATION.", err);
    }
    finally {
        await client.close();
    }
    
}

export async function getPlayerData(dbName = _dbName, collectionName = _collectionName, id) {
    
    const client = new MongoClient(uri, { monitorCommands : true });
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const existingPlayer = await collection.findOne({id: id});
        return existingPlayer;
    }
    catch (err) {
        console.log("ERROR GETTING PLAYER DATA.", err);
    }
    finally {
        await client.close();
    }
}

export async function getAllPlayerData(dbName = _dbName, collectionName = _collectionName) {
    const client = new MongoClient(uri, { monitorCommands : true });
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const players = await collection.find().toArray();
        console.log("Players in collection:", players);
        return players;
    }
    catch (err) {
        console.log("ERROR GETTING PLAYER DATA.", err);
    }
    finally {
        await client.close();
    }
}
