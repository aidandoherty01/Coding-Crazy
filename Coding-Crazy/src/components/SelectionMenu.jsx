import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

function SelectionMenu({ onSelect }) {
    const [subjects, setSubjects] = useState([]);
    const [selected, setSelected] = useState("");

    /* Retrieve study set from database */
    useEffect(() => {
        fetch("https://coding-crazy.onrender.com/subjects")
            .then((res) => res.json())
            .then((data) => setSubjects(data))
            .catch((error) => console.error("Error fetching subjects: ", error));
    }, []);

    /* Update selected value from dropdown menu */
    const handleChange = (event) => {
        const value = event.target.value;
        setSelected(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <Box sx={{ minWidth: 240, mx: "auto" }}>
            <FormControl fullWidth variant="filled">
                <InputLabel sx={{ color: "#cbd5e1" }}>Select a Subject</InputLabel>
                <Select
                    value={selected}
                    onChange={handleChange}
                    sx={{
                        bgcolor: "#334155",
                        color: "white",
                        "& .MuiSelect-icon": { color: "white" }, // dropdown arrow
                        "& .MuiSelect-filled.Mui-focused": {
                            bgcolor: "#334155"
                        }
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: "#1e293b",
                                color: "white"
                            }
                        }
                    }}
                >
                    <MenuItem value="">
                        <em style={{ color: "#cbd5e1" }}>None</em>
                    </MenuItem>
                    {subjects.map((subject) => (
                        <MenuItem key={subject} value={subject} sx={{ color: "#cbd5e1" }}>
                            {subject}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default SelectionMenu;