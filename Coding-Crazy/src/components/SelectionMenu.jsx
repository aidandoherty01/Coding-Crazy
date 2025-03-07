import React, { useEffect, useState } from "react";

function SelectionMenu() {
    
    const [subjects, setSubjects] = useState([]);  // State to store unique subjects

    useEffect(() => {
        fetch("http://localhost:5000/subjects")    // Fetch the data
        .then((res) => res.json())  // Jsonify the data
        .then((data) => setSubjects(data))  // Store the subjects
        .catch((error) => console.error("Error fetching subjects: ", error));
    }, []); // empty dependencies field to ensure only executes once on component mount

    return (
        <select>
            <option value="">Select A Subject</option>
            {
                subjects.map((k, v) => (
                    <option key={k} value={v}>
                        {v}
                    </option>
                ))
            }
            <option value="">Sanity</option>
        </select>
    );
}

export default SelectionMenu;