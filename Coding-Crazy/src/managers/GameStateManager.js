/*
Functions called from Board Scene to server to manage player states.
*/

export async function callGetPlayerData(id) {
    
    try {
        const response = await fetch(`http://localhost:5000/get-player-data/${id}`);
        if (!response.ok) throw new Error('Failed to fetch player data');
        return await response.json();
    } 
    catch (error) {
        console.error('Error fetching player data:', error);
        return null;
    }
}

export async function callAddPlayer(playerData) {
    try {

        const response = await fetch("http://localhost:5000/add-player", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(playerData)
        })
        const result = await response.json();
        console.log("Add response result: ", result);
    } catch (err) {
        console.error("FAILED TO ADD PLAYER", err);
    }
}

export async function callRemovePlayer(id) {
    try {

        const response = await fetch(`http://localhost:5000/remove-player/${id}`, {
            method: 'DELETE'
        })

        const result = await response.json();
        console.log("Remove response result: ", result);

    } catch (err) {
        console.error("FAILED TO REMOVE PLAYER", err);
    }
}

export async function callUpdatePlayerInfo(id, newLoc, x, y, numAPlusses) {
    try {
        const response = await fetch("http://localhost:5000/update-player-info", {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id, loc: newLoc, x, y, numAPlusses})
        })
        const result = await response.json();
        console.log("Update player response result: ", result);
    }
    catch (error) {
        console.log("FAILED TO UPDATE PLAYER INFORMATION");
    }
}

