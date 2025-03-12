import React, { useEffect, useState } from "react";

function SelectionMenu({onSelect}) {
    
    const [subjects, setSubjects] = useState([]);  // State to store unique subjects

    useEffect(() => {
        /*Potentially make change to allow custom url for scalability or sum*/
        fetch("http://localhost:5000/subjects")    // Fetch the data
        .then((res) => res.json())  // Jsonify the data
        .then((data) => setSubjects(data))  // Store the subjects
        .catch((error) => console.error("Error fetching subjects: ", error));
    }, []); // empty dependencies field to ensure only executes once on component mount

    const handleChange = (event) => {
        if (onSelect) { // If event was an onSelect
            onSelect(event.target.value);    // when selection menu option is changed, update selected value
            console.log("Selected value: ", event.target.value);
        }
    };

    return (
        <select onChange={handleChange}>
            <option value="">Select A Subject</option>
            {
                subjects.map((e) => (   // for each item in subjects, create an option
                    <option key={e} value={e}>{e}</option>
                ))
            }
        </select>
    );
}

export default SelectionMenu;