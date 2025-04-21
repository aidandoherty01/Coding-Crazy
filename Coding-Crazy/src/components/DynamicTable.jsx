/*
    Inspired by: https://www.youtube.com/watch?v=EMzHo4GO2qg
*/

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText
} from "@mui/material";

const DynamicTable = ({ collection }) => {
    /* Safety Check */
    if (!collection.length) {
        return <Typography variant="body1" sx={{ mt: 2, textAlign: "center", color: "#cbd5e1" }}>No data loaded.</Typography>;
    }

    return (
        <TableContainer component={Paper} sx={{ bgcolor: "#1e293b", mt: 4, borderRadius: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {/* Table Headers */}
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Question</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Options</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Answer</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Map each item to a column */}
                    {collection.map(({ question, options, answer }, index) => (
                        <TableRow key={index}>
                            <TableCell sx={{ color: "#cbd5e1" }}>{question}</TableCell>
                            <TableCell>
                                <List dense>
                                    {options.map((opt, i) => (
                                        <ListItem key={i} disablePadding>
                                            <ListItemText primary={opt} sx={{ color: "#cbd5e1" }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </TableCell>
                            <TableCell sx={{ color: "#cbd5e1" }}>{answer}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DynamicTable;