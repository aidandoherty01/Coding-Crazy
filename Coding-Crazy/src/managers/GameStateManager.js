export async function getPlayerData(id) {
    
    console.log("PLAYER ID FROM GETPLAYERTEST: " + id);

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

export async function addPlayerToDB(playerData) {
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

export async function updatePlayerInfo(id, newLoc, x, y, numAPlusses) {
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

//export default GameStateManager;